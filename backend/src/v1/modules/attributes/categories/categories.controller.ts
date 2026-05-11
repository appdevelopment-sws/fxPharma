import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class CategoriesController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, ["name", "description"]);

      const [data, total] = await Promise.all([
        rootPrisma.category.findMany({
          where,
          include: {
            parent: true,
            children: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.category.count({ where }),
      ]);

      const mappedData = data.map((item: any) => ({
        ...item,
        parent_id: item.parentId,
      }));

      return { data: mappedData, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const category: any = await rootPrisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    res.json({
      success: true,
      data: {
        ...category,
        parent_id: category.parentId,
      },
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.category.findFirst({
      where: { name: req.body.name },
    });

    if (existing) {
      throw new ErrorHandler("Category name already exists", 400);
    }

    const { parent_id, ...rest } = req.body;

    const category: any = await rootPrisma.category.create({
      data: {
        ...rest,
        parentId: parent_id || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...category,
        parent_id: category.parentId,
      },
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        children: true,
      },
    });

    if (!existing) {
      throw new ErrorHandler("Category not found", 404);
    }

    const { id, createdAt, updatedAt, parent_id, ...rest } = req.body;

    const updateData: any = { ...rest };

    if (parent_id !== undefined) {
      updateData.parentId = parent_id || null;
    }

    const category: any = await rootPrisma.category.update({
      where: { id: req.params.id as string },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        ...category,
        parent_id: category.parentId,
      },
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const category = await rootPrisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    if (category.children.length > 0) {
      throw new ErrorHandler(
        "Cannot delete category because it has sub-categories",
        400,
      );
    }

    await rootPrisma.category.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const category = await rootPrisma.category.findUnique({
      where: { id: req.params.id as string },
    });

    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    const updated: any = await rootPrisma.category.update({
      where: { id: req.params.id as string },
      data: {
        status: req.body.status,
      },
    });

    res.json({
      success: true,
      data: {
        ...updated,
        parent_id: updated.parentId,
      },
    });
  });
}
