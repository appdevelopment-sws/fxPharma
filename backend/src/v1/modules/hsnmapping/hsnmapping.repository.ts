import { prisma } from "@/lib/prisma.js";

export class HsnMappingRepository {
  static async findAll() {
    return prisma.hsnMapping.findMany({
      include: {
        hsn: true,
        tax: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.hsnMapping.findUnique({
      where: { id },
      include: {
        hsn: true,
        tax: true,
      },
    });
  }

  static async findByHsnAndTax(hsnid: string, taxid: string) {
    return prisma.hsnMapping.findUnique({
      where: {
        hsnid_taxid: { hsnid, taxid },
      },
    });
  }

  static async create(data: any) {
    return prisma.hsnMapping.create({
      data,
    });
  }

  static async delete(id: string) {
    return prisma.hsnMapping.delete({
      where: { id },
    });
  }
}
