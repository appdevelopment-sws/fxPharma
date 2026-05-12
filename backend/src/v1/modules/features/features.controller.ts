import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class FeaturesController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search);
      const [data, total] = await Promise.all([
        rootPrisma.feature.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.feature.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const feature = await rootPrisma.feature.findUnique({
      where: { id: req.params.id as string },
    });
    res.json({ success: true, data: feature });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const feature = await rootPrisma.feature.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: feature });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const feature = await rootPrisma.feature.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json({ success: true, data: feature });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await rootPrisma.feature.delete({
      where: { id: req.params.id as string },
    });
    res.json({ success: true, message: "Feature deleted successfully" });
  });
}
