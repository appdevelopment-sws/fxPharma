import { Request, Response } from "express";

import { rootPrisma } from "@/lib/prisma.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const normalizeBranch = (branch: any) => {
  if (!branch) return branch;

  return {
    ...branch,
    branch_name: branch.branch_name ?? branch.name,
    name: branch.name ?? branch.branch_name,
    status: branch.status ?? (branch.isActive ? "ACTIVE" : "INACTIVE"),
  };
};

const mapBranchPayload = (payload: any) => {
  const mapped: any = { ...payload };

  if (mapped.branch_name && !mapped.name) {
    mapped.name = mapped.branch_name;
  }

  if (mapped.status) {
    mapped.isActive = mapped.status === "ACTIVE";
  }

  delete mapped.branch_name;

  return mapped;
};

export class BranchesController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const { organizationId } = getRequestScope(req);
      const status = req.query.status as string | undefined;
      const where: any = {
        organizationId,
        ...(status ? { status } : {}),
        ...buildSearchFilter(search, [
          "name",
          "code",
          "address",
          "phone",
          "email",
        ]),
      };

      const [data, total] = await Promise.all([
        rootPrisma.branch.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.branch.count({ where }),
      ]);

      return {
        data: data.map(normalizeBranch),
        total,
      };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const branch = await rootPrisma.branch.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
      },
    });

    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    res.json({ success: true, data: normalizeBranch(branch) });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const payload = mapBranchPayload({ ...req.body, organizationId });

    const branch = await rootPrisma.branch.create({
      data: payload,
    });

    res.status(201).json({ success: true, data: normalizeBranch(branch) });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const existing = await rootPrisma.branch.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
      },
      select: { id: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    const payload = mapBranchPayload({ ...req.body });

    const branch = await rootPrisma.branch.update({
      where: { id: existing.id },
      data: payload,
    });

    res.json({ success: true, data: normalizeBranch(branch) });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const existing = await rootPrisma.branch.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
      },
      select: { id: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    await rootPrisma.branch.delete({
      where: { id: existing.id },
    });

    res.json({ success: true, message: "Branch deleted successfully" });
  });
}
