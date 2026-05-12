import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class SuppliersController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, [
        "name",
        "email",
        "phone",
        "address",
      ]);

      const [data, total] = await Promise.all([
        rootPrisma.supplier.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.supplier.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const supplier = await rootPrisma.supplier.findUnique({
      where: { id: req.params.id as string },
    });

    if (!supplier) {
      throw new ErrorHandler("Supplier not found", 404);
    }

    res.json({
      success: true,
      data: supplier,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const supplier = await rootPrisma.supplier.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      data: supplier,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.supplier.findUnique({
      where: { id: req.params.id as string as string },
    });

    if (!existing) {
      throw new ErrorHandler("Supplier not found", 404);
    }

    const { id, createdAt, updatedAt, ...data } = req.body;

    const supplier = await rootPrisma.supplier.update({
      where: { id: req.params.id as string },
      data,
    });

    res.json({
      success: true,
      data: supplier,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.supplier.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Supplier not found", 404);
    }

    await rootPrisma.supplier.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  });
}
