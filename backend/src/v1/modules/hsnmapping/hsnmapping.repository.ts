import { prisma } from "@/lib/prisma.js";

export class HsnMappingRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.hsnMapping.findMany({
        where: filters,
        include: {
          hsn: true,
          tax: true,
        },
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.hsnMapping.count({ where: filters }),
    ]);

    return { data, total };
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

  static async update(id: string, data: any) {
    return prisma.hsnMapping.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.hsnMapping.delete({
      where: { id },
    });
  }
}
