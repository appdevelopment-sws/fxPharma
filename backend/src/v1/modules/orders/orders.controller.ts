import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
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

const buildPaymentHistoryData = ({
  orderId,
  organizationId,
  branchId,
  amount,
  paymentMode,
  paymentDetails,
  isUdhar,
  notes,
}: {
  orderId: string;
  organizationId: string;
  branchId: string | null;
  amount: number;
  paymentMode?: string | null;
  paymentDetails?: string | null;
  isUdhar?: boolean;
  notes?: string | null;
}) => ({
  orderId,
  organizationId,
  branchId,
  amount,
  paymentMode: paymentMode ?? null,
  paymentDetails: paymentDetails ?? null,
  isUdhar: Boolean(isUdhar),
  notes: notes ?? null,
});

const ORDER_INCLUDE: Prisma.OrderInclude = {
  items: {
    include: {
      inventory: true,
    } as any,
  },
  paymentHistory: {
    orderBy: { paidAt: "desc" as const },
  },
  supplier: true,
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
          include: ORDER_INCLUDE,
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
      include: ORDER_INCLUDE,
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

    const cleanedOrderData = {
      ...orderData,
      supplierId: orderData.supplierId === "" ? null : orderData.supplierId,
      branchId: orderData.branchId === "" ? null : orderData.branchId,
    };

    const order = await rootPrisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          ...cleanedOrderData,
          status: normalizeOrderStatus(cleanedOrderData.status) || undefined,
          organizationId,
          branchId,
          items: {
            create: (items || []).map(buildOrderItemData),
          },
        },
      });

      const createdPaidAmount = toNumber(cleanedOrderData.paidAmount);
      if (createdPaidAmount > 0) {
        await tx.orderPayment.create({
          data: buildPaymentHistoryData({
            orderId: created.id,
            organizationId,
            branchId,
            amount: createdPaidAmount,
            paymentMode: cleanedOrderData.paymentMode,
            paymentDetails: cleanedOrderData.paymentDetails,
            isUdhar: cleanedOrderData.isUdhar,
            notes: cleanedOrderData.notes,
          }),
        });
      }

      return tx.order.findUnique({
        where: { id: created.id },
        include: ORDER_INCLUDE,
      });
    });

    res.status(201).json({ success: true, data: order });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { items, ...orderData } = req.body;
    const existing = await rootPrisma.order.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        status: true,
        paidAmount: true,
      },
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

    const cleanedOrderData = {
      ...orderData,
      supplierId: orderData.supplierId === "" ? null : orderData.supplierId,
      branchId: orderData.branchId === "" ? null : orderData.branchId,
    };
    const previousPaidAmount = toNumber(existing.paidAmount);
    const nextPaidAmount =
      cleanedOrderData.paidAmount === undefined
        ? previousPaidAmount
        : toNumber(cleanedOrderData.paidAmount);
    const paymentDelta = Math.max(0, nextPaidAmount - previousPaidAmount);
    const order = await rootPrisma.$transaction(async (tx) => {
      const shouldUpdateInventory =
        existing.status !== "PENDING" && existing.status !== "COMPLETED";

      if (shouldUpdateInventory && Array.isArray(items)) {
        for (const item of items) {
          if (!item?.inventoryId) continue;
          const inventoryUpdateData = buildInventoryUpdateData(item);
          if (Object.keys(inventoryUpdateData).length > 0) {
            const result = await tx.inventory.updateMany({
              where: {
                id: item.inventoryId,
                organizationId,
              },
              data: {
                ...inventoryUpdateData,
                availableStock: {
                  increment: item.qty + (item.freeQty || 0),
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

      const updated = await tx.order.update({
        where: { id: req.params.id as string },
        data: {
          ...cleanedOrderData,
          status: normalizeOrderStatus(cleanedOrderData.status) || undefined,
          organizationId,
          isUdhar: cleanedOrderData.isUdhar,
          paidAmount:
            cleanedOrderData.paidAmount === undefined
              ? undefined
              : nextPaidAmount,
          branchId: existing.branchId ?? branchId,
          ...(items && {
            items: {
              deleteMany: {},
              create: (items || []).map(buildOrderItemData),
            },
          }),
        },
      });

      if (paymentDelta > 0) {
        await tx.orderPayment.create({
          data: buildPaymentHistoryData({
            orderId: updated.id,
            organizationId,
            branchId: existing.branchId ?? branchId,
            amount: paymentDelta,
            paymentMode: cleanedOrderData.paymentMode,
            paymentDetails: cleanedOrderData.paymentDetails,
            isUdhar: cleanedOrderData.isUdhar,
            notes: cleanedOrderData.notes,
          }),
        });
      }

      return tx.order.findUnique({
        where: { id: updated.id },
        include: ORDER_INCLUDE,
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
