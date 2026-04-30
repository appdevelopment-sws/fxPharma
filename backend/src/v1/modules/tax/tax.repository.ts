import { prisma } from "@/lib/prisma.js";

export class TaxRepository {
  static async findAll() {
    return prisma.tax.findMany({
      orderBy: { createdAt: "desc" },
    });
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
