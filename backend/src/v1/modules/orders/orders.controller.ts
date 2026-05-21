import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const ORDER_STATUS_VALUES = [
  "DRAFT",
  "SENT",
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeOrderStatus = (status?: string | null) => {
  if (status === "DELIVERED") {
    return "COMPLETED";
  }

  return status || undefined;
};

const parseExpiryDate = (value?: string | null) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const directDate = new Date(trimmed);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return undefined;

  const month = Number(match[1]);
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);

  if (!Number.isFinite(month) || month < 1 || month > 12) return undefined;

  return new Date(year, month, 0);
};

const buildOrderItemData = (item: any) => ({
  inventoryId: item.inventoryId,
  qty: Math.max(1, toNumber(item.qty)),
  unit: item.unit ?? null,
  purchaseRate:
    item.purchaseRate === undefined || item.purchaseRate === null
      ? null
      : toNumber(item.purchaseRate),
  receivedQty: Math.max(0, toNumber(item.qty) + toNumber(item.freeQty)),
  discount: toNumber(item.discount || 0),
  discountType: item.discount_type || item.discountType || "flat",
});

const buildInventoryUpdateData = (item: any) => {
  const data: Record<string, any> = {};

  if (item.expiry !== undefined && item.expiry !== null && item.expiry !== "") {
    const parsedExpiry = parseExpiryDate(item.expiry);
    if (parsedExpiry) {
      data.daysLimit = parsedExpiry;
    }
  }

  const numericFields: Array<[string, unknown]> = [
    ["purchaseRate", item.purchaseRate],
    ["mrp", item.mrp],
    ["rateA", item.rate1],
    ["rateB", item.rate2],
    ["rateC", item.rate3],
    ["cgst", item.cgst],
    ["sgst", item.sgst],
  ];

  for (const [field, value] of numericFields) {
    if (value !== undefined && value !== null && value !== "") {
      data[field] = toNumber(value);
    }
  }

  return data;
};

export class OrdersController {
  private static canAccessOrder(
    order: { organizationId: string; branchId: string | null },
    organizationId: string,
    branchId: string | null,
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

      const normalizedSearch = search?.trim();
      const normalizedStatus = normalizeOrderStatus(
        normalizedSearch?.toUpperCase(),
      );

      if (normalizedSearch) {
        const searchClauses: any[] = [
          {
            supplier: {
              companyName: { contains: normalizedSearch, mode: "insensitive" },
            },
          },
        ];

        if (
          normalizedStatus &&
          ORDER_STATUS_VALUES.includes(normalizedStatus as any)
        ) {
          searchClauses.push({ status: normalizedStatus });
        }

        filters.AND = [
          {
            OR: searchClauses,
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
        status: normalizeOrderStatus(orderData.status) || undefined,
        organizationId,
        branchId,
        items: {
          create: (items || []).map(buildOrderItemData),
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
    console.log("Received order update request:", { organizationId });
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

    const order = await rootPrisma.$transaction(async (tx) => {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!item?.inventoryId) continue;
          console.log("Processing inventory update for item:", item);
          const inventoryUpdateData = buildInventoryUpdateData(item);
          if (Object.keys(inventoryUpdateData).length > 0) {
            const result = await tx.inventory.updateMany({
              where: {
                id: item.inventoryId,
                organizationId,
              },
              data: {
                ...inventoryUpdateData,
                // increase availablestock + whhatw it was hhaving earlierr
                availableStock: {
                  increment: item.qty + (item.freeQuantity || 0),
                },
                purchaseRate: item.purchaseRate / item.qty,
              },
            });

            if (result.count === 0) {
              throw new Error(
                `Inventory item not found for order item ${item.inventoryId}`,
              );
            }
          }
        }
      }

      return tx.order.update({
        where: { id: req.params.id as string },
        data: {
          ...orderData,
          status: normalizeOrderStatus(orderData.status) || undefined,
          organizationId,
          branchId: existing.branchId ?? branchId,
          ...(items && {
            items: {
              deleteMany: {},
              create: (items || []).map(buildOrderItemData),
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
