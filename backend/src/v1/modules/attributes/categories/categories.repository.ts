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
      parent_id: item.parentId,
    };
  }

  static async findByName(name: string) {
    return prisma.category.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { parent_id, ...rest } = data;
    const item: any = await prisma.category.create({
      data: {
        ...rest,
        parentId: parent_id || null,
      },
    });

    return {
      ...item,
      parent_id: item.parentId,
    };
  }

  static async update(id: string, data: any) {
    const { 
      id: _id, 
      createdAt: _c, 
      updatedAt: _u, 
      parent_id, 
      ...rest 
    } = data;
    
    const updateData: any = { ...rest };

    if (parent_id !== undefined) updateData.parentId = parent_id || null;

    const item: any = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return {
      ...item,
      parent_id: item.parentId,
    };
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
