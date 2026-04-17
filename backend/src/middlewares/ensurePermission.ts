import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import { PermissionResolverService } from "../v1/services/PermissionResolverService.js";

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Supports scoped checks (Branch level) or Global checks.
 *
 * Usage:
 * Route.get("/path", ensurePermission("users.create"), handler)
 */
export const ensurePermission = (permissionKey: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Extract Branch ID from common headers or params
      // You can customize this based on your API design
      const branchId =
        (req.headers["x-branch-id"] as string) || req.params.branchId || null;

      const effectivePermissions =
        await PermissionResolverService.resolveEffectivePermissionKeys(
          req.user.id,
          branchId as any,
        );

      if (!effectivePermissions.includes(permissionKey)) {
        return res.status(403).json({
          message: "Permission denied",
          required: permissionKey,
          scope: branchId || "global",
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res
        .status(500)
        .json({ message: "Internal server error during permission check" });
    }
  };
};
