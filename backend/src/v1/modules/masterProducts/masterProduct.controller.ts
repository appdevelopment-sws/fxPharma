import fs from "node:fs/promises";
import { Request, Response } from "express";
import XLSX from "xlsx";
import ExcelJS from "exceljs";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const getFilterValue = (value: unknown) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" && normalized !== "all"
    ? normalized
    : undefined;
};

export class MasterProductController {
  private static mapToPrisma(data: any) {
    const mapped: any = {
      name: data.name,
      industrySegment: data.industry_segment,
      imageUrl: data.image_url,
      categoryId: data.category_id || null,
      brandId: data.brand_id || null,
      manufacturerId: data.manufacturer_id || null,
      salt: data.salt || null,
      hsnId: data.hsn_code_id || null,
      categoryType: data.category_type,
      status: data.status,
      colorType: data.color_type,
      isNarcotic: !!data.is_narcotic,
      isScheduleH: !!data.is_schedule_h,
      isScheduleH1: !!data.is_schedule_h1,
    };

    Object.keys(mapped).forEach(
      (key) => mapped[key] === undefined && delete mapped[key],
    );

    return mapped;
  }

  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const brandId = getFilterValue(req.query.brandId);
      const manufacturerId = getFilterValue(req.query.manufacturerId);
      const categoryType = getFilterValue(req.query.categoryType);
      const status = getFilterValue(req.query.status);

      const where: any = {
        AND: [
          brandId ? { brandId } : {},
          manufacturerId ? { manufacturerId } : {},
          categoryType ? { categoryType } : {},
          status ? { status } : {},
          search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    salt: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    categoryType: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      is: {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                  {
                    manufacturer: {
                      is: {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                  {
                    category: {
                      is: {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                  {
                    hsn: {
                      is: {
                        OR: [
                          {
                            hsncode: {
                              contains: search,
                              mode: "insensitive",
                            },
                          },
                          {
                            description: {
                              contains: search,
                              mode: "insensitive",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    barcodes: {
                      some: {
                        value: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              }
            : {},
        ],
      };

      const [data, total] = await Promise.all([
        rootPrisma.masterProduct.findMany({
          where,
          skip,
          take,
          include: {
            category: true,
            brand: true,
            manufacturer: true,
            hsn: true,
            barcodes: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        rootPrisma.masterProduct.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const product = await rootPrisma.masterProduct.findUnique({
      where: { id: req.params.id as string },
      include: {
        category: true,
        brand: true,
        manufacturer: true,
        hsn: true,
        barcodes: true,
      },
    });

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    res.json({
      success: true,
      data: product,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { barcodes } = req.body;

    const product = await rootPrisma.masterProduct.create({
      data: {
        ...this.mapToPrisma(req.body),
        barcodes: barcodes
          ? {
              create: barcodes
                .filter((b: any) => b.value)
                .map((b: any) => ({
                  value: b.value,
                })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        manufacturer: true,
        hsn: true,
        barcodes: true,
      },
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.masterProduct.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Product not found", 404);
    }

    const { barcodes } = req.body;

    const product = await rootPrisma.masterProduct.update({
      where: { id: req.params.id as string },
      data: {
        ...this.mapToPrisma(req.body),
        barcodes: barcodes
          ? {
              deleteMany: {},
              create: barcodes
                .filter((b: any) => b.value)
                .map((b: any) => ({
                  value: b.value,
                })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        manufacturer: true,
        hsn: true,
        barcodes: true,
      },
    });

    res.json({
      success: true,
      data: product,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const existing = await rootPrisma.masterProduct.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("Product not found", 404);
    }

    await rootPrisma.masterProduct.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  });

  static downloadTemplate = catchAsync(async (req: Request, res: Response) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Template");

    // Enable gridlines
    worksheet.views = [{ showGridLines: true }];

    const headers = [
      "Product Name",
      "Industry Segment",
      "Category",
      "Brand",
      "Manufacturer",
      "Salt Composition",
      "Category Type",
      "Status",
      "HSN Code",
      "Color Type",
      "Barcodes",
      "Narcotic Drug",
      "Schedule H",
      "Schedule H1",
    ];

    const sampleRow = [
      "Crocin Advance 650mg",
      "1",
      "Tablets",
      "GlaxoSmithKline",
      "GlaxoSmithKline Consumer Healthcare",
      "Paracetamol 650mg",
      "TAB",
      "CONTINUE",
      "30049011",
      "WHITE",
      "8901208711413, 8901208711420",
      "No",
      "Yes",
      "No",
    ];

    // Add headers
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.height = 32;

    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo-600
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFC7D2FE" } },
        left: { style: "thin", color: { argb: "FFC7D2FE" } },
        bottom: { style: "medium", color: { argb: "FF312E81" } },
        right: { style: "thin", color: { argb: "FFC7D2FE" } },
      };
    });

    // Add sample row
    worksheet.addRow(sampleRow);
    const sampleDataRow = worksheet.getRow(2);
    sampleDataRow.height = 24;

    sampleDataRow.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        size: 10,
        color: { argb: "FF374151" }, // slate-700
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF9FAFB" }, // slate-50
      };
    });

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        if (cell.value) {
          const len = String(cell.value).length;
          if (len > maxLen) maxLen = len;
        }
      });
      column.width = Math.min(maxLen + 6, 35);
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as any;

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product_import_template.xlsx",
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.status(200).send(buffer);
  });

  static bulkImport = catchAsync(async (req: Request, res: Response) => {
    console.log(
      "Received file for bulk import:",
      req.file?.originalname,
      "size:",
      req.file?.size,
    );
    const { organizationId, branchId } = getRequestScope(req);

    if (!req.file) {
      throw new ErrorHandler("No file uploaded", 400);
    }

    const filePath = req.file.path;

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const parseBool = (val: any) => {
      if (val === undefined || val === null) return false;
      const s = String(val).trim().toLowerCase();
      return s === "yes" || s === "true" || s === "1";
    };

    try {
      const workbook = XLSX.readFile(filePath, {
        dense: false,
        cellDates: false,
        raw: false,
      });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new ErrorHandler("Excel file is empty", 400);
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(worksheet, {
        raw: false,
        defval: "",
      });

      if (rows.length === 0) {
        throw new ErrorHandler("Excel file has no data rows", 400);
      }

      console.log(`Bulk import: Processing ${rows.length} rows with batch strategy...`);

      // ─── PHASE 1: Pre-fetch all existing reference data into Maps ───
      // This replaces N individual findFirst calls with just 4 bulk queries.

      const buildMap = (items: { id: string; name: string | null }[]) => {
        const map = new Map<string, string>();
        for (const item of items) {
          if (item.name) map.set(item.name.toLowerCase().trim(), item.id);
        }
        return map;
      };

      const [existingCategories, existingBrands, existingManufacturers, existingHsn] =
        await Promise.all([
          rootPrisma.category.findMany({
            where: { organizationId },
            select: { id: true, name: true },
          }),
          rootPrisma.brand.findMany({
            where: { organizationId },
            select: { id: true, name: true },
          }),
          rootPrisma.manufacturer.findMany({
            where: { organizationId },
            select: { id: true, name: true },
          }),
          rootPrisma.hsn.findMany({
            select: { id: true, hsncode: true },
          }),
        ]);

      const categoryMap = buildMap(existingCategories);
      const brandMap = buildMap(existingBrands);
      const manufacturerMap = buildMap(existingManufacturers);
      // HSN uses hsncode instead of name
      const hsnMap = new Map<string, string>();
      for (const h of existingHsn) {
        hsnMap.set(h.hsncode.toLowerCase().trim(), h.id);
      }

      // ─── PHASE 2: Collect all unique new names from the file ───

      const newCategoryNames = new Set<string>();
      const newBrandNames = new Set<string>();
      const newManufacturerNames = new Set<string>();
      const newHsnCodes = new Set<string>();

      for (const row of rows) {
        const catName = row["Category"] || row["category"];
        if (catName && typeof catName === "string" && catName.trim()) {
          const key = catName.trim().toLowerCase();
          if (!categoryMap.has(key)) newCategoryNames.add(catName.trim());
        }

        const bName = row["Brand"] || row["brand"] || row["Brand Name"];
        if (bName && typeof bName === "string" && bName.trim()) {
          const key = bName.trim().toLowerCase();
          if (!brandMap.has(key)) newBrandNames.add(bName.trim());
        }

        const mName =
          row["Manufacturer"] || row["manufacturer"] || row["Parent Manufacturer"];
        if (mName && typeof mName === "string" && mName.trim()) {
          const key = mName.trim().toLowerCase();
          if (!manufacturerMap.has(key)) newManufacturerNames.add(mName.trim());
        }

        const hCode = row["HSN Code"] || row["hsn"] || row["HSN/SAC Code"];
        if (hCode) {
          const key = String(hCode).trim().toLowerCase();
          if (!hsnMap.has(key)) newHsnCodes.add(String(hCode).trim());
        }
      }

      // ─── PHASE 3: Batch-create missing reference entities ───

      if (newCategoryNames.size > 0) {
        await rootPrisma.category.createMany({
          data: Array.from(newCategoryNames).map((name) => ({
            name,
            organizationId,
            branchId,
          })),
          skipDuplicates: true,
        });
        // Re-fetch to get new IDs
        const fresh = await rootPrisma.category.findMany({
          where: { organizationId },
          select: { id: true, name: true },
        });
        categoryMap.clear();
        for (const item of fresh) {
          categoryMap.set(item.name.toLowerCase().trim(), item.id);
        }
      }

      if (newBrandNames.size > 0) {
        await rootPrisma.brand.createMany({
          data: Array.from(newBrandNames).map((name) => ({
            name,
            organizationId,
            branchId,
          })),
          skipDuplicates: true,
        });
        const fresh = await rootPrisma.brand.findMany({
          where: { organizationId },
          select: { id: true, name: true },
        });
        brandMap.clear();
        for (const item of fresh) {
          brandMap.set(item.name.toLowerCase().trim(), item.id);
        }
      }

      if (newManufacturerNames.size > 0) {
        await rootPrisma.manufacturer.createMany({
          data: Array.from(newManufacturerNames).map((name) => ({
            name,
            email: "",
            phone: "",
            address: "",
            organizationId,
            isGlobal: true,
            branchId,
          })),
          skipDuplicates: true,
        });
        const fresh = await rootPrisma.manufacturer.findMany({
          where: { organizationId },
          select: { id: true, name: true },
        });
        manufacturerMap.clear();
        for (const item of fresh) {
          if (item.name) manufacturerMap.set(item.name.toLowerCase().trim(), item.id);
        }
      }

      if (newHsnCodes.size > 0) {
        await rootPrisma.hsn.createMany({
          data: Array.from(newHsnCodes).map((code) => ({
            hsncode: code,
            description: "Auto created on import",
          })),
          skipDuplicates: true,
        });
        const fresh = await rootPrisma.hsn.findMany({
          select: { id: true, hsncode: true },
        });
        hsnMap.clear();
        for (const h of fresh) {
          hsnMap.set(h.hsncode.toLowerCase().trim(), h.id);
        }
      }

      // ─── PHASE 4: Pre-fetch all existing barcodes into a Set ───

      const existingBarcodes = await rootPrisma.masterProductBarcode.findMany({
        select: { value: true },
      });
      const existingBarcodeSet = new Set<string>(
        existingBarcodes.map((b) => b.value),
      );

      // ─── PHASE 5: Build product data and batch insert in chunks ───

      const CHUNK_SIZE = 1000;

      // Parsed row data with resolved IDs
      type ParsedProduct = {
        rowNum: number;
        name: string;
        industrySegment: string;
        categoryId: string | null;
        brandId: string | null;
        manufacturerId: string | null;
        salt: string | null;
        hsnId: string | null;
        categoryType: string;
        status: string;
        colorType: string;
        isNarcotic: boolean;
        isScheduleH: boolean;
        isScheduleH1: boolean;
        barcodes: string[];
      };

      const parsedProducts: ParsedProduct[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;

        try {
          const productName =
            row["Product Name"] || row["name"] || row["Product Full Name"];
          if (
            !productName ||
            typeof productName !== "string" ||
            !productName.trim()
          ) {
            errors.push(`Row ${rowNum}: Product Name is required`);
            errorCount++;
            continue;
          }

          // Resolve Category ID from map
          let categoryId: string | null = null;
          const categoryName = row["Category"] || row["category"];
          if (categoryName && typeof categoryName === "string" && categoryName.trim()) {
            categoryId = categoryMap.get(categoryName.trim().toLowerCase()) || null;
          }

          // Resolve Brand ID from map
          let brandId: string | null = null;
          const brandName = row["Brand"] || row["brand"] || row["Brand Name"];
          if (brandName && typeof brandName === "string" && brandName.trim()) {
            brandId = brandMap.get(brandName.trim().toLowerCase()) || null;
          }

          // Resolve Manufacturer ID from map
          let manufacturerId: string | null = null;
          const manufacturerName =
            row["Manufacturer"] || row["manufacturer"] || row["Parent Manufacturer"];
          if (manufacturerName && typeof manufacturerName === "string" && manufacturerName.trim()) {
            manufacturerId = manufacturerMap.get(manufacturerName.trim().toLowerCase()) || null;
          }

          // Resolve HSN ID from map
          let hsnId: string | null = null;
          const hsnCode = row["HSN Code"] || row["hsn"] || row["HSN/SAC Code"];
          if (hsnCode) {
            hsnId = hsnMap.get(String(hsnCode).trim().toLowerCase()) || null;
          }

          // Collect valid barcodes (skip already existing ones)
          const barcodeString =
            row["Barcodes"] || row["barcode"] || row["Registered Barcodes"];
          const validBarcodes: string[] = [];
          if (barcodeString) {
            const codes = String(barcodeString)
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);

            for (const code of codes) {
              if (!existingBarcodeSet.has(code)) {
                validBarcodes.push(code);
                // Mark as existing so later rows don't duplicate
                existingBarcodeSet.add(code);
              }
            }
          }

          const categoryType = String(
            row["Category Type"] || row["category_type"] || "TAB",
          ).trim().toUpperCase();
          const status = String(
            row["Status"] || row["status"] || "CONTINUE",
          ).trim().toUpperCase();
          const colorType = String(
            row["Color Type"] || row["color_type"] || "NORMAL",
          ).trim().toUpperCase();
          const industrySegment = String(
            row["Industry Segment"] || row["industry_segment"] || "1",
          ).trim();

          parsedProducts.push({
            rowNum,
            name: productName.trim(),
            industrySegment,
            categoryId,
            brandId,
            manufacturerId,
            salt: row["Salt Composition"] || row["salt"] || null,
            hsnId,
            categoryType,
            status,
            colorType,
            isNarcotic: parseBool(row["Narcotic Drug"] || row["is_narcotic"] || row["narcotic"]),
            isScheduleH: parseBool(row["Schedule H"] || row["is_schedule_h"] || row["schedule_h"]),
            isScheduleH1: parseBool(row["Schedule H1"] || row["is_schedule_h1"] || row["schedule_h1"]),
            barcodes: validBarcodes,
          });
        } catch (err: any) {
          errors.push(`Row ${rowNum}: ${err.message || "Unknown error"}`);
          errorCount++;
        }
      }

      // Process in chunks using transactions
      for (let c = 0; c < parsedProducts.length; c += CHUNK_SIZE) {
        const chunk = parsedProducts.slice(c, c + CHUNK_SIZE);

        try {
          await rootPrisma.$transaction(async (tx) => {
            for (const product of chunk) {
              const created = await tx.masterProduct.create({
                data: {
                  name: product.name,
                  industrySegment: product.industrySegment,
                  categoryId: product.categoryId,
                  brandId: product.brandId,
                  manufacturerId: product.manufacturerId,
                  salt: product.salt,
                  hsnId: product.hsnId,
                  categoryType: product.categoryType,
                  status: product.status,
                  colorType: product.colorType,
                  isNarcotic: product.isNarcotic,
                  isScheduleH: product.isScheduleH,
                  isScheduleH1: product.isScheduleH1,
                },
              });

              if (product.barcodes.length > 0) {
                await tx.masterProductBarcode.createMany({
                  data: product.barcodes.map((value) => ({
                    value,
                    masterProductId: created.id,
                  })),
                  skipDuplicates: true,
                });
              }
            }
          }, {
            timeout: 120000, // 2 minute timeout for large chunks
          });

          successCount += chunk.length;
          console.log(
            `Bulk import: Chunk ${Math.floor(c / CHUNK_SIZE) + 1} done (${Math.min(c + CHUNK_SIZE, parsedProducts.length)}/${parsedProducts.length} products)`,
          );
        } catch (err: any) {
          console.error(`Error importing chunk starting at index ${c}:`, err);
          // Mark all rows in the failed chunk as errors
          for (const product of chunk) {
            errors.push(`Row ${product.rowNum}: ${err.message || "Chunk insert failed"}`);
          }
          errorCount += chunk.length;
        }
      }
    } finally {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors; temp file will be removed by the environment eventually.
      }
    }

    console.log(
      `Bulk import complete: ${successCount} success, ${errorCount} errors`,
    );

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${successCount} products imported successfully, ${errorCount} failed.`,
      data: {
        successCount,
        errorCount,
        errors,
      },
    });
  });
}
