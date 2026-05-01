import { prisma } from "@/lib/prisma.js";

export class CategoriesRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where: filters,
        include: {
          parent: true,
          children: true,
        },
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.category.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  static async findByName(name: string) {
    return prisma.category.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    return prisma.category.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
