import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class OrdersController {
  private static canAccessOrder(
    order: { organizationId: string; branchId: string | null },
    organizationId: string,
    branchId: string | null
  ) {
    if (order.organizationId !== organizationId) {
      return false;
    }

    if (!branchId) {
      return true;
    }

    return order.branchId === branchId || order.branchId === null;
  }

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
          {
            OR: [
              {
                supplier: {
                  companyName: { contains: search, mode: "insensitive" },
                },
              },
              { status: { contains: search, mode: "insensitive" } },
            ],
          },
        ];
      }

      const [data, total] = await Promise.all([
        rootPrisma.order.findMany({
          where: filters,
          include: {
            items: {
              include: {
                inventory: true,
              } as any,
            },
            supplier: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.order.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const order = await rootPrisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: {
          include: {
            inventory: true,
          } as any,
        },
        supplier: true,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!OrdersController.canAccessOrder(order, organizationId, branchId)) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { items, ...orderData } = req.body;

    const order = await rootPrisma.order.create({
      data: {
        ...orderData,
        organizationId,
        branchId,
        items: {
          create: items,
        },
      },
      include: {
        items: {
          include: {
            inventory: true,
          } as any,
        },
      },
    });

    res.status(201).json({ success: true, data: order });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { items, ...orderData } = req.body;

    const existing = await rootPrisma.order.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, organizationId: true, branchId: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!OrdersController.canAccessOrder(existing, organizationId, branchId)) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const order = await rootPrisma.order.update({
      where: { id: req.params.id as string },
      data: {
        ...orderData,
        organizationId,
        branchId: existing.branchId ?? branchId,
        ...(items && {
          items: {
            deleteMany: {},
            create: items,
          },
        }),
      },
      include: {
        items: {
          include: {
            inventory: true,
          } as any,
        },
      },
    });

    res.json({ success: true, data: order });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.order.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, organizationId: true, branchId: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!OrdersController.canAccessOrder(existing, organizationId, branchId)) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    await rootPrisma.order.delete({
      where: { id: req.params.id as string },
    });

    res.json({ success: true, message: "Order deleted successfully" });
  });
}
