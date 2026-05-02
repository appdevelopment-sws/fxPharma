import { prisma } from "@/lib/prisma.js";

export class FeaturesRepository {
  static async findAll(where: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.feature.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.feature.count({ where }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.feature.findUnique({
      where: { id },
    });
  }

  static async findByKey(key: string) {
    return prisma.feature.findUnique({
      where: { key },
    });
  }

  static async create(data: any) {
    return prisma.feature.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.feature.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.feature.delete({
      where: { id },
    });
  }
}
