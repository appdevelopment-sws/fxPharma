import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { rootPrisma } from "@/lib/prisma.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class UnitsController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    await paginate(res, req.query, async (skip, take, search) => {
      const searchFilter = buildSearchFilter(search, ["name", "shortName"]);

      const where = {
        ...searchFilter,
        organizationId,
        ...(branchId ? { branchId } : {}),
      };

      const [data, total] = await Promise.all([
        rootPrisma.unit.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.unit.count({ where }),
      ]);

      const mappedData = data.map((item: any) => ({
        ...item,
        short_name: item.shortName,
      }));

      return { data: mappedData, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const unit: any = await rootPrisma.unit.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!unit) {
      throw new ErrorHandler("Unit not found", 404);
    }

    res.json({
      success: true,
      data: {
        ...unit,
        short_name: unit.shortName,
      },
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.unit.findFirst({
      where: {
        name: req.body.name,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (existing) {
      throw new ErrorHandler("Unit name already exists", 400);
    }

    const { short_name, shortName, ...rest } = req.body;

    const unit: any = await rootPrisma.unit.create({
      data: {
        ...rest,
        organizationId,
        branchId,
        shortName: short_name || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...unit,
        short_name: unit.shortName,
      },
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.unit.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!existing) {
      throw new ErrorHandler("Unit not found", 404);
    }

    const {
      id,
      createdAt,
      updatedAt,
      organizationId: orgId,
      branchId: brId,
      short_name,
      ...rest
    } = req.body;

    const updateData: any = { ...rest };

    if (short_name !== undefined) {
      updateData.shortName = short_name || null;
    }

    const unit: any = await rootPrisma.unit.update({
      where: { id: req.params.id as string },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        ...unit,
        short_name: unit.shortName,
      },
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const unit = await rootPrisma.unit.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!unit) {
      throw new ErrorHandler("Unit not found", 404);
    }

    await rootPrisma.unit.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Unit deleted successfully",
    });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const unit = await rootPrisma.unit.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!unit) {
      throw new ErrorHandler("Unit not found", 404);
    }

    const updated: any = await rootPrisma.unit.update({
      where: { id: req.params.id as string },
      data: {
        status: req.body.status,
      },
    });

    res.json({
      success: true,
      data: {
        ...updated,
        short_name: updated.shortName,
      },
    });
  });
}
