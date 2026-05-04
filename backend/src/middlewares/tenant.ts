import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuthenticated.js";
import { runWithTenantContext } from "@/lib/tenantContext.js";
import { resolveOrganizationIdFromBranch } from "@/lib/tenantLookup.js";

export const attachTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const branchHeader = req.headers["x-branch-id"];
    const orgHeader = req.headers["x-organization-id"];
    const branchParam = req.params.branchId;
    const branchId =
      (typeof branchHeader === "string" ? branchHeader : null) ||
      (typeof branchParam === "string" ? branchParam : null) ||
      null;
    let organizationId = typeof orgHeader === "string" ? orgHeader : null;

    // We allow the request to proceed even if context is missing,
    // because the model being accessed might be global (like User).
    // The prisma extension will only block if a scoped model is accessed without context.

    if (!organizationId && branchId) {
      organizationId = await resolveOrganizationIdFromBranch(branchId);
    }

    runWithTenantContext(
      {
        branchId: branchId || undefined,
        organizationId: organizationId || undefined,
        userId: req.user?.id || undefined,
      },
      () => next(),
    );
  } catch (error) {
    next(error);
  }
};
