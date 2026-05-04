import { prisma } from "@/lib/prisma.js";

export class MasterProductRepository {
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

    // Remove undefined fields
    Object.keys(mapped).forEach(
      (key) => mapped[key] === undefined && delete mapped[key],
    );

    return mapped;
  }

  static async getAll(search: string = "", skip: number = 0, take: number = 10) {

    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                  barcodes: {
                    some: { value: { contains: search, mode: "insensitive" } },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.masterProduct.findMany({
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.masterProduct.count({ where }),
    ]);

    return { data, total };
  }

  static async getById(id: string) {
    return prisma.masterProduct.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        manufacturer: true,
        hsn: true,
        barcodes: true,
      },
    });
  }

  static async create(data: any) {
    const { barcodes } = data;
    const productData = this.mapToPrisma(data);

    return prisma.masterProduct.create({
      data: {
        ...productData,
        barcodes: barcodes
          ? {
              create: barcodes
                .filter((b: any) => b.value)
                .map((b: any) => ({ value: b.value })),
            }
          : undefined,
      },
      include: {
        barcodes: true,
      },
    });
  }

  static async update(id: string, data: any) {
    const { barcodes } = data;
    const productData = this.mapToPrisma(data);

    return prisma.masterProduct.update({
      where: { id },
      data: {
        ...productData,
        barcodes: barcodes
          ? {
              deleteMany: {},
              create: barcodes
                .filter((b: any) => b.value)
                .map((b: any) => ({ value: b.value })),
            }
          : undefined,
      },
      include: {
        barcodes: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.masterProduct.delete({
      where: { id },
    });
  }
}
