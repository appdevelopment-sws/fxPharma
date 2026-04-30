import bcrypt from "bcryptjs";
import { AuthRepository } from "./auth.repository.js";
import { PermissionResolverService } from "../../services/PermissionResolverService.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

/**
 * AuthService handles business logic for user authentication, registration, 
 * and profile retrieval.
 */
export class AuthService {
  /**
   * Formats the user record for API responses.
   */
  static formatUserPayload(user: any, resolved?: { role: string; permissions: string[] }) {
    return {
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
    };
  }

  static async register(data: {
    companyName: string;
    name: string;
    email: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const { organization, branch, user } = await AuthRepository.createOrganizationWithAdmin({
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
      user: this.formatUserPayload(user),
    };
  }

  static async loginUser(email: string, password: string) {
    const user = await AuthRepository.findUserForLogin(email.trim().toLowerCase());

    if (!user || user.status !== 1) {
      throw new ErrorHandler("Invalid credentials or account disabled", 401);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new ErrorHandler("Invalid credentials", 401);
    }

    // Record last login (fire and forget)
    AuthRepository.withRootTransaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    });

    return this.formatUserPayload(user);
  }

  static async getUserById(id: string, branchId?: string | null) {
    const user = await AuthRepository.findUserById(id);

    if (!user || user.status !== 1) {
      throw new ErrorHandler("User not found or disabled", 404);
    }

    const [roleKeys, permissionKeys] = await Promise.all([
      PermissionResolverService.resolveEffectiveRoleKeys(id, branchId),
      PermissionResolverService.resolveEffectivePermissionKeys(id, branchId),
    ]);

    const resolvedRole = roleKeys[0] || (user.roles.length > 0 ? "User" : "Unauthorized");

    return this.formatUserPayload(user, {
      role: resolvedRole,
      permissions: permissionKeys,
    });
  }
}
