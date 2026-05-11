import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";
export class BrandsController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, ["name", "description"]);

      const [data, total] = await Promise.all([
        rootPrisma.brand.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.brand.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const brand = await rootPrisma.brand.findUnique({
      where: { id: req.params.id as string },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    res.json({
      success: true,
      data: brand,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.brand.findFirst({
      where: { name: req.body.name },
    });

    if (existing) {
      throw new ErrorHandler("Brand name already exists", 400);
    }

    const brand = await rootPrisma.brand.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      data: brand,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.brand.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Brand not found", 404);
    }

    const { id, createdAt, updatedAt, ...data } = req.body;

    const brand = await rootPrisma.brand.update({
      where: { id: req.params.id as string },
      data,
    });

    res.json({
      success: true,
      data: brand,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const brand = await rootPrisma.brand.findUnique({
      where: { id: req.params.id as string },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    await rootPrisma.brand.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const brand = await rootPrisma.brand.findUnique({
      where: { id: req.params.id as string },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    const updated = await rootPrisma.brand.update({
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
