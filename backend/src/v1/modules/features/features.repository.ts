import { prisma } from "@/lib/prisma.js";

export class FeaturesRepository {
  static async findAll() {
    return prisma.feature.findMany({
      orderBy: { createdAt: "desc" },
    });
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
