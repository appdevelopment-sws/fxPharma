import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class TaxController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { isSuperAdmin } = getRequestScope(req);
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, ["name"]);

      const [data, total] = await Promise.all([
        rootPrisma.tax.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.tax.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const tax = await rootPrisma.tax.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsnMappings: {
          include: {
            hsn: true,
          },
        },
      },
    });

    if (!tax) {
      throw new ErrorHandler("Tax rule not found", 404);
    }

    res.json({
      success: true,
      data: tax,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const tax = await rootPrisma.tax.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      data: tax,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existingTax = await rootPrisma.tax.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existingTax) {
      throw new ErrorHandler("Tax rule not found", 404);
    }

    const tax = await rootPrisma.tax.update({
      where: { id: req.params.id as string },
      data: req.body,
    });

    res.json({
      success: true,
      data: tax,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const tax = await rootPrisma.tax.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsnMappings: true,
      },
    });

    if (!tax) {
      throw new ErrorHandler("Tax rule not found", 404);
    }

    if (tax.hsnMappings.length > 0) {
      throw new ErrorHandler(
        "Cannot delete tax rule because it is linked to HSN codes. Please remove the mappings first.",
        400,
      );
    }

    await rootPrisma.tax.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Tax rule deleted successfully",
    });
  });
}
