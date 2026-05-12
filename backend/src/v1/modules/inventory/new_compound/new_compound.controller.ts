import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";

export class NewCompoundController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    await paginate(res, req.query, async (skip, take, search) => {
      const filters: any = {
        organizationId,
        ...(branchId
          ? {
              OR: [{ branchId }, { branchId: null }],
            }
          : {}),
      };

      if (search) {
        filters.AND = [
          ...(filters.AND || []),
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { dosageForm: { contains: search, mode: "insensitive" } },
            ],
          },
        ];
      }

      const [data, total] = await Promise.all([
        rootPrisma.newCompound.findMany({
          where: filters,
          include: { ingredients: true },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.newCompound.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const compound = await rootPrisma.newCompound.findUnique({
      where: { id: req.params.id as string },
      include: { ingredients: true },
    });

    if (!compound) {
      throw new ErrorHandler("Compound not found", 404);
    }

    if (compound.organizationId !== organizationId) {
      throw new ErrorHandler("Compound not found", 404);
    }

    res.json({ success: true, data: compound });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { ingredients, ...compoundData } = req.body;

    const compound = await rootPrisma.newCompound.create({
      data: {
        ...compoundData,
        organizationId,
        branchId,
        ingredients: ingredients
          ? {
              create: ingredients,
            }
          : undefined,
      },
      include: { ingredients: true },
    });

    res.status(201).json({ success: true, data: compound });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const existing = await rootPrisma.newCompound.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Compound not found", 404);
    }

    if (existing.organizationId !== organizationId) {
      throw new ErrorHandler("Compound not found", 404);
    }

    const { ingredients, id, createdAt, updatedAt, ...compoundData } = req.body;

    const compound = await rootPrisma.newCompound.update({
      where: { id: req.params.id as string },
      data: {
        ...compoundData,
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients,
          },
        }),
      },
      include: { ingredients: true },
    });

    res.json({ success: true, data: compound });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const existing = await rootPrisma.newCompound.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Compound not found", 404);
    }

    if (existing.organizationId !== organizationId) {
      throw new ErrorHandler("Compound not found", 404);
    }

    await rootPrisma.newCompound.delete({
      where: { id: req.params.id as string },
    });

    res.json({ success: true, message: "Compound deleted successfully" });
  });
}
