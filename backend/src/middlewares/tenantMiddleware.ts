import { Response, NextFunction } from "express";
import { runWithTenantContext } from "../lib/tenantContext.js";
import { AuthRequest } from "./isAuthenticated.js";

export const tenantMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Extract tenant info from headers or authenticated user
  const organizationId = 
    (req.headers["x-organization-id"] as string) || 
    (req.user as any)?.organizationId;
    
  const branchId = 
    (req.headers["x-branch-id"] as string) || 
    (req.user as any)?.branchId;

  // Paths that don't need tenant context (e.g., auth, health check)
  const bypassPaths = ["/api/v1/auth", "/"];
  if (bypassPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Set the context
  runWithTenantContext(
    { 
      organizationId, 
      branchId, 
      userId: req.user?.id 
    }, 
    () => {
      next();
    }
  );
};
