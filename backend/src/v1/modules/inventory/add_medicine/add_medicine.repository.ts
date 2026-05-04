import { prisma } from "@/lib/prisma.js";

export class InventoryRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.inventory.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.inventory.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.inventory.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.inventory.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.inventory.delete({
      where: { id },
    });
  }
}
