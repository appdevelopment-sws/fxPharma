import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";

export class InventoryController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const inventory = (rootPrisma as any).inventory;

    await paginate(res, req.query, async (skip, take, search) => {
      const filters: any = {};

      if (search) {
        filters.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { manufacturer: { contains: search, mode: "insensitive" } },
          { saltComposition: { contains: search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        inventory.findMany({
          where: filters,
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        inventory.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const inventory = await (rootPrisma as any).inventory.findUnique({
      where: { id: req.params.id as string },
    });
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }
    res.json({ success: true, data: inventory });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const inventory = await (rootPrisma as any).inventory.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: inventory });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const inventory = await (rootPrisma as any).inventory.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json({ success: true, data: inventory });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await (rootPrisma as any).inventory.delete({
      where: { id: req.params.id as string },
    });
    res.json({ success: true, message: "Inventory item deleted successfully" });
  });
}
