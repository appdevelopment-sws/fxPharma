import { Request } from "express";
import ErrorHandler from "@/utils/ErrorHandler.js";

const getHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export type RequestScope = {
  organizationId: string;
  branchId: string | null;
  role: string;
  isSuperAdmin: boolean;
};

export function getRequestScope(req: any): RequestScope {
  const organizationId = getHeaderValue(req.headers["x-organization-id"]);
  const branchId = getHeaderValue(req.headers["x-branch-id"]) || null;
  const role = req.user.role;
  if (!organizationId) {
    throw new ErrorHandler("Organization context is required", 400);
  }
  const isSuperAdmin = role === "SUPER_ADMIN";
  return {
    organizationId,
    branchId,
    role,
    isSuperAdmin,
  };
}
