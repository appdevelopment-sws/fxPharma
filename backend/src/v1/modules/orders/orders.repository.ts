import { prisma } from "@/lib/prisma.js";

export class OrdersRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: filters,
        include: { 
          items: true,
          supplier: true 
        },
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.order.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { 
        items: true,
        supplier: true 
      },
    });
  }

  static async create(data: any) {
    const { items, ...orderData } = data;
    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  static async update(id: string, data: any) {
    const { items, ...orderData } = data;

    return prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        ...(items && {
          items: {
            deleteMany: {},
            create: items,
          },
        }),
      },
      include: { items: true },
    });
  }

  static async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
