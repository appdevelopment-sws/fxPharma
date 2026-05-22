import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getValue = (source: any, ...keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return undefined;
};

const sumReturnQty = (items: Array<{ returnQty: number }>) =>
  items.reduce((sum, item) => sum + item.returnQty, 0);

type ReturnStockItem = {
  invoiceItemId: string;
  inventoryId: string;
  batchId: string | null;
  name: string;
  batch: string | null;
  expiry: string | null;
  unitPrice: number;
  purchasedQty: number;
  returnQty: number;
  reason: string;
  refundAmt: number;
};

const getTrendString = (todayVal: number, yesterdayVal: number) => {
  if (yesterdayVal === 0) {
    return todayVal > 0 ? "+100% vs yesterday" : "0% vs yesterday";
  }

  const pct = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% vs yesterday`;
};

async function applyStockDelta({
  tx,
  organizationId,
  item,
  delta,
}: {
  tx: any;
  organizationId: string;
  item: { inventoryId: string; batchId?: string | null; returnQty: number; name: string };
  delta: number;
}) {
  const inventoryItem = await tx.inventory.findFirst({
    where: { id: item.inventoryId, organizationId },
  });

  if (!inventoryItem) {
    throw new ErrorHandler(`Inventory item ${item.name} not found.`, 404);
  }

  const nextStock = (inventoryItem.availableStock ?? 0) + delta;
  if (nextStock < 0 && !inventoryItem.negativeStock) {
    throw new ErrorHandler(`Insufficient stock for item ${item.name}.`, 400);
  }

  await tx.inventory.update({
    where: { id: inventoryItem.id },
    data: { availableStock: nextStock },
  });

  if (!item.batchId) return;

  const batch = await tx.inventoryBatch.findFirst({
    where: { id: item.batchId, inventoryId: item.inventoryId },
  });

  if (!batch) {
    throw new ErrorHandler(`Batch not found for item ${item.name}.`, 404);
  }

  const nextBatchQty = batch.availableQty + delta;
  if (nextBatchQty < 0 && !inventoryItem.negativeStock) {
    throw new ErrorHandler(
      `Insufficient stock for item ${item.name} in batch ${batch.batchNo}.`,
      400,
    );
  }

  await tx.inventoryBatch.update({
    where: { id: batch.id },
    data: { availableQty: nextBatchQty },
  });
}

async function refreshInvoiceStatus(tx: any, invoiceId: string) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });

  if (!invoice || invoice.status === "CANCELLED") return;

  const refundedItems = await tx.salesReturnItem.findMany({
    where: {
      salesReturn: {
        invoiceId,
        status: "REFUNDED",
      },
    },
    select: {
      invoiceItemId: true,
      returnQty: true,
    },
  });

  const returnedByInvoiceItem = new Map<string, number>();
  for (const item of refundedItems) {
    if (!item.invoiceItemId) continue;
    returnedByInvoiceItem.set(
      item.invoiceItemId,
      (returnedByInvoiceItem.get(item.invoiceItemId) || 0) + item.returnQty,
    );
  }

  const fullyRefunded =
    invoice.items.length > 0 &&
    invoice.items.every(
      (item: any) => (returnedByInvoiceItem.get(item.id) || 0) >= item.qty,
    );

  await tx.invoice.update({
    where: { id: invoiceId },
    data: { status: fullyRefunded ? "REFUNDED" : "PAID" },
  });
}

export class ReturnsController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { reason, status } = req.query;

    await paginate(res, req.query, async (skip, take, search) => {
      const filters: any = {
        organizationId,
        ...(branchId ? { branchId } : {}),
      };

      if (reason && reason !== "all") {
        filters.reason = reason;
      }

      if (status && status !== "all") {
        filters.status = status;
      }

      if (search && typeof search === "string" && search.trim()) {
        const searchTrim = search.trim();
        filters.OR = [
          { returnId: { contains: searchTrim, mode: "insensitive" } },
          { originalInvoice: { contains: searchTrim, mode: "insensitive" } },
          { customerName: { contains: searchTrim, mode: "insensitive" } },
          { customerPhone: { contains: searchTrim, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        rootPrisma.salesReturn.findMany({
          where: filters,
          include: { items: true },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.salesReturn.count({ where: filters }),
      ]);

      return { data, total };
    });
  });

  static getStats = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = todayStart;

    const baseFilter: any = {
      organizationId,
      ...(branchId ? { branchId } : {}),
    };

    const [todayReturns, yesterdayReturns, pendingReturns] = await Promise.all([
      rootPrisma.salesReturn.findMany({
        where: { ...baseFilter, createdAt: { gte: todayStart, lt: todayEnd } },
      }),
      rootPrisma.salesReturn.findMany({
        where: { ...baseFilter, createdAt: { gte: yesterdayStart, lt: yesterdayEnd } },
      }),
      rootPrisma.salesReturn.findMany({
        where: { ...baseFilter, status: "PENDING" },
      }),
    ]);

    const todayRefunded = todayReturns
      .filter((item) => item.status === "REFUNDED")
      .reduce((sum, item) => sum + toNumber(item.returnValue), 0);
    const yesterdayRefunded = yesterdayReturns
      .filter((item) => item.status === "REFUNDED")
      .reduce((sum, item) => sum + toNumber(item.returnValue), 0);

    const todayProcessed = todayReturns.filter((item) => item.status === "REFUNDED").length;
    const yesterdayProcessed = yesterdayReturns.filter((item) => item.status === "REFUNDED").length;

    const todayRestocked = todayReturns
      .filter((item) => item.status === "REFUNDED")
      .reduce((sum, item) => sum + item.itemsRestocked, 0);
    const yesterdayRestocked = yesterdayReturns
      .filter((item) => item.status === "REFUNDED")
      .reduce((sum, item) => sum + item.itemsRestocked, 0);

    const pendingRefunds = pendingReturns.reduce(
      (sum, item) => sum + toNumber(item.returnValue),
      0,
    );

    res.json({
      success: true,
      data: {
        total_refunded: todayRefunded,
        total_refunded_trend: getTrendString(todayRefunded, yesterdayRefunded),
        returns_processed: todayProcessed,
        returns_processed_trend: getTrendString(todayProcessed, yesterdayProcessed),
        items_restocked: todayRestocked,
        items_restocked_trend: getTrendString(todayRestocked, yesterdayRestocked),
        pending_refunds: pendingRefunds,
        pending_refunds_count: pendingReturns.length,
      },
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const salesReturn = await rootPrisma.salesReturn.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });

    if (!salesReturn) {
      throw new ErrorHandler("Sales return not found", 404);
    }

    if (
      salesReturn.organizationId !== organizationId ||
      (branchId && salesReturn.branchId !== branchId)
    ) {
      throw new ErrorHandler("Sales return not found", 404);
    }

    res.json({ success: true, data: salesReturn });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const invoiceNumber = String(
      req.body.invoice_number ||
        req.body.invoiceNumber ||
        req.body.invoiceId ||
        req.body.original_invoice ||
        "",
    ).trim();

    if (!invoiceNumber) {
      throw new ErrorHandler("Invoice number is required", 400);
    }

    const salesReturn = await rootPrisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          OR: [{ invoiceId: invoiceNumber }, { id: invoiceNumber }],
        },
        include: { items: true },
      });

      if (!invoice) {
        throw new ErrorHandler("Invoice not found", 404);
      }

      const selectedItems = (req.body.items || []).filter(
        (item: any) =>
          item.selected !== false &&
          toNumber(getValue(item, "return_qty", "returnQty")) > 0,
      );

      if (selectedItems.length === 0) {
        throw new ErrorHandler("Please select at least one item to return", 400);
      }

      const invoiceItemsById = new Map(invoice.items.map((item: any) => [item.id, item]));
      const matchedItems = selectedItems.map((item: any) => {
        const explicitItemId = getValue(item, "invoice_item_id", "invoiceItemId", "id");
        let invoiceItem = explicitItemId ? invoiceItemsById.get(explicitItemId) : null;

        if (!invoiceItem) {
          const inventoryId = getValue(item, "inventory_id", "inventoryId");
          const batchId = getValue(item, "batch_id", "batchId");
          const batch = getValue(item, "batch");
          const name = getValue(item, "name");

          invoiceItem = invoice.items.find((candidate: any) => {
            if (inventoryId && candidate.inventoryId !== inventoryId) return false;
            if (batchId && candidate.batchId !== batchId) return false;
            if (batch && candidate.batchNo !== batch) return false;
            if (name && candidate.inventoryName !== name) return false;
            return Boolean(inventoryId || batchId || batch || name);
          });
        }

        if (!invoiceItem) {
          throw new ErrorHandler("Selected return item was not found on invoice", 400);
        }

        return { input: item, invoiceItem };
      });

      const invoiceItemIds = matchedItems.map(({ invoiceItem }: any) => invoiceItem.id);
      const previousReturnItems = await tx.salesReturnItem.findMany({
        where: {
          invoiceItemId: { in: invoiceItemIds },
          salesReturn: {
            status: { not: "REJECTED" },
          },
        },
        select: {
          invoiceItemId: true,
          returnQty: true,
        },
      });

      const previouslyReturned = new Map<string, number>();
      for (const item of previousReturnItems) {
        if (!item.invoiceItemId) continue;
        previouslyReturned.set(
          item.invoiceItemId,
          (previouslyReturned.get(item.invoiceItemId) || 0) + item.returnQty,
        );
      }

      const returnItems: ReturnStockItem[] = matchedItems.map(({ input, invoiceItem }: any) => {
        const returnQty = toNumber(getValue(input, "return_qty", "returnQty"));
        const alreadyReturned = previouslyReturned.get(invoiceItem.id) || 0;
        const remainingQty = invoiceItem.qty - alreadyReturned;

        if (returnQty > remainingQty) {
          throw new ErrorHandler(
            `Return quantity for ${invoiceItem.inventoryName} cannot exceed remaining quantity ${remainingQty}`,
            400,
          );
        }

        const unitPrice =
          invoiceItem.qty > 0
            ? toNumber(invoiceItem.subTotal) / invoiceItem.qty
            : toNumber(invoiceItem.rateValue);
        const refundAmt = unitPrice * returnQty;

        return {
          invoiceItemId: invoiceItem.id,
          inventoryId: invoiceItem.inventoryId,
          batchId: invoiceItem.batchId || null,
          name: invoiceItem.inventoryName,
          batch: invoiceItem.batchNo || getValue(input, "batch") || null,
          expiry: getValue(input, "expiry") || null,
          unitPrice,
          purchasedQty: invoiceItem.qty,
          returnQty,
          reason: getValue(input, "reason") || req.body.reason_for_return,
          refundAmt,
        };
      });

      const subtotal = returnItems.reduce((sum, item) => sum + item.refundAmt, 0);
      const invoiceTaxableAmount = Math.max(
        0,
        toNumber(invoice.grossAmount) - toNumber(invoice.discountAmount),
      );
      const taxRate =
        invoiceTaxableAmount > 0 ? toNumber(invoice.taxAmount) / invoiceTaxableAmount : 0;
      const tax = subtotal * taxRate;
      const restockingFee = Math.min(
        Math.max(0, toNumber(req.body.restocking_fee)),
        subtotal + tax,
      );
      const returnValue = Math.max(0, subtotal + tax - restockingFee);
      const status = req.body.status || "REFUNDED";

      const count = await tx.salesReturn.count({ where: { organizationId } });
      let returnId = `RET-${String(count + 1).padStart(6, "0")}`;

      const existingReturn = await tx.salesReturn.findUnique({ where: { returnId } });
      if (existingReturn) {
        returnId = `RET-${String(count + 1).padStart(6, "0")}-${Math.floor(
          100 + Math.random() * 900,
        )}`;
      }

      if (status === "REFUNDED") {
        for (const item of returnItems) {
          await applyStockDelta({
            tx,
            organizationId,
            item,
            delta: item.returnQty,
          });
        }
      }

      const created = await tx.salesReturn.create({
        data: {
          organizationId,
          branchId: invoice.branchId || branchId,
          invoiceId: invoice.id,
          returnId,
          originalInvoice: invoice.invoiceId,
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          returnValue,
          reason: req.body.reason_for_return,
          status,
          itemsRestocked: status === "REFUNDED" ? sumReturnQty(returnItems) : 0,
          subtotal,
          tax,
          restockingFee,
          refundMethod: req.body.refund_method,
          note: req.body.note || null,
          items: {
            create: returnItems.map((item) => ({
              invoiceItemId: item.invoiceItemId,
              inventoryId: item.inventoryId,
              batchId: item.batchId,
              name: item.name,
              batch: item.batch,
              expiry: item.expiry,
              unitPrice: item.unitPrice,
              purchasedQty: item.purchasedQty,
              returnQty: item.returnQty,
              reason: item.reason,
              refundAmt: item.refundAmt,
            })),
          },
        },
        include: { items: true },
      });

      await refreshInvoiceStatus(tx, invoice.id);

      return created;
    });

    res.status(201).json({ success: true, data: salesReturn });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const nextStatus = req.body.status;

    const salesReturn = await rootPrisma.$transaction(async (tx) => {
      const existing = await tx.salesReturn.findUnique({
        where: { id: req.params.id as string },
        include: { items: true },
      });

      if (!existing) {
        throw new ErrorHandler("Sales return not found", 404);
      }

      if (
        existing.organizationId !== organizationId ||
        (branchId && existing.branchId !== branchId)
      ) {
        throw new ErrorHandler("Sales return not found", 404);
      }

      if (existing.status !== nextStatus) {
        if (existing.status !== "REFUNDED" && nextStatus === "REFUNDED") {
          for (const item of existing.items) {
            await applyStockDelta({
              tx,
              organizationId,
              item,
              delta: item.returnQty,
            });
          }
        }

        if (existing.status === "REFUNDED" && nextStatus !== "REFUNDED") {
          for (const item of existing.items) {
            await applyStockDelta({
              tx,
              organizationId,
              item,
              delta: -item.returnQty,
            });
          }
        }
      }

      const updated = await tx.salesReturn.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          itemsRestocked:
            nextStatus === "REFUNDED" ? sumReturnQty(existing.items) : 0,
        },
        include: { items: true },
      });

      await refreshInvoiceStatus(tx, existing.invoiceId);

      return updated;
    });

    res.json({ success: true, data: salesReturn });
  });
}
