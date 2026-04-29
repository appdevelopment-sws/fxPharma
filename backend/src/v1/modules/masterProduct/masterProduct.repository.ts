import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

const masterProductInclude = {
  company: true,
  hsnCode: true,
  productType: true,
} satisfies Prisma.MasterProductInclude;

type ListMasterProductsArgs = {
  page: number;
  limit: number;
  search?: string;
  companyId?: string;
  productTypeId?: string;
  hsnCodeId?: string;
};

const mapProduct = (product: any) => {
  if (!product) return null;
  const { genericName, ...rest } = product;
  return {
    ...rest,
    salt: genericName,
  };
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
      { genericName: { contains: search, mode: "insensitive" } },
      { brandName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (companyId) {
    where.companyId = companyId;
  }

  if (productTypeId) {
    where.productTypeId = productTypeId;
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
      orderBy: { id: "desc" },
    }),
    prisma.masterProduct.count({ where }),
  ]);

  return {
    items: items.map(mapProduct),
    total,
  };
};

export const findMasterProductById = async (id: string) => {
  const product = await prisma.masterProduct.findUnique({
    where: { id },
    include: masterProductInclude,
  });
  return mapProduct(product);
};

export const findCompanyById = async (id: string) => {
  return prisma.company.findUnique({
    where: { id },
  });
};

export const findProductTypeById = async (id: string) => {
  return prisma.productType.findUnique({
    where: { id },
  });
};

export const findHsnCodeById = async (id: string) => {
  return prisma.hsnCode.findUnique({
    where: { id },
  });
};

export const createMasterProduct = async (
  payload: any,
) => {
  const { salt, barcode, brand_name, ...rest } = payload;
  const data = {
    ...rest,
    genericName: salt,
    brandName: brand_name,
    barcode,
  };

  const product = await prisma.masterProduct.create({
    data,
    include: masterProductInclude,
  });
  return mapProduct(product);
};

export const updateMasterProduct = async (
  id: string,
  payload: any,
) => {
  const { salt, barcode, brand_name, ...rest } = payload;
  const data = {
    ...rest,
    ...(salt && { genericName: salt }),
    ...(brand_name && { brandName: brand_name }),
    ...(barcode && { barcode }),
  };

  const product = await prisma.masterProduct.update({
    where: { id },
    data,
    include: masterProductInclude,
  });
  return mapProduct(product);
};

export const deleteMasterProduct = async (id: string) => {
  return prisma.masterProduct.delete({
    where: { id },
  });
};

export const listMasterProductReferences = async () => {
  const [companies, productTypes, hsnCodes] = await Promise.all([
    prisma.company.findMany({ where: { status: "ACTIVE" } }),
    prisma.productType.findMany(),
    prisma.hsnCode.findMany(),
  ]);

  return { companies, productTypes, hsnCodes };
};

export const createHsnCode = async (data: {
  code: string;
  organizationId: string;
  gstPercent?: number;
}) => {
  return prisma.hsnCode.create({
    data,
  });
};
