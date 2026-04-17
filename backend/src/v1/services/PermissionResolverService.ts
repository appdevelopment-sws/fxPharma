import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

export class PermissionResolverService {
  /**
   * Resolves all effective permissions for a user within a specific scope.
   * Logic:
   * 1. Super Admin Bypass (Role level >= 100 or scope GLOBAL 'super_admin')
   * 2. Collect permissions from Roles (direct + via Workflows)
   * 3. Collect permissions from direct User Workflows
   * 4. Apply direct User Permission Overrides (Grants/Revokes)
   */
  static async resolveEffectivePermissionKeys(
    userId: string,
    scopeId?: string | null
  ): Promise<string[]> {
    // 1. Fetch User with all assignments
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
                workflows: {
                  include: {
                    workflow: {
                      include: {
                        permissions: { include: { permission: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        workflows: {
          include: {
            workflow: {
              include: {
                permissions: { include: { permission: true } },
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

    if (!user) return [];

    // 2. Super Admin Bypass
    const isSuperAdmin = user.roles.some(
      (ur) => ur.role.level >= 100 || ur.role.key === "super_admin"
    );

    if (isSuperAdmin) {
      // If super admin, return all system permissions
      const allPermissions = await prisma.permission.findMany({
        select: { key: true },
      });
      return allPermissions.map((p) => p.key);
    }

    const permissionKeys = new Set<string>();

    // 3. Filter assignments by scope
    // We include GLOBAL scope assignments and assignments matching the target scopeId
    const relevantRoles = user.roles.filter(
      (ur) => ur.scopeType === "global" || ur.scopeId === scopeId
    );
    const relevantWorkflows = user.workflows.filter(
      (ur) => ur.scopeType === "global" || ur.scopeId === scopeId
    );
    const relevantOverrides = user.permissions.filter(
      (ur) => ur.scopeType === "global" || ur.scopeId === scopeId
    );

    // 4. Collect from Roles
    for (const ur of relevantRoles) {
      // Direct Role Permissions
      ur.role.permissions.forEach((rp) => permissionKeys.add(rp.permission.key));
      
      // Workflow Permissions inherited by Role
      ur.role.workflows.forEach((rw) => {
        rw.workflow.permissions.forEach((wp) =>
          permissionKeys.add(wp.permission.key)
        );
      });
    }

    // 5. Collect from Direct User Workflows
    for (const uw of relevantWorkflows) {
      uw.workflow.permissions.forEach((wp) =>
        permissionKeys.add(wp.permission.key)
      );
    }

    // 6. Apply Direct Overrides (precendence: Revokes take priority or applied last)
    // First apply grants
    relevantOverrides
      .filter((up) => up.granted === true)
      .forEach((up) => permissionKeys.add(up.permission.key));

    // Then apply revokes (Explicitly remove)
    relevantOverrides
      .filter((up) => up.granted === false)
      .forEach((up) => permissionKeys.delete(up.permission.key));

    return Array.from(permissionKeys);
  }

  /**
   * Checks if a user has a specific permission in a scope
   */
  static async hasPermission(
    userId: string,
    permissionKey: string,
    scopeId?: string | null
  ): Promise<boolean> {
    const permissions = await this.resolveEffectivePermissionKeys(userId, scopeId);
    return permissions.includes(permissionKey);
  }

  /**
   * Resolves all roles assigned to a user in a specific scope.
   */
  static async resolveEffectiveRoleKeys(
    userId: string,
    scopeId?: string | null
  ): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return [];

    const roleKeys = user.roles
      .filter((ur) => ur.scopeType === "global" || ur.scopeId === scopeId)
      .map((ur) => ur.role.key);

    return roleKeys;
  }

  /**
   * Checks if a user has a specific role in a scope
   */
  static async hasRole(
    userId: string,
    roleKey: string,
    scopeId?: string | null
  ): Promise<boolean> {
    const roles = await this.resolveEffectiveRoleKeys(userId, scopeId);
    return roles.includes(roleKey);
  }
}
