import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class HsnMappingController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, []);

      const [data, total] = await Promise.all([
        rootPrisma.hsnMapping.findMany({
          where,
          include: {
            hsn: true,
            tax: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.hsnMapping.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const mapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsn: true,
        tax: true,
      },
    });

    if (!mapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    res.json({
      success: true,
      data: mapping,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { hsnid, taxid } = req.body;

    const existing = await rootPrisma.hsnMapping.findUnique({
      where: {
        hsnid_taxid: { hsnid, taxid },
      },
    });

    if (existing) {
      throw new ErrorHandler("This HSN-Tax mapping already exists", 400);
    }

    const mapping = await rootPrisma.hsnMapping.create({
      data: { hsnid, taxid },
    });

    res.status(201).json({
      success: true,
      data: mapping,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existingMapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existingMapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    const mapping = await rootPrisma.hsnMapping.update({
      where: { id: req.params.id as string },
      data: req.body,
    });

    res.json({
      success: true,
      data: mapping,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const mapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
    });

    if (!mapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    await rootPrisma.hsnMapping.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Mapping deleted successfully",
    });
  });
}
