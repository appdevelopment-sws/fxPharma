import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import { PermissionResolverService } from "../v1/services/PermissionResolverService.js";

/**
 * Middleware to restrict access based on roles.
 * Context-aware: Looks for x-branch-id header for scoping.
 */
export const allowRoles = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const branchId = (req.headers["x-branch-id"] as string) || null;
      const userRoles = await PermissionResolverService.resolveEffectiveRoleKeys(
        req.user.id,
        branchId
      );

      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient Role" });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({ message: "Internal server error during authorization" });
    }
  };
};

/**
 * Middleware to restrict access based on specific permission keys.
 * Context-aware: Looks for x-branch-id header for scoping.
 */
export const allowPermissions = (...permissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const branchId = (req.headers["x-branch-id"] as string) || null;
      const userPermissions = await PermissionResolverService.resolveEffectivePermissionKeys(
        req.user.id,
        branchId
      );

      const hasRequiredPermissions = permissions.every((p) =>
        userPermissions.includes(p)
      );

      if (!hasRequiredPermissions) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();
    } catch (error) {
      console.error("Permission authorization error:", error);
      res.status(500).json({ message: "Internal server error during authorization" });
    }
  };
};
