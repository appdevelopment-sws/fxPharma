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

    const mappedData = data.map((item: any) => ({
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      parent_id: item.parentId,
    }));

    return { data: mappedData, total };
  }

  static async findById(id: string) {
    const item: any = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!item) return null;

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      parent_id: item.parentId,
    };
  }

  static async findByName(name: string) {
    return prisma.category.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { parent_id, status, ...rest } = data;
    return prisma.category.create({
      data: {
        ...rest,
        parentId: parent_id || null,
        isActive: status === "ACTIVE",
      },
    });
  }

  static async update(id: string, data: any) {
    const { parent_id, status, ...rest } = data;
    return prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(parent_id !== undefined && { parentId: parent_id || null }),
        ...(status !== undefined && { isActive: status === "ACTIVE" }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
