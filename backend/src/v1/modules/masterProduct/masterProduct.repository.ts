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

const mapProduct = (product: any) => {
  if (!product) return null;
  const { generic_name, ...rest } = product;
  return {
    ...rest,
    salt: generic_name,
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
      { generic_name: { contains: search, mode: "insensitive" } },
      { brand_name: { contains: search, mode: "insensitive" } },
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
      orderBy: { id: "desc" },
    }),
    prisma.masterProduct.count({ where }),
  ]);

  return {
    items: items.map(mapProduct),
    total,
  };
};

export const findMasterProductById = async (id: number) => {
  const product = await prisma.masterProduct.findUnique({
    where: { id },
    include: masterProductInclude,
  });
  return mapProduct(product);
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
  payload: any,
) => {
  const { salt, barcode, ...rest } = payload;
  const data = {
    ...rest,
    generic_name: salt,
  };

  const product = await prisma.masterProduct.create({
    data,
    include: masterProductInclude,
  });
  return mapProduct(product);
};

export const updateMasterProduct = async (
  id: number,
  payload: any,
) => {
  const { salt, barcode, ...rest } = payload;
  const data = {
    ...rest,
    ...(salt && { generic_name: salt }),
  };

  const product = await prisma.masterProduct.update({
    where: { id },
    data,
    include: masterProductInclude,
  });
  return mapProduct(product);
};

export const deleteMasterProduct = async (id: number) => {
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

export const createHsnCode = async (data: { code: string }) => {
  return prisma.hsnCode.create({
    data,
  });
};
