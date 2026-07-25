import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";

type ExpiryReportStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

const MONTH_YEAR_PATTERN = /^(0[1-9]|1[0-2])\/(\d{4})$/;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDate = (value: unknown) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (!value || typeof value !== "string") return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const parseExpiryMonthYear = (value: unknown) => {
  if (typeof value !== "string") return null;

  const match = value.trim().match(MONTH_YEAR_PATTERN);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);
  return new Date(year, month - 1, 1);
};

const getExpiryDateValue = (value: unknown) => {
  const monthYearDate = parseExpiryMonthYear(value);
  if (monthYearDate) {
    return monthYearDate;
  }

  return parseDate(value);
};

const normalizeDateOnly = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const formatDateOnly = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysRemaining = (expiry: unknown) => {
  const parsed = getExpiryDateValue(expiry);
  if (!parsed) return null;

  const today = normalizeDateOnly(new Date());
  const expiryDay = parseExpiryMonthYear(expiry)
    ? normalizeDateOnly(
        new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0),
      )
    : normalizeDateOnly(parsed);
  return Math.round((expiryDay.getTime() - today.getTime()) / 86400000);
};

const getExpiryStatus = (daysRemaining: number | null): ExpiryReportStatus => {
  if (daysRemaining === null) {
    return "ACTIVE";
  }

  if (daysRemaining <= 0) {
    return "EXPIRED";
  }

  if (daysRemaining <= 30) {
    return "EXPIRING_SOON";
  }

  return "ACTIVE";
};

const getStatusLabel = (status: ExpiryReportStatus) => {
  switch (status) {
    case "EXPIRED":
      return "Expired";
    case "EXPIRING_SOON":
      return "Expiring Soon";
    default:
      return "Active";
  }
};

const formatExpiryValue = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (MONTH_YEAR_PATTERN.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = parseDate(value);
  if (!parsed) {
    return typeof value === "string" ? value : null;
  }

  return formatDateOnly(normalizeDateOnly(parsed));
};

const getExpiryComparableDate = (value: unknown) => {
  const monthYearDate = parseExpiryMonthYear(value);
  if (monthYearDate) {
    return normalizeDateOnly(
      new Date(monthYearDate.getFullYear(), monthYearDate.getMonth() + 1, 0),
    );
  }

  const parsed = parseDate(value);
  return parsed ? normalizeDateOnly(parsed) : null;
};

const buildExpiryReportRow = (batch: any) => {
  const expiryDate = batch.expiryDate ?? batch.expiry ?? null;
  const daysRemaining = getDaysRemaining(expiryDate);
  const status = getExpiryStatus(daysRemaining);
  const stockQty = toNumber(batch.availableQty);
  const purchaseRate = toNumber(batch.purchaseRate);
  const mrp = toNumber(batch.mrp);
  const value = purchaseRate > 0 ? purchaseRate * stockQty : mrp * stockQty;
  const inventory = batch.inventory ?? {};

  return {
    id: batch.id,
    inventoryId: batch.inventoryId,
    productName: inventory.name ?? "-",
    saltComposition: inventory.saltComposition ?? null,
    manufacturer: inventory.manufacturer
      ? {
          id: inventory.manufacturer.id,
          name: inventory.manufacturer.name ?? null,
        }
      : null,
    category: inventory.category
      ? {
          id: inventory.category.id,
          name: inventory.category.name ?? null,
        }
      : null,
    batchNo: batch.batchNo ?? "-",
    expiryDate: formatExpiryValue(expiryDate),
    expiry: formatExpiryValue(batch.expiry ?? expiryDate),
    remainingDays: daysRemaining,
    stockQty,
    unit: batch.unit ?? null,
    value,
    status,
    statusLabel: getStatusLabel(status),
    purchaseRate,
    mrp,
    rateA: toNumber(batch.rateA),
    rateB: toNumber(batch.rateB),
    rateC: toNumber(batch.rateC),
    cgst: toNumber(batch.cgst),
    sgst: toNumber(batch.sgst),
    receivedAt: batch.receivedAt,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };
};

export class InventoryController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { status } = req.query;

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
              { barcode: { contains: search, mode: "insensitive" } },
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
      if (status) {
        filters.status = String(status);
      }
      const [data, total] = await Promise.all([
        rootPrisma.inventory.findMany({
          where: filters,
          include: {
            brand: true,
            category: true,
            manufacturer: true,
            batches: {
              orderBy: [{ expiryDate: "asc" }, { receivedAt: "asc" }],
            },
          },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.inventory.count({ where: filters }),
      ]);

      const mappedData = data.map((inv: any) => {
        if (inv.batches && inv.batches.length > 0) {
          const computedStock = inv.batches.reduce(
            (sum: number, b: any) => sum + (b.availableQty ?? 0),
            0
          )
          return { ...inv, availableStock: computedStock }
        }
        return inv
      })

      return { data: mappedData, total }
    })
  })

  static getExpiryReport = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt((req.query.limit as string) || "10") || 10),
    );
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const statusFilter =
      typeof req.query.status === "string" ? req.query.status.trim() : "all";
    const categoryFilter =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "all";
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const where: any = {
      organizationId,
      ...(branchId
        ? {
            OR: [{ branchId }, { branchId: null }],
          }
        : {}),
      availableQty: { gt: 0 },
    };
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { batchNo: { contains: search, mode: "insensitive" } },
          {
            inventory: {
              is: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            inventory: {
              is: {
                saltComposition: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            inventory: {
              is: {
                manufacturer: {
                  is: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          },
          {
            inventory: {
              is: {
                category: {
                  is: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          },
        ],
      });
    }

    if (categoryFilter && categoryFilter !== "all") {
      andConditions.push({
        inventory: {
          is: {
            categoryId: categoryFilter,
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const batches = await (rootPrisma as any).inventoryBatch.findMany({
      where,
      include: {
        inventory: {
          include: {
            manufacturer: true,
            category: true,
          },
        },
      },
      orderBy: [{ expiryDate: "asc" }, { receivedAt: "asc" }],
    });

    const rows = (batches as any[])
      .map(buildExpiryReportRow)
      .filter((row: ReturnType<typeof buildExpiryReportRow>) => {
        if (from) {
          const expiry = getExpiryComparableDate(row.expiryDate);
          if (!expiry || expiry < normalizeDateOnly(from)) {
            return false;
          }
        }

        if (to) {
          const expiry = getExpiryComparableDate(row.expiryDate);
          if (!expiry || expiry > normalizeDateOnly(to)) {
            return false;
          }
        }

        return true;
      });

    const stats = rows.reduce(
      (
        acc: {
          alreadyExpired: number;
          expiring15: number;
          expiring30: number;
          expiring90: number;
          valueAtRisk: number;
        },
        row: ReturnType<typeof buildExpiryReportRow>,
      ) => {
        acc.valueAtRisk += row.value;

        if (row.remainingDays !== null) {
          if (row.remainingDays <= 0) {
            acc.alreadyExpired += 1;
          } else {
            if (row.remainingDays <= 15) {
              acc.expiring15 += 1;
            }
            if (row.remainingDays <= 30) {
              acc.expiring30 += 1;
            }
            if (row.remainingDays <= 90) {
              acc.expiring90 += 1;
            }
          }
        }

        return acc;
      },
      {
        alreadyExpired: 0,
        expiring15: 0,
        expiring30: 0,
        expiring90: 0,
        valueAtRisk: 0,
      },
    );

    const filteredRows = rows.filter(
      (row: ReturnType<typeof buildExpiryReportRow>) => {
        if (statusFilter !== "all") {
          if (statusFilter === "EXPIRED") {
            if (row.remainingDays === null || row.remainingDays > 0)
              return false;
          } else if (statusFilter === "EXPIRING_15") {
            if (
              row.remainingDays === null ||
              row.remainingDays <= 0 ||
              row.remainingDays > 15
            )
              return false;
          } else if (statusFilter === "EXPIRING_30") {
            if (
              row.remainingDays === null ||
              row.remainingDays <= 0 ||
              row.remainingDays > 30
            )
              return false;
          } else if (statusFilter === "EXPIRING_90") {
            if (
              row.remainingDays === null ||
              row.remainingDays <= 0 ||
              row.remainingDays > 90
            )
              return false;
          } else if (statusFilter === "ACTIVE") {
            if (row.status !== "ACTIVE") return false;
          } else if (row.status !== statusFilter) {
            return false;
          }
        }

        return true;
      },
    );

    const total = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filteredRows.slice(start, start + limit);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats,
    });
  });

  static getLowStockReport = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt((req.query.limit as string) || "10") || 10),
    );
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const statusFilter =
      typeof req.query.status === "string" ? req.query.status.trim() : "all";

    const where: any = {
      organizationId,
      ...(branchId
        ? {
            OR: [{ branchId }, { branchId: null }],
          }
        : {}),
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { saltComposition: { contains: search, mode: "insensitive" } },
            {
              manufacturer: {
                is: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            },
            {
              category: {
                is: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        },
      ];
    }

    const items = await rootPrisma.inventory.findMany({
      where,
      include: {
        manufacturer: true,
        category: true,
        brand: true,
        unit: true,
      },
      orderBy: { availableStock: "asc" },
    });

    const allLowStockItems = items.filter((item) => {
      const threshold = item.minQty && item.minQty > 0 ? item.minQty : 10;
      return (item.availableStock ?? 0) <= threshold;
    });

    // Calculate stats on all matching low stock items
    const stats = {
      totalLowStock: allLowStockItems.length,
      outOfStock: allLowStockItems.filter(
        (item) => (item.availableStock ?? 0) === 0,
      ).length,
      nearReorder: allLowStockItems.filter((item) => {
        const threshold = item.minQty && item.minQty > 0 ? item.minQty : 10;
        const stock = item.availableStock ?? 0;
        return stock > 0 && stock <= threshold / 2;
      }).length,
    };

    const filteredLowStockItems = allLowStockItems.filter((item) => {
      if (statusFilter !== "all") {
        const threshold = item.minQty && item.minQty > 0 ? item.minQty : 10;
        if (statusFilter === "OUT_OF_STOCK") {
          return (item.availableStock ?? 0) === 0;
        }
        if (statusFilter === "CRITICAL") {
          const stock = item.availableStock ?? 0;
          return stock > 0 && stock <= threshold / 2;
        }
      }
      return true;
    });

    const total = filteredLowStockItems.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filteredLowStockItems.slice(start, start + limit);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats,
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
        batches: {
          orderBy: [{ expiryDate: "asc" }, { receivedAt: "asc" }],
        },
      } as any,
    });

    if (!inventory) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    if (inventory.organizationId !== organizationId) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    let computedStock = inventory.availableStock ?? 0;
    if ((inventory as any).batches && (inventory as any).batches.length > 0) {
      computedStock = (inventory as any).batches.reduce(
        (sum: number, b: any) => sum + (b.availableQty ?? 0),
        0
      );
    }

    res.json({
      success: true,
      data: {
        ...inventory,
        availableStock: computedStock,
      },
    });
  });
  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const { imageUrl, barcode, ...body } = req.body;

    const inventory = await rootPrisma.inventory.create({
      data: {
        ...body,
        barcode: barcode ? String(barcode).trim() : null,
        imageUrl: imageUrl ?? null,
        organizationId,
        branchId,
        daysLimit: body.daysLimit ? body.daysLimit : null,
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

    const { id, createdAt, updatedAt, imageUrl, barcode, ...data } = req.body;

    const inventory = await rootPrisma.inventory.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        barcode: barcode !== undefined ? (barcode ? String(barcode).trim() : null) : undefined,
        imageUrl: imageUrl ?? null,
        daysLimit: data.daysLimit ? data.daysLimit : null,
      },
    });
    res.json({ success: true, data: inventory });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const inventoryId = req.params.id as string;

    const existing = await rootPrisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existing) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    if (existing.organizationId !== organizationId) {
      throw new ErrorHandler("Inventory item not found", 404);
    }

    try {
      await rootPrisma.inventory.delete({
        where: { id: inventoryId },
      });

      return res.json({
        success: true,
        message: "Inventory item deleted successfully",
      });
    } catch (error: any) {
      // Prisma Foreign Key Constraint Error
      if (error.code === "P2003") {
        await rootPrisma.inventory.update({
          where: { id: inventoryId },
          data: {
            status: "DISCONTINUE",
          },
        });

        return res.json({
          success: true,
          message:
            "Inventory item is linked with transactions, so it was marked as DISCONTINUE instead of being deleted",
        });
      }

      throw error;
    }
  });
}
