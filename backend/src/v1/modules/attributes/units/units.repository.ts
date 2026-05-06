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
      short_name: item.shortName,
    };
  }

  static async findByName(name: string) {
    return prisma.unit.findFirst({
      where: { name },
    });
  }

  static async create(data: any) {
    const { short_name, ...rest } = data;
    const item: any = await prisma.unit.create({
      data: {
        ...rest,
        shortName: short_name || null,
      },
    });

    return {
      ...item,
      short_name: item.shortName,
    };
  }

  static async update(id: string, data: any) {
    const { id: _id, createdAt: _c, updatedAt: _u, short_name, ...rest } = data;

    const updateData: any = { ...rest };

    if (short_name !== undefined) updateData.shortName = short_name || null;

    const item: any = await prisma.unit.update({
      where: { id },
      data: updateData,
    });

    return {
      ...item,
      short_name: item.shortName,
    };
  }

  static async delete(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }
}
