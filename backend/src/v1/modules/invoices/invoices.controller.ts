import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class InvoicesController {
  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const {
      customerName,
      customerPhone,
      paymentMode,
      grossAmount,
      discountAmount,
      taxAmount,
      deliveryCost,
      totalAmount,
      tenderedAmount,
      changeAmount,
      notes,
      items,
    } = req.body;

    const invoice = await rootPrisma.$transaction(async (tx) => {
      // 1. Generate unique invoiceId
      const count = await tx.invoice.count({
        where: { organizationId },
      });
      let invoiceId = `INV-${String(count + 1).padStart(6, "0")}`;

      // Verify uniqueness
      const existing = await tx.invoice.findUnique({
        where: { invoiceId },
      });
      if (existing) {
        invoiceId = `INV-${String(count + 1).padStart(6, "0")}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // 2. Decrement stock for each item
      for (const item of items) {
        const inventoryItem = await tx.inventory.findFirst({
          where: { id: item.inventoryId, organizationId },
        });

        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.inventoryName} not found.`);
        }

        // Handle batch stock decrement if batchId is provided
        if (item.batchId) {
          const batch = await tx.inventoryBatch.findFirst({
            where: { id: item.batchId, inventoryId: item.inventoryId },
          });

          if (!batch) {
            throw new Error(`Batch ${item.batchNo || ""} not found for item ${item.inventoryName}.`);
          }

          const nextBatchQty = batch.availableQty - item.qty;
          if (nextBatchQty < 0 && !inventoryItem.negativeStock) {
            throw new Error(`Insufficient stock for item ${item.inventoryName} in batch ${batch.batchNo}.`);
          }

          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { availableQty: nextBatchQty },
          });
        }

        // Decrement main inventory stock
        const nextStock = (inventoryItem.availableStock ?? 0) - item.qty;
        if (nextStock < 0 && !inventoryItem.negativeStock) {
          throw new Error(`Insufficient stock for item ${item.inventoryName}.`);
        }

        await tx.inventory.update({
          where: { id: inventoryItem.id },
          data: { availableStock: nextStock },
        });
      }

      // 3. Create the Invoice
      const created = await tx.invoice.create({
        data: {
          organizationId,
          branchId,
          invoiceId,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          paymentMode,
          status: "PAID",
          grossAmount,
          discountAmount,
          taxAmount,
          deliveryCost,
          totalAmount,
          tenderedAmount,
          changeAmount,
          notes: notes || null,
          items: {
            create: items.map((item: any) => ({
              inventoryId: item.inventoryId,
              inventoryName: item.inventoryName,
              batchId: item.batchId || null,
              batchNo: item.batchNo || null,
              qty: item.qty,
              sellUnit: item.sellUnit,
              rateType: item.rateType,
              rateValue: item.rateValue,
              itemDiscount: item.itemDiscount,
              subTotal: item.subTotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return created;
    });

    res.status(201).json({ success: true, data: invoice });
  });

  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { payment_mode, status } = req.query;

    await paginate(res, req.query, async (skip, take, search) => {
      const filters: any = {
        organizationId,
        ...(branchId ? { branchId } : {}),
      };

      if (payment_mode && payment_mode !== "all") {
        filters.paymentMode = payment_mode;
      }

      if (status && status !== "all") {
        filters.status = status;
      }

      if (search && typeof search === "string" && search.trim()) {
        const searchTrim = search.trim();
        filters.OR = [
          { invoiceId: { contains: searchTrim, mode: "insensitive" } },
          { customerName: { contains: searchTrim, mode: "insensitive" } },
          { customerPhone: { contains: searchTrim, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        rootPrisma.invoice.findMany({
          where: filters,
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.invoice.count({ where: filters }),
      ]);

      const mappedData = data.map((inv) => ({
        ...inv,
        item_count: inv.items.length,
      }));

      return { data: mappedData, total };
    });
  });

  static getStats = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = todayStart;

    const filtersToday: any = {
      organizationId,
      createdAt: { gte: todayStart, lt: todayEnd },
      ...(branchId ? { branchId } : {}),
    };

    const filtersYesterday: any = {
      organizationId,
      createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
      ...(branchId ? { branchId } : {}),
    };

    const [todayInvoices, yesterdayInvoices] = await Promise.all([
      rootPrisma.invoice.findMany({ where: filtersToday }),
      rootPrisma.invoice.findMany({ where: filtersYesterday }),
    ]);

    const todaySales = todayInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
    const yesterdaySales = yesterdayInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

    const todayCount = todayInvoices.length;
    const yesterdayCount = yesterdayInvoices.length;

    const todayAvg = todayCount > 0 ? todaySales / todayCount : 0;
    const yesterdayAvg = yesterdayCount > 0 ? yesterdaySales / yesterdayCount : 0;

    const todayRefunds = todayInvoices
      .filter((inv) => inv.status === "REFUNDED")
      .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
    const yesterdayRefunds = yesterdayInvoices
      .filter((inv) => inv.status === "REFUNDED")
      .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

    const getTrendString = (todayVal: number, yesterdayVal: number) => {
      if (yesterdayVal === 0) {
        return todayVal > 0 ? "+100% vs yesterday" : "0% vs yesterday";
      }
      const pct = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
      const sign = pct >= 0 ? "+" : "";
      return `${sign}${pct.toFixed(0)}% vs yesterday`;
    };

    res.json({
      success: true,
      data: {
        todays_sales: todaySales,
        todays_sales_trend: getTrendString(todaySales, yesterdaySales),
        total_invoices: todayCount,
        total_invoices_trend: getTrendString(todayCount, yesterdayCount),
        avg_order_value: todayAvg,
        avg_order_value_trend: getTrendString(todayAvg, yesterdayAvg),
        refunds_issued: todayRefunds,
        refunds_issued_trend: getTrendString(todayRefunds, yesterdayRefunds),
      },
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const id = req.params.id as string;

    const invoice = await rootPrisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    if (invoice.organizationId !== organizationId || (branchId && invoice.branchId !== branchId)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: invoice });
  });

  static getGstSummary = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const invoices = await rootPrisma.invoice.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        createdAt: { gte: start, lte: end },
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
    });

    const batches = await rootPrisma.inventoryBatch.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        receivedAt: { gte: start, lte: end },
      },
      include: {
        inventory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { receivedAt: "desc" },
    });

    let totalSalesGross = 0;
    let totalSalesTax = 0;
    let totalSalesNet = 0;

    const salesList = invoices.map((inv) => {
      const gross = Number(inv.grossAmount);
      const tax = Number(inv.taxAmount);
      const net = Number(inv.totalAmount);
      totalSalesGross += gross;
      totalSalesTax += tax;
      totalSalesNet += net;

      return {
        id: inv.id,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName || "Walk-in Customer",
        customerPhone: inv.customerPhone || null,
        createdAt: inv.createdAt,
        grossAmount: gross,
        taxAmount: tax,
        cgst: tax / 2,
        sgst: tax / 2,
        totalAmount: net,
      };
    });

    const salesCgst = totalSalesTax / 2;
    const salesSgst = totalSalesTax / 2;

    let totalPurchaseGross = 0;
    let totalPurchaseTax = 0;
    let totalPurchaseNet = 0;

    const purchasesList = batches.map((batch) => {
      const qty = batch.receivedQty;
      const rate = Number(batch.purchaseRate || 0);
      const cgstRate = Number(batch.cgst || 0);
      const sgstRate = Number(batch.sgst || 0);

      const taxableAmount = qty * rate;
      const cgst = taxableAmount * (cgstRate / 100);
      const sgst = taxableAmount * (sgstRate / 100);
      const totalGst = cgst + sgst;

      totalPurchaseGross += taxableAmount;
      totalPurchaseTax += totalGst;
      totalPurchaseNet += (taxableAmount + totalGst);

      return {
        id: batch.id,
        batchNo: batch.batchNo,
        itemName: batch.inventory?.name || "Unknown Item",
        receivedAt: batch.receivedAt,
        qty,
        rate,
        taxableAmount,
        cgst,
        sgst,
        totalGst,
        totalAmount: taxableAmount + totalGst,
      };
    });

    const purchaseCgst = totalPurchaseTax / 2;
    const purchaseSgst = totalPurchaseTax / 2;

    const netCgstPayable = Math.max(0, salesCgst - purchaseCgst);
    const netSgstPayable = Math.max(0, salesSgst - purchaseSgst);
    const netTotalPayable = netCgstPayable + netSgstPayable;

    res.json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        sales: {
          taxableAmount: totalSalesGross,
          cgst: salesCgst,
          sgst: salesSgst,
          totalGst: totalSalesTax,
          totalAmount: totalSalesNet,
        },
        purchases: {
          taxableAmount: totalPurchaseGross,
          cgst: purchaseCgst,
          sgst: purchaseSgst,
          totalGst: totalPurchaseTax,
          totalAmount: totalPurchaseNet,
        },
        payable: {
          cgst: netCgstPayable,
          sgst: netSgstPayable,
          totalGst: netTotalPayable,
        },
        salesList,
        purchasesList,
      },
    });
  });
}
