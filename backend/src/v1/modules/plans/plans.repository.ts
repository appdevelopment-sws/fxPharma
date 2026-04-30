import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

export class PlansRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.plan.findMany({
        where: filters,
        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.plan.count({ where: filters }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return prisma.plan.findUnique({
      where: { id },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });
  }

  static async findByKey(key: string) {
    return prisma.plan.findUnique({
      where: { key },
    });
  }

  static async create(data: any, featureIds?: string[]) {
    return prisma.plan.create({
      data: {
        ...data,
        features: featureIds
          ? {
            create: featureIds.map((fId) => ({
              featureId: fId,
            })),
          }
          : undefined,
      },
      include: {
        features: true,
      },
    });
  }

  static async update(id: string, data: any, featureIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      // If featureIds are provided, we replace the existing ones
      if (featureIds) {
        await tx.planFeature.deleteMany({
          where: { planId: id },
        });
      }

      return tx.plan.update({
        where: { id },
        data: {
          ...data,
          features: featureIds
            ? {
              create: featureIds.map((fId) => ({
                featureId: fId,
              })),
            }
            : undefined,
        },
        include: {
          features: true,
        },
      });
    });
  }

  static async delete(id: string) {
    return prisma.plan.delete({
      where: { id },
    });
  }
}
