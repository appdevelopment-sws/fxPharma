import { prisma } from "@/lib/prisma.js";

export class ManufacturerRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.manufacturer.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.manufacturer.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.manufacturer.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string) {
    return prisma.manufacturer.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    return prisma.manufacturer.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.manufacturer.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.manufacturer.delete({
      where: { id },
    });
  }
}
