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

          // Category
          let categoryId: string | null = null;
          const categoryName = row["Category"] || row["category"];
          if (
            categoryName &&
            typeof categoryName === "string" &&
            categoryName.trim()
          ) {
            const trimmed = categoryName.trim();
            let category = await rootPrisma.category.findFirst({
              where: {
                name: { equals: trimmed, mode: "insensitive" },
                organizationId,
              },
            });
            if (!category) {
              category = await rootPrisma.category.create({
                data: { name: trimmed, organizationId, branchId },
              });
            }
            categoryId = category.id;
          }

          // Brand
          let brandId: string | null = null;
          const brandName = row["Brand"] || row["brand"] || row["Brand Name"];
          if (brandName && typeof brandName === "string" && brandName.trim()) {
            const trimmed = brandName.trim();
            let brand = await rootPrisma.brand.findFirst({
              where: {
                name: { equals: trimmed, mode: "insensitive" },
                organizationId,
              },
            });
            if (!brand) {
              brand = await rootPrisma.brand.create({
                data: { name: trimmed, organizationId, branchId },
              });
            }
            brandId = brand.id;
          }

          // Manufacturer
          let manufacturerId: string | null = null;
          const manufacturerName =
            row["Manufacturer"] ||
            row["manufacturer"] ||
            row["Parent Manufacturer"];
          if (
            manufacturerName &&
            typeof manufacturerName === "string" &&
            manufacturerName.trim()
          ) {
            const trimmed = manufacturerName.trim();
            let manufacturer = await rootPrisma.manufacturer.findFirst({
              where: {
                name: { equals: trimmed, mode: "insensitive" },
                organizationId,
              },
            });
            if (!manufacturer) {
              manufacturer = await rootPrisma.manufacturer.create({
                data: {
                  name: trimmed,
                  email: "",
                  phone: "",
                  address: "",
                  organizationId,
                  isGlobal: true,
                  branchId,
                },
              });
            }
            manufacturerId = manufacturer.id;
          }

          // HSN
          let hsnId: string | null = null;
          const hsnCode = row["HSN Code"] || row["hsn"] || row["HSN/SAC Code"];
          if (hsnCode) {
            const trimmed = String(hsnCode).trim();
            let hsn = await rootPrisma.hsn.findFirst({
              where: { hsncode: { equals: trimmed, mode: "insensitive" } },
            });
            if (!hsn) {
              hsn = await rootPrisma.hsn.create({
                data: {
                  hsncode: trimmed,
                  description: "Auto created on import",
                },
              });
            }
            hsnId = hsn.id;
          }

          const parseBool = (val: any) => {
            if (val === undefined || val === null) return false;
            const s = String(val).trim().toLowerCase();
            return s === "yes" || s === "true" || s === "1";
          };

          const isNarcotic = parseBool(
            row["Narcotic Drug"] || row["is_narcotic"] || row["narcotic"],
          );
          const isScheduleH = parseBool(
            row["Schedule H"] || row["is_schedule_h"] || row["schedule_h"],
          );
          const isScheduleH1 = parseBool(
            row["Schedule H1"] || row["is_schedule_h1"] || row["schedule_h1"],
          );

          // Barcodes
          const barcodeString =
            row["Barcodes"] || row["barcode"] || row["Registered Barcodes"];
          const barcodesToCreate: { value: string }[] = [];
          if (barcodeString) {
            const codes = String(barcodeString)
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);

            for (const code of codes) {
              const exists = await rootPrisma.masterProductBarcode.findUnique({
                where: { value: code },
              });
              if (!exists) {
                barcodesToCreate.push({ value: code });
              } else {
                console.log(
                  `Skipping barcode "${code}" on row ${rowNum} because it already exists in DB`,
                );
              }
            }
          }

          const categoryType = String(
            row["Category Type"] || row["category_type"] || "TAB",
          )
            .trim()
            .toUpperCase();
          const status = String(row["Status"] || row["status"] || "CONTINUE")
            .trim()
            .toUpperCase();
          const colorType = String(
            row["Color Type"] || row["color_type"] || "NORMAL",
          )
            .trim()
            .toUpperCase();
          const industrySegment = String(
            row["Industry Segment"] || row["industry_segment"] || "1",
          ).trim();

          await rootPrisma.masterProduct.create({
            data: {
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
              isNarcotic,
              isScheduleH,
              isScheduleH1,

              barcodes:
                barcodesToCreate.length > 0
                  ? {
                      create: barcodesToCreate,
                    }
                  : undefined,
            },
          });

          successCount++;
        } catch (err: any) {
          console.error(`Error importing row ${rowNum}:`, err);
          errors.push(`Row ${rowNum}: ${err.message || "Unknown error"}`);
          errorCount++;
        }
      }
    } finally {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors; temp file will be removed by the environment eventually.
      }
    }

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
