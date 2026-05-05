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
    const { short_name, status, isActive, ...rest } = data;
    const createData: any = { ...rest };

    if (short_name !== undefined) createData.shortName = short_name || null;

    if (status !== undefined) {
      createData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      createData.isActive = isActive;
    }

    const item: any = await prisma.unit.create({
      data: createData,
    });

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      short_name: item.shortName,
    };
  }

  static async update(id: string, data: any) {
    const { short_name, status, isActive, ...rest } = data;
    const updateData: any = { ...rest };

    if (short_name !== undefined) updateData.shortName = short_name || null;

    if (status !== undefined) {
      updateData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const item: any = await prisma.unit.update({
      where: { id },
      data: updateData,
    });

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      short_name: item.shortName,
    };
  }

  static async delete(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }
}
