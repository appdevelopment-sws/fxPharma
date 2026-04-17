import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import { runWithTenantContext } from "@/lib/tenantContext.js";

export const attachTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const branchId =
    (req.headers["x-branch-id"] as string) || req.params.branchId || null;

  // We allow the request to proceed even if branchId is missing, 
  // because the model being accessed might be global (like User).
  // The prisma extension will only block if a scoped model is accessed without context.
  
  runWithTenantContext(
    {
      tenantId: branchId || undefined,
    },
    () => next(),
  );
};
