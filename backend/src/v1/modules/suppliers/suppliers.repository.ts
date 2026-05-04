import { prisma } from "@/lib/prisma.js";

export class SuppliersRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.supplier.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.supplier.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.supplier.delete({
      where: { id },
    });
  }
}
