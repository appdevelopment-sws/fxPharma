import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import { runWithTenantContext } from "@/lib/tenantContext.js";

export const attachTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.tenantId) {
    return res.status(403).json({ message: "Tenant not found" });
  }

  req.tenantId = req.user.tenantId;

  runWithTenantContext(
    {
      tenantId: req.user.tenantId,
    },
    () => next(),
  );
};
