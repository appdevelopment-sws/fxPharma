import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";

export class NewCompoundController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const newCompound = (rootPrisma as any).newCompound;

    await paginate(res, req.query, async (skip, take, search) => {
      const filters: any = {};

      if (search) {
        filters.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { dosageForm: { contains: search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        newCompound.findMany({
          where: filters,
          include: { ingredients: true },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        newCompound.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const compound = await (rootPrisma as any).newCompound.findUnique({
      where: { id: req.params.id as string },
      include: { ingredients: true },
    });
    if (!compound) {
      return res
        .status(404)
        .json({ success: false, message: "Compound not found" });
    }
    res.json({ success: true, data: compound });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { ingredients, ...compoundData } = req.body;
    const compound = await (rootPrisma as any).newCompound.create({
      data: {
        ...compoundData,
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
    const { ingredients, ...compoundData } = req.body;
    const compound = await (rootPrisma as any).newCompound.update({
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
    await (rootPrisma as any).newCompound.delete({
      where: { id: req.params.id as string },
    });
    res.json({ success: true, message: "Compound deleted successfully" });
  });
}
