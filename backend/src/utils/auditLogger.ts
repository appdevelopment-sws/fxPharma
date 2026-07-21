import { rootPrisma } from "@/lib/prisma.js";
import { Request } from "express";

export type AuditActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";

export interface RecordAuditOptions {
  userId?: string | null;
  organizationId?: string | null;
  branchId?: string | null;
  action: AuditActionType;
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  req?: Request;
}

/**
 * Non-blocking audit logger helper.
 * Records audit logs into PostgreSQL via Prisma without blocking request completion.
 */
export const recordAuditLog = (options: RecordAuditOptions): void => {
  const {
    userId,
    organizationId,
    branchId,
    action,
    entity,
    entityId,
    oldData,
    newData,
    req,
  } = options;

  // Extract request info if req is provided
  const ipAddress = req
    ? (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || null
    : null;
  const userAgent = req ? req.headers["user-agent"] || null : null;

  // Extract from user context on req if not explicitly passed
  const effectiveUserId = userId || (req as any)?.user?.id || (req as any)?.user?.sub || null;
  const effectiveOrgId = organizationId || (req as any)?.user?.organizationId || null;
  const effectiveBranchId = branchId || (req as any)?.user?.branchId || null;

  // Asynchronous execution without blocking express response
  rootPrisma.auditLog
    .create({
      data: {
        userId: effectiveUserId,
        organizationId: effectiveOrgId,
        branchId: effectiveBranchId,
        action,
        entity,
        entityId: String(entityId),
        oldData: oldData ?? undefined,
        newData: newData ?? undefined,
        ipAddress: ipAddress ? String(ipAddress).substring(0, 100) : null,
        userAgent: userAgent ? String(userAgent).substring(0, 255) : null,
      },
    })
    .catch((err) => {
      console.error("[AuditLogger Error]: Failed to create audit log entry", err);
    });
};
