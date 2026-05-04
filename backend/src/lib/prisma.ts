import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  getOrganizationId,
  getBranchId,
  shouldBypassTenant,
} from "./tenantContext.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

// Models that are scoped to an Organization
const orgScopedModels = new Set<string>([
  // "Supplier",
  "Branch",
  "OrganizationFeature",
  "Supplier",
]);

// Models that are scoped to a Branch
const branchScopedModels = new Set<string>([
  // Add models here as they are implemented in schema.prisma with branchId
]);

const rootPrisma = new PrismaClient({ adapter });

export const prisma = rootPrisma.$extends({
  name: "tenant-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || shouldBypassTenant()) {
          return query(args);
        }

        const isOrgScoped = orgScopedModels.has(model);
        const isBranchScoped = branchScopedModels.has(model);

        if (!isOrgScoped && !isBranchScoped) {
          return query(args);
        }

        const orgId = getOrganizationId();
        const branchId = getBranchId();

        // Validation
        if (isOrgScoped && !orgId) {
          throw new Error(
            `Missing Organization context for ${model}.${operation}`,
          );
        }
        if (isBranchScoped && !branchId) {
          throw new Error(`Missing Branch context for ${model}.${operation}`);
        }

        const mutableArgs = { ...(args ?? {}) } as Record<string, any>;
        const tenantFilter = isOrgScoped
          ? { organizationId: orgId }
          : { branchId: branchId };

        switch (operation) {
          case "findMany":
          case "findFirst":
          case "findFirstOrThrow":
          case "count":
          case "aggregate":
          case "groupBy":
          case "updateMany":
          case "deleteMany":
            mutableArgs.where = { ...mutableArgs.where, ...tenantFilter };
            break;
          case "findUnique":
          case "findUniqueOrThrow":
          case "update":
          case "delete":
            // For unique operations, we still need to ensure the record belongs to the tenant
            mutableArgs.where = { ...mutableArgs.where, ...tenantFilter };
            break;
          case "create":
            mutableArgs.data = { ...mutableArgs.data, ...tenantFilter };
            break;
          case "createMany":
            if (Array.isArray(mutableArgs.data)) {
              mutableArgs.data = mutableArgs.data.map((item: any) => ({
                ...item,
                ...tenantFilter,
              }));
            } else {
              mutableArgs.data = { ...mutableArgs.data, ...tenantFilter };
            }
            break;
          case "upsert":
            mutableArgs.create = { ...mutableArgs.create, ...tenantFilter };
            mutableArgs.where = { ...mutableArgs.where, ...tenantFilter };
            break;
        }

        return query(mutableArgs);
      },
    },
  },
});

export { rootPrisma };
