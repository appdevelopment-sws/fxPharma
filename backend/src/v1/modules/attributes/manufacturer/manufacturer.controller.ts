import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class ManufacturerController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    await paginate(res, req.query, async (skip, take, search) => {
      const searchFilter = buildSearchFilter(search, [
        "name",
        "email",
        "phone",
        "address",
      ]);

      const where = {
        ...searchFilter,
        organizationId,
        ...(branchId ? { branchId } : {}),
      };

      const [data, total] = await Promise.all([
        rootPrisma.manufacturer.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.manufacturer.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const manufacturer = await rootPrisma.manufacturer.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!manufacturer) {
      throw new ErrorHandler("Manufacturer not found", 404);
    }

    res.json({
      success: true,
      data: manufacturer,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.manufacturer.findFirst({
      where: {
        name: req.body.name,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (existing) {
      throw new ErrorHandler("Manufacturer name already exists", 400);
    }

    const manufacturer = await rootPrisma.manufacturer.create({
      data: {
        ...req.body,
        organizationId,
        branchId,
      },
    });

    res.status(201).json({
      success: true,
      data: manufacturer,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.manufacturer.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!existing) {
      throw new ErrorHandler("Manufacturer not found", 404);
    }

    const {
      id,
      createdAt,
      updatedAt,
      organizationId: orgId,
      branchId: brId,
      ...data
    } = req.body;

    const manufacturer = await rootPrisma.manufacturer.update({
      where: { id: req.params.id as string },
      data,
    });

    res.json({
      success: true,
      data: manufacturer,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const manufacturer = await rootPrisma.manufacturer.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!manufacturer) {
      throw new ErrorHandler("Manufacturer not found", 404);
    }

    await rootPrisma.manufacturer.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Manufacturer deleted successfully",
    });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const manufacturer = await rootPrisma.manufacturer.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!manufacturer) {
      throw new ErrorHandler("Manufacturer not found", 404);
    }

    const updated = await rootPrisma.manufacturer.update({
      where: { id: req.params.id as string },
      data: {
        status: req.body.status,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  });
}
