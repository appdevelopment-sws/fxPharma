import { prisma } from "@/lib/prisma.js";

export class HsnRepository {
  static async findAll() {
    return prisma.hsn.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        hsnMappings: {
          include: { tax: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.hsn.findUnique({
      where: { id },
      include: {
        hsnMappings: {
          include: { tax: true },
        },
      },
    });
  }

  static async findByCode(hsncode: string) {
    return prisma.hsn.findFirst({
      where: { hsncode },
    });
  }

  static async create(data: any) {
    const { taxIds, ...hsnData } = data;
    return prisma.$transaction(async (tx) => {
      const hsn = await tx.hsn.create({
        data: hsnData,
      });

      if (taxIds && taxIds.length > 0) {
        await tx.hsnMapping.createMany({
          data: taxIds.map((taxid: string) => ({
            hsnid: hsn.id,
            taxid,
          })),
        });
      }

      return tx.hsn.findUnique({
        where: { id: hsn.id },
        include: { hsnMappings: { include: { tax: true } } },
      });
    });
  }

  static async update(id: string, data: any) {
    const { taxIds, ...hsnData } = data;
    return prisma.$transaction(async (tx) => {
      const hsn = await tx.hsn.update({
        where: { id },
        data: hsnData,
      });

      if (taxIds) {
        await tx.hsnMapping.deleteMany({ where: { hsnid: id } });
        if (taxIds.length > 0) {
          await tx.hsnMapping.createMany({
            data: taxIds.map((taxid: string) => ({
              hsnid: id,
              taxid,
            })),
          });
        }
      }

      return tx.hsn.findUnique({
        where: { id },
        include: { hsnMappings: { include: { tax: true } } },
      });
    });
  }

  static async delete(id: string) {
    return prisma.hsn.delete({
      where: { id },
    });
  }
}
