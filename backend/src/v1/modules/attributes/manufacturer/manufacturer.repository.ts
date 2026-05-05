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
    const { status, isActive, ...rest } = data;
    const createData: any = { ...rest };

    if (status !== undefined) {
      createData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      createData.isActive = isActive;
    }

    const item: any = await prisma.manufacturer.create({
      data: createData,
    });

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async update(id: string, data: any) {
    const { status, isActive, ...rest } = data;
    const updateData: any = { ...rest };

    if (status !== undefined) {
      updateData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const item: any = await prisma.manufacturer.update({
      where: { id },
      data: updateData,
    });

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async delete(id: string) {
    return prisma.manufacturer.delete({
      where: { id },
    });
  }
}
