import { Request } from "express";
import ErrorHandler from "@/utils/ErrorHandler.js";

const getHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export type RequestScope = {
  organizationId: string;
  branchId: string | null;
};

export function getRequestScope(req: Request): RequestScope {
  const organizationId = getHeaderValue(req.headers["x-organization-id"]);
  const branchId = getHeaderValue(req.headers["x-branch-id"]) || null;

  if (!organizationId) {
    throw new ErrorHandler("Organization context is required", 400);
  }

  return {
    organizationId,
    branchId,
  };
}
