import { prisma } from "@/lib/prisma.js";

export class UnitsRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.unit.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.unit.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string) {
    return prisma.unit.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    return prisma.unit.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.unit.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }
}
