import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma, rootPrisma } from "@/lib/prisma.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const userWithRoleAndPermissions = {
  include: {
    tenant: true,
    role: {
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    },
  },
} as const;

export const findUserForLogin = async (email: string) => {
  return rootPrisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    include: userWithRoleAndPermissions.include,
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: userWithRoleAndPermissions.include,
  });
};

export const findRoleByName = async (name: string) => {
  return prisma.role.findFirst({
    where: { name },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const createTenantWithAdmin = async (
  data: {
    tenant: {
      name: string;
    };
    adminUser: {
      name: string;
      email: string;
      passwordHash: string;
    };
  },
) => {
  return rootPrisma.$transaction(async (tx) => {
    const existingEmail = await tx.user.findFirst({
      where: {
        email: data.adminUser.email,
        deletedAt: null,
      },
    });

    if (existingEmail) {
      throw new Error("Email is already in use");
    }

    const tenant = await tx.tenant.create({
      data: {
        name: data.tenant.name,
      },
    });

    const permissions = await tx.permission.findMany();

    const adminRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: "Admin",
        description: "Tenant administrator with full tenant access",
        isDefault: true,
      },
    });

    const userRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: "User",
        description: "Default tenant user role",
        isDefault: true,
      },
    });

    const adminPermissionNames = new Set([
      "USER_CREATE",
      "USER_READ",
      "USER_UPDATE",
      "USER_DELETE",
      "ROLE_MANAGE",
    ]);

    await tx.rolePermission.createMany({
      data: permissions
        .filter((permission) => adminPermissionNames.has(permission.name))
        .map((permission) => ({
          roleId: adminRole.id,
          permissionId: permission.id,
        })),
    });

    const readPermission = permissions.find(
      (permission) => permission.name === "USER_READ",
    );

    if (readPermission) {
      await tx.rolePermission.create({
        data: {
          roleId: userRole.id,
          permissionId: readPermission.id,
        },
      });
    }

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        roleId: adminRole.id,
        ...data.adminUser,
      },
      include: userWithRoleAndPermissions.include,
    });

    return {
      tenant,
      user,
    };
  });
};

export const withRootTransaction = async <T>(
  callback: (tx: DbClient) => Promise<T>,
) => rootPrisma.$transaction((tx) => callback(tx));
