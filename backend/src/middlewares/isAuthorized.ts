import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import type { PermissionName } from "@/constants/permissions.js";

export const allowRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
export const allowPermissions = (...permissions: PermissionName[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userPermissions = req.user.permissions || [];

    const hasPermission = permissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};
