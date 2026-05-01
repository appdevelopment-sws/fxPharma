import { prisma } from "@/lib/prisma.js";

export class TaxRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.tax.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.tax.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.tax.findUnique({
      where: { id },
      include: {
        hsnMappings: {
          include: {
            hsn: true,
          },
        },
      },
    });
  }

  static async create(data: any) {
    return prisma.tax.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.tax.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.tax.delete({
      where: { id },
    });
  }
}
