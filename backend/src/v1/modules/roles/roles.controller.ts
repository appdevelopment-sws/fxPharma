import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const syncRolePermissions = async (
  tx: any,
  roleId: string,
  permissionKeys: string[] = [],
) => {
  await tx.rolePermission.deleteMany({ where: { roleId } });

  if (!permissionKeys.length) return;

  const permissions = await tx.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true },
  });

  await tx.rolePermission.createMany({
    data: permissions.map((p: any) => ({ roleId, permissionId: p.id })),
    skipDuplicates: true,
  });
};

export class RolesController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const baseWhere = buildSearchFilter(search);
      const { organizationId, branchId } = getRequestScope(req);
      const scope = req.query.scope as string | undefined;

      const where: any = { ...baseWhere };
      if (organizationId) where.organizationId = organizationId;
      //   if (branchId) where.branchId = branchId;
      if (scope) where.scope = scope;

      const [data, total] = await Promise.all([
        rootPrisma.role.findMany({
          where,
          include: {
            permissions: { include: { permission: true } },
          },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.role.count({ where }),
      ]);

      const normalized = data.map((r) => ({
        ...r,
        permissions: r.permissions
          .filter((link: any) => link.permission)
          .map((link: any) => link.permission.key),
      }));

      return { data: normalized, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const role = await rootPrisma.role.findUnique({
      where: { id: req.params.id as string },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });

    const normalized = {
      ...role,
      permissions: role.permissions
        .filter((link: any) => link.permission)
        .map((link: any) => link.permission.key),
    };

    res.json({ success: true, data: normalized });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const payload: any = { ...req.body };
    const { organizationId, branchId } = getRequestScope(req);

    // Auto-generate key and sensible defaults
    payload.key =
      payload.key || payload.name?.toUpperCase().replace(/\s+/g, "_");
    payload.scope =
      payload.scope || (payload.organizationId ? "ORGANIZATION" : "GLOBAL");
    payload.isSystem = payload.isSystem ?? false;
    if (organizationId) payload.organizationId = organizationId;
    // if (branchId) payload.branchId = branchId;

    const permissionKeys: string[] = Array.isArray(payload.permissions)
      ? payload.permissions
      : [];
    delete payload.permissions;

    const result = await rootPrisma.$transaction(async (tx) => {
      const role = await tx.role.create({ data: payload });
      await syncRolePermissions(tx, role.id, permissionKeys);
      return tx.role.findUnique({
        where: { id: role.id },
        include: { permissions: { include: { permission: true } } },
      });
    });

    const normalized = {
      ...result,
      permissions: result.permissions
        .filter((link: any) => link.permission)
        .map((link: any) => link.permission.key),
    };

    res.status(201).json({ success: true, data: normalized });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const payload: any = { ...req.body };
    const permissionKeys: string[] | undefined = Array.isArray(
      payload.permissions,
    )
      ? payload.permissions
      : undefined;
    if (permissionKeys !== undefined) delete payload.permissions;

    // protect key generation if omitted
    if (!payload.key && payload.name)
      payload.key = payload.name.toUpperCase().replace(/\s+/g, "_");

    const result = await rootPrisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id: req.params.id as string },
        data: payload,
      });
      if (permissionKeys)
        await syncRolePermissions(tx, updated.id, permissionKeys);
      return tx.role.findUnique({
        where: { id: updated.id },
        include: { permissions: { include: { permission: true } } },
      });
    });

    const normalized = {
      ...result,
      permissions: result.permissions
        .filter((link: any) => link.permission)
        .map((link: any) => link.permission.key),
    };

    res.json({ success: true, data: normalized });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await rootPrisma.role.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Role deleted successfully" });
  });
}
