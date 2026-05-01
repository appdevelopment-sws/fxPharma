import { prisma } from "@/lib/prisma.js";

export class BrandsRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.brand.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.brand.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.brand.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string) {
    return prisma.brand.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    return prisma.brand.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.brand.delete({
      where: { id },
    });
  }
}
