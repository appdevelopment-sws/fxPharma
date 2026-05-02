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

    const mappedData = data.map((item: any) => ({
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    }));

    return { data: mappedData, total };
  }

  static async findById(id: string) {
    const item: any = await prisma.brand.findUnique({
      where: { id },
    });

    if (!item) return null;

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async findByName(name: string) {
    return prisma.brand.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { status, ...rest } = data;
    return prisma.brand.create({
      data: {
        ...rest,
        isActive: status === "ACTIVE",
      },
    });
  }

  static async update(id: string, data: any) {
    const { status, ...rest } = data;
    return prisma.brand.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { isActive: status === "ACTIVE" }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.brand.delete({
      where: { id },
    });
  }
}
