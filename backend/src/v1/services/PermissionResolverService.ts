import { rootPrisma } from "@/lib/prisma.js";

const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export class PermissionResolverService {
  static async resolveEffectiveRoleKeys(userId: string, branchId?: string | null) {
    const memberships = await rootPrisma.organizationMember.findMany({
      where: {
        userId,
        ...(branchId
          ? {
              branches: {
                some: {
                  branchId,
                },
              },
            }
          : {}),
      },
      include: {
        role: true,
      },
    });

    return uniq(memberships.map((membership) => membership.role?.key || ""));
  }

  static async resolveEffectivePermissionKeys(
    userId: string,
    branchId?: string | null
  ) {
    const memberships = await rootPrisma.organizationMember.findMany({
      where: {
        userId,
        ...(branchId
          ? {
              branches: {
                some: {
                  branchId,
                },
              },
            }
          : {}),
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const permissions: string[] = [];

    for (const membership of memberships) {
      for (const rolePermission of membership.role?.permissions ?? []) {
        permissions.push(rolePermission.permission.key);
      }

      for (const directPermission of membership.permissions ?? []) {
        if (directPermission.allowed) {
          permissions.push(directPermission.permission.key);
        }
      }
    }

    return uniq(permissions);
  }
}
