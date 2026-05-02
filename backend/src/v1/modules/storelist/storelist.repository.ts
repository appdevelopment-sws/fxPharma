import { prisma } from "@/lib/prisma.js";

export class StoreListRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.storeList.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        include: { plan: true },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.storeList.count({ where: filters }),
    ]);

    const mappedData = data.map((item: any) => ({
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    }));

    return { data: mappedData, total };
  }

  static async findById(id: string) {
    const item: any = await prisma.storeList.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!item) return null;

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async findByStoreName(storeName: string) {
    return prisma.storeList.findFirst({
      where: { storeName },
    });
  }

  static async create(data: any) {
    const { status, planId, ...rest } = data;

    // Validate planId existence
    let validPlanId = null;
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (plan) validPlanId = planId;
    }

    return prisma.storeList.create({
      data: {
        ...rest,
        planId: validPlanId,
        isActive: status === true,
        status: status === true,
      },
      include: { plan: true },
    });
  }

  static async update(id: string, data: any) {
    const { status, planId, ...rest } = data;

    // Validate planId existence
    let validPlanId = undefined;
    if (planId !== undefined) {
      if (planId === null || planId === "") {
        validPlanId = null;
      } else {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        validPlanId = plan ? planId : null;
      }
    }

    return prisma.storeList.update({
      where: { id },
      data: {
        ...rest,
        ...(validPlanId !== undefined && { planId: validPlanId }),
        ...(status !== undefined && { 
          isActive: status === true,
          status: status === true
        }),
      },
      include: { plan: true },
    });
  }

  static async delete(id: string) {
    return prisma.storeList.delete({
      where: { id },
    });
  }
}
