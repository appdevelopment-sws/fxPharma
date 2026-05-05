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
    const { status, isActive, ...rest } = data;
    const createData: any = { ...rest };

    if (status !== undefined) {
      createData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      createData.isActive = isActive;
    }

    const item: any = await prisma.brand.create({
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

    const item: any = await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    return {
      ...item,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  static async delete(id: string) {
    return prisma.brand.delete({
      where: { id },
    });
  }
}
