import { prisma } from "@/lib/prisma.js";

export class UnitsRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.unit.count({ where: filters }),
    ]);

    const mappedData = data.map((item: any) => ({
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      short_name: item.shortName,
    }));

    return { data: mappedData, total };
  }

  static async findById(id: string) {
    const item: any = await prisma.unit.findUnique({
      where: { id },
    });

    if (!item) return null;

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      short_name: item.shortName,
    };
  }

  static async findByName(name: string) {
    return prisma.unit.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { short_name, status, ...rest } = data;
    return prisma.unit.create({
      data: {
        ...rest,
        shortName: short_name || null,
        isActive: status === "ACTIVE",
      },
    });
  }

  static async update(id: string, data: any) {
    const { short_name, status, ...rest } = data;
    return prisma.unit.update({
      where: { id },
      data: {
        ...rest,
        ...(short_name !== undefined && { shortName: short_name || null }),
        ...(status !== undefined && { isActive: status === "ACTIVE" }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }
}
