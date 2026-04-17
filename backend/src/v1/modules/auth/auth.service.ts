import bcrypt from "bcryptjs";
import * as authRepository from "./auth.repository.js";
import { PermissionResolverService } from "../../services/PermissionResolverService.js";

/**
 * Formats the user record for API responses.
 * Since RBAC is now scoped, it returns the base user info and their 
 * organization/branch memberships.
 * 
 * If a scope (branchId) is provided, it also returns the resolved role and permissions.
 */
const formatUserPayload = (user: any, resolved?: { role: string; permissions: string[] }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  role: resolved?.role,
  permissions: resolved?.permissions,
  memberships: user.roles.map((ur: any) => ({
    role: ur.role.key,
    roleName: ur.role.name,
    level: ur.role.level,
    scopeType: ur.scopeType,
    scopeId: ur.scopeId,
    branchName: ur.branch?.name,
  })),
  createdAt: user.createdAt,
});

export const register = async (data: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const { organization, branch, user } = await authRepository.createOrganizationWithAdmin({
    organization: {
      name: data.companyName.trim(),
    },
    adminUser: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
    },
  });

  return {
    organization,
    branch,
    user: formatUserPayload(user),
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await authRepository.findUserForLogin(email.trim().toLowerCase());

  if (!user || user.status !== 1) {
    throw new Error("Invalid credentials or account disabled");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  // Record last login (fire and forget)
  authRepository.withRootTransaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  });

  return formatUserPayload(user);
};

export const getUserById = async (id: string, branchId?: string | null) => {
  const user = await authRepository.findUserById(id);

  if (!user || user.status !== 1) {
    throw new Error("User not found or disabled");
  }

  // Resolve roles and permissions for the requested branch scope
  const [roleKeys, permissionKeys] = await Promise.all([
    PermissionResolverService.resolveEffectiveRoleKeys(id, branchId),
    PermissionResolverService.resolveEffectivePermissionKeys(id, branchId),
  ]);

  // Pick the most relevant role (e.g., the first one resolved in that scope)
  const resolvedRole = roleKeys[0] || (user.roles.length > 0 ? "User" : "Unauthorized");

  return formatUserPayload(user, {
    role: resolvedRole,
    permissions: permissionKeys,
  });
};
