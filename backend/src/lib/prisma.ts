import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getTenantId, shouldBypassTenant } from "./tenantContext.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

const tenantScopedModels = new Set(["User", "Role"]);

const tenantUniqueFields: Record<string, string[]> = {
  User: ["email"],
  Role: ["name"],
};

const rootPrisma = new PrismaClient({ adapter });

const getCompositeKeyName = (model: string, field: string) =>
  `tenantId_${field}`;

const mergeTenantWhere = (
  where: Record<string, unknown> | undefined,
  tenantId: string,
) => {
  if (!where) {
    return { tenantId };
  }

  return {
    AND: [where, { tenantId }],
  };
};

const enforceTenantIdOnCreate = (
  model: string,
  tenantId: string,
  payload: Record<string, unknown>,
) => {
  if ("tenantId" in payload && payload.tenantId !== tenantId) {
    throw new Error(
      `${model} write attempted with a tenantId that does not match the authenticated tenant`,
    );
  }

  return {
    ...payload,
    tenantId,
  };
};

const rewriteTenantUniqueWhere = (
  model: string,
  where: Record<string, unknown> | undefined,
  tenantId: string,
) => {
  if (!where) {
    throw new Error(
      `Missing where clause for tenant-scoped ${model} unique operation`,
    );
  }

  for (const field of tenantUniqueFields[model] ?? []) {
    const fieldValue = where[field];

    if (fieldValue !== undefined) {
      return {
        [getCompositeKeyName(model, field)]: {
          tenantId,
          [field]: fieldValue,
        },
      };
    }
  }

  return where;
};

export const prisma = rootPrisma.$extends({
  name: "tenant-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !tenantScopedModels.has(model) || shouldBypassTenant()) {
          return query(args);
        }

        const tenantId = getTenantId();

        if (!tenantId) {
          throw new Error(
            `Missing tenant context for ${model}.${operation}. Use authenticated tenant middleware before accessing tenant-scoped models.`,
          );
        }

        const mutableArgs = { ...(args ?? {}) } as Record<string, any>;

        switch (operation) {
          case "findMany":
          case "findFirst":
          case "findFirstOrThrow":
          case "count":
          case "aggregate":
          case "groupBy":
          case "updateMany":
          case "deleteMany":
            mutableArgs.where = mergeTenantWhere(mutableArgs.where, tenantId);
            break;
          case "findUnique":
          case "findUniqueOrThrow":
          case "update":
          case "delete":
            mutableArgs.where = rewriteTenantUniqueWhere(
              model,
              mutableArgs.where,
              tenantId,
            );
            break;
          case "upsert":
            mutableArgs.where = rewriteTenantUniqueWhere(
              model,
              mutableArgs.where,
              tenantId,
            );
            mutableArgs.create = enforceTenantIdOnCreate(
              model,
              tenantId,
              mutableArgs.create ?? {},
            );
            break;
          case "create":
            mutableArgs.data = enforceTenantIdOnCreate(
              model,
              tenantId,
              mutableArgs.data ?? {},
            );
            break;
          case "createMany":
            mutableArgs.data = Array.isArray(mutableArgs.data)
              ? mutableArgs.data.map((entry: Record<string, unknown>) =>
                  enforceTenantIdOnCreate(model, tenantId, entry),
                )
              : enforceTenantIdOnCreate(
                  model,
                  tenantId,
                  mutableArgs.data ?? {},
                );
            break;
          default:
            break;
        }

        return query(mutableArgs);
      },
    },
  },
});

export { rootPrisma };
