import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import { InvoiceParserService } from "./invoiceParser.service.js";

const ORDER_STATUS_VALUES = [
  "DRAFT",
  "SENT",
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;
const generateOrderId = async (
  tx: Prisma.TransactionClient,
  organizationId: string,
) => {
  const count = await tx.order.count({
    where: { organizationId },
  });

  const nextNumber = count + 1;

  const now = new Date();

  const timestamp =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `Order${String(nextNumber).padStart(5, "0")}-${timestamp}-${random}`;
};
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

const normalizeExpiryMonthYear = (value?: string | null) => {
  if (!value) return null;

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return trimmed;

  const month = Number(match[1]);
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return trimmed;
  }

  return `${String(month).padStart(2, "0")}/${year}`;
};

const parseOptionalDate = (value?: string | null) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
};

const buildOrderItemData = (item: any) => ({
  inventoryId: item.inventoryId,
  qty: Math.max(1, toNumber(item.qty)),
  freeQty: Math.max(0, toNumber(item.freeQty)),
  unit: item.unit ?? null,
  batchNo: item.batchNo ?? null,
  expiry: item.expiry ?? null,
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

const buildInventoryBatchData = ({
  orderId,
  orderItemId,
  organizationId,
  branchId,
  item,
}: {
  orderId: string;
  orderItemId: string;
  organizationId: string;
  branchId: string | null;
  item: any;
}) => {
  const receivedQty = Math.max(0, toNumber(item.qty) + toNumber(item.freeQty));
  const expiryDate = normalizeExpiryMonthYear(item.expiry);
  const batchNo = String(item.batchNo ?? "").trim();

  if (!batchNo) {
    throw new Error(
      `Batch number is required for inventory item ${item.inventoryId}`,
    );
  }

  if (!item.expiry || !expiryDate) {
    throw new Error(
      `Valid expiry is required for inventory item ${item.inventoryId}`,
    );
  }

  return {
    orderId,
    orderItemId,
    organizationId,
    branchId,
    inventoryId: item.inventoryId,
    batchNo,
    expiry: expiryDate,
    expiryDate,
    unit: item.unit ?? null,
    receivedQty,
    availableQty: receivedQty,
    purchaseRate:
      item.purchaseRate === undefined || item.purchaseRate === null
        ? null
        : toNumber(item.purchaseRate),
    mrp:
      item.mrp === undefined || item.mrp === null ? null : toNumber(item.mrp),
    rateA:
      item.rate1 === undefined || item.rate1 === null
        ? null
        : toNumber(item.rate1),
    rateB:
      item.rate2 === undefined || item.rate2 === null
        ? null
        : toNumber(item.rate2),
    rateC:
      item.rate3 === undefined || item.rate3 === null
        ? null
        : toNumber(item.rate3),
    cgst:
      item.cgst === undefined || item.cgst === null
        ? null
        : toNumber(item.cgst),
    sgst:
      item.sgst === undefined || item.sgst === null
        ? null
        : toNumber(item.sgst),
  };
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

const ORDER_INCLUDE = {
  items: {
    include: {
      inventory: true,
    } as any,
  },
  paymentHistory: {
    orderBy: { paidAt: "desc" as const },
  },
  inventoryBatches: {
    orderBy: [{ receivedAt: "asc" as const }, { createdAt: "asc" as const }],
  },
  supplier: true,
} as Prisma.OrderInclude;

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
      receivedAt: parseOptionalDate(orderData.receivedAt),
    };
    const order = await rootPrisma.$transaction(async (tx) => {
      const generatedOrderId = await generateOrderId(tx, organizationId);

      const created = await tx.order.create({
        data: {
          ...cleanedOrderData,
          orderId: generatedOrderId,

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
      receivedAt: parseOptionalDate(orderData.receivedAt),
    };
    const previousPaidAmount = toNumber(existing.paidAmount);
    const nextPaidAmount =
      cleanedOrderData.paidAmount === undefined
        ? previousPaidAmount
        : toNumber(cleanedOrderData.paidAmount);
    const paymentDelta = Math.max(0, nextPaidAmount - previousPaidAmount);
    const isFirstReceipt =
      existing.status !== "PENDING" && existing.status !== "COMPLETED";
    const order = await rootPrisma.$transaction(async (tx) => {
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
          ...(isFirstReceipt &&
            Array.isArray(items) && {
              items: {
                deleteMany: {},
                create: (items || []).map(buildOrderItemData),
              },
            }),
        },
      });

      const receivedOrder = await tx.order.findUnique({
        where: { id: updated.id },
        include: ORDER_INCLUDE,
      });

      if (isFirstReceipt && Array.isArray(items)) {
        for (const item of items) {
          if (!item?.inventoryId) continue;
          const receivedQty = Math.max(
            0,
            toNumber(item.qty) + toNumber(item.freeQty),
          );

          const inventoryUpdateData = buildInventoryUpdateData(item);
          const result = await tx.inventory.updateMany({
            where: {
              id: item.inventoryId,
              organizationId,
            },
            data: {
              ...inventoryUpdateData,
              availableStock: {
                increment: receivedQty,
              },
              ...(item.purchaseRate !== undefined &&
              item.purchaseRate !== null &&
              item.purchaseRate !== ""
                ? {
                    purchaseRate: toNumber(item.purchaseRate),
                    costPerUnit: toNumber(item.purchaseRate),
                  }
                : {}),
            },
          });

          if (result.count === 0) {
            throw new Error(
              `Inventory item not found for order item ${item.inventoryId}`,
            );
          }
        }

        if (!receivedOrder?.items?.length) {
          throw new Error("Order items could not be refreshed after save");
        }

        for (let index = 0; index < receivedOrder.items.length; index += 1) {
          const orderItem = receivedOrder.items[index];
          const sourceItem = items[index];

          if (!sourceItem) {
            continue;
          }

          // Only create batch if batch number and expiry are provided
          const batchNo = String(sourceItem.batchNo ?? "").trim();
          if (batchNo && sourceItem.expiry) {
            await (tx as any).inventoryBatch.create({
              data: buildInventoryBatchData({
                orderId: receivedOrder.id,
                orderItemId: orderItem.id,
                organizationId,
                branchId: existing.branchId ?? branchId,
                item: sourceItem,
              }),
            });
          }
        }
      }

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

  static parseBill = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const orderId = req.params.id as string;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No bill file uploaded" });
    }

    const order = await rootPrisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, organizationId: true, branchId: true },
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

    let parsedResult;
    const mimeType = req.file.mimetype;

    if (mimeType === "application/pdf") {
      parsedResult = await InvoiceParserService.parsePDF(req.file.buffer);
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "text/csv" ||
      req.file.originalname.endsWith(".xlsx") ||
      req.file.originalname.endsWith(".xls") ||
      req.file.originalname.endsWith(".csv")
    ) {
      parsedResult = InvoiceParserService.parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported file format. Please upload a PDF or Excel/CSV file.",
      });
    }

    res.json({
      success: true,
      data: parsedResult,
    });
  });
}
