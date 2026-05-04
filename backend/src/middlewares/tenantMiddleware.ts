import { Response, NextFunction } from "express";
import { runWithTenantContext } from "../lib/tenantContext.js";
import { AuthRequest } from "./isAuthenticated.js";
import { resolveOrganizationIdFromBranch } from "@/lib/tenantLookup.js";

export const tenantMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract tenant info from headers or authenticated user
    const branchHeader = req.headers["x-branch-id"];
    const orgHeader = req.headers["x-organization-id"];
    const branchId =
      (typeof branchHeader === "string" ? branchHeader : null) ||
      (req.user as any)?.branchId;

    let organizationId =
      (typeof orgHeader === "string" ? orgHeader : null) ||
      (req.user as any)?.organizationId;

    // Paths that don't need tenant context (e.g., auth)
    const bypassPaths = ["/api/v1/auth"];
    if (bypassPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    if (!organizationId && branchId) {
      organizationId = await resolveOrganizationIdFromBranch(branchId);
    }

    // Set the context
    runWithTenantContext(
      {
        organizationId: organizationId || undefined,
        branchId: branchId || undefined,
        userId: req.user?.id,
      },
      () => {
        next();
      },
    );
  } catch (error) {
    next(error);
  }
};
