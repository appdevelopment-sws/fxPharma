import { prisma } from "@/lib/prisma.js";

export class ManufacturerRepository {
  static async findAll(filters: any = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      prisma.manufacturer.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
      }),
      prisma.manufacturer.count({ where: filters }),
    ]);

    const mappedData = data.map((item: any) => ({
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    }));

    return { data: mappedData, total };
  }

  static async findById(id: string) {
    const item: any = await prisma.manufacturer.findUnique({
      where: { id },
    });

    if (!item) return null;

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async findByName(name: string) {
    return prisma.manufacturer.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { status, ...rest } = data;
    return prisma.manufacturer.create({
      data: {
        ...rest,
        isActive: status === "ACTIVE",
      },
    });
  }

  static async update(id: string, data: any) {
    const { status, ...rest } = data;
    return prisma.manufacturer.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { isActive: status === "ACTIVE" }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.manufacturer.delete({
      where: { id },
    });
  }
}
