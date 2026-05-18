import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";

export class InventoryController {
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
              {
                manufacturer: {
                  is: {
                    name: {
                      contains: search,
                    },
                  },
                },
              },
              { saltComposition: { contains: search, mode: "insensitive" } },
            ],
          },
        ];
      }

      const [data, total] = await Promise.all([
        rootPrisma.inventory.findMany({
          where: filters,
          // include: {
          //   brand: true,
          //   category: true,
          //   manufacturer: true,
          // },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.inventory.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const inventory = await rootPrisma.inventory.findUnique({
      where: { id: req.params.id as string },
      include: {
        brand: true,
        category: true,
        manufacturer: true,
      },
    });

    if (!inventory) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    if (inventory.organizationId !== organizationId) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    res.json({ success: true, data: inventory });
  });
  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const inventory = await rootPrisma.inventory.create({
      data: {
        ...req.body,
        organizationId,
        branchId,
        daysLimit: req.body.daysLimit ? new Date(req.body.daysLimit) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: inventory,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);

    const existing = await rootPrisma.inventory.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    if (existing.organizationId !== organizationId) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    const { id, createdAt, updatedAt, ...data } = req.body;

    const inventory = await rootPrisma.inventory.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        daysLimit: data.daysLimit ? new Date(data.daysLimit) : null,
      },
    });
    res.json({ success: true, data: inventory });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.inventory.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    if (existing.organizationId !== organizationId) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    await rootPrisma.inventory.delete({
      where: { id: req.params.id as string },
    });

    res.json({ success: true, message: "Inventory item deleted successfully" });
  });
}
