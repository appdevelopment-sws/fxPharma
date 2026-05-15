import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { rootPrisma } from "@/lib/prisma.js";

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
}
