import { prisma } from "@/lib/prisma.js";

export class NewCompoundRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.newCompound.findMany({
        where: filters,
        include: { ingredients: true },
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.newCompound.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.newCompound.findUnique({
      where: { id },
      include: { ingredients: true },
    });
  }

  static async create(data: any) {
    const { ingredients, ...compoundData } = data;
    return prisma.newCompound.create({
      data: {
        ...compoundData,
        ingredients: {
          create: ingredients,
        },
      },
      include: { ingredients: true },
    });
  }

  static async update(id: string, data: any) {
    const { ingredients, ...compoundData } = data;

    return prisma.newCompound.update({
      where: { id },
      data: {
        ...compoundData,
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients,
          },
        }),
      },
      include: { ingredients: true },
    });
  }

  static async delete(id: string) {
    return prisma.newCompound.delete({
      where: { id },
    });
  }
}
