import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

const masterProductInclude = {
  company: true,
  hsnCode: true,
  product_type: true,
} satisfies Prisma.MasterProductInclude;

type ListMasterProductsArgs = {
  page: number;
  limit: number;
  search?: string;
  companyId?: number;
  productTypeId?: number;
  hsnCodeId?: number;
};

const buildMasterProductWhere = ({
  search,
  companyId,
  productTypeId,
  hsnCodeId,
}: Omit<ListMasterProductsArgs, "page" | "limit">): Prisma.MasterProductWhereInput => {
  const where: Prisma.MasterProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { salt: { contains: search, mode: "insensitive" } },
      { brand_name: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }

  if (companyId) {
    where.company_id = companyId;
  }

  if (productTypeId) {
    where.product_type_id = productTypeId;
  }

  if (hsnCodeId) {
    where.hsnCodeId = hsnCodeId;
  }

  return where;
};

export const listMasterProducts = async (args: ListMasterProductsArgs) => {
  const where = buildMasterProductWhere(args);
  const skip = (args.page - 1) * args.limit;

  const [items, total] = await Promise.all([
    prisma.masterProduct.findMany({
      where,
      include: masterProductInclude,
      skip,
      take: args.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.masterProduct.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

export const findMasterProductById = async (id: number) => {
  return prisma.masterProduct.findUnique({
    where: { id },
    include: masterProductInclude,
  });
};

export const findCompanyById = async (id: number) => {
  return prisma.company.findUnique({
    where: { id },
  });
};

export const findProductTypeById = async (id: number) => {
  return prisma.productType.findUnique({
    where: { id },
  });
};

export const findHsnCodeById = async (id: number) => {
  return prisma.hsnCode.findUnique({
    where: { id },
  });
};

export const createMasterProduct = async (
  data: Prisma.MasterProductUncheckedCreateInput,
) => {
  return prisma.masterProduct.create({
    data,
    include: masterProductInclude,
  });
};

export const updateMasterProduct = async (
  id: number,
  data: Prisma.MasterProductUncheckedUpdateInput,
) => {
  return prisma.masterProduct.update({
    where: { id },
    data,
    include: masterProductInclude,
  });
};

export const deleteMasterProduct = async (id: number) => {
  return prisma.masterProduct.delete({
    where: { id },
  });
};
