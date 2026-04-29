import { Prisma } from "@prisma/client";
import * as masterProductRepository from "./masterProduct.repository.js";
import {
  CreateHsnCodeInput,
  CreateMasterProductInput,
  ListMasterProductsQuery,
  UpdateMasterProductInput,
} from "./masterProduct.validation.js";

const ensureReferenceIntegrity = async (data: {
  company_id?: string;
  product_type_id?: string;
  hsnCodeId?: string;
}) => {
  const [company, productType, hsnCode] = await Promise.all([
    data.company_id
      ? masterProductRepository.findCompanyById(data.company_id)
      : Promise.resolve(null),
    data.product_type_id
      ? masterProductRepository.findProductTypeById(data.product_type_id)
      : Promise.resolve(null),
    data.hsnCodeId
      ? masterProductRepository.findHsnCodeById(data.hsnCodeId)
      : Promise.resolve(null),
  ]);

  if (data.company_id && !company) {
    throw new Error("Company not found");
  }

  if (company && company.status !== "ACTIVE") {
    throw new Error("Company is not active");
  }

  if (data.product_type_id && !productType) {
    throw new Error("Product type not found");
  }

  if (data.hsnCodeId && !hsnCode) {
    throw new Error("HSN code not found");
  }
};

const mapPrismaError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new Error(
        "A master product with the same unique values already exists",
      );
    }

    if (error.code === "P2025") {
      throw new Error("Master product not found");
    }
  }

  throw error;
};

const mapHsnPrismaError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("HSN code already exists");
  }

  throw error;
};

export const listProducts = async (query: ListMasterProductsQuery) => {
  const { items, total } =
    await masterProductRepository.listMasterProducts(query);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await masterProductRepository.findMasterProductById(id);

  if (!product) {
    throw new Error("Master product not found");
  }

  return product;
};

export const getProductReferences = async () => {
  return masterProductRepository.listMasterProductReferences();
};

export const createProduct = async (payload: CreateMasterProductInput) => {
  try {
    await ensureReferenceIntegrity(payload);

    return await masterProductRepository.createMasterProduct(payload);
  } catch (error) {
    mapPrismaError(error);
  }
};

export const updateProduct = async (
  id: string,
  payload: UpdateMasterProductInput,
) => {
  try {
    await ensureReferenceIntegrity(payload);

    return await masterProductRepository.updateMasterProduct(id, payload);
  } catch (error) {
    mapPrismaError(error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await masterProductRepository.deleteMasterProduct(id);
  } catch (error) {
    mapPrismaError(error);
  }
};

export const createHsnCode = async (payload: CreateHsnCodeInput) => {
  try {
    return await masterProductRepository.createHsnCode({
      code: payload.code.trim(),
    });
  } catch (error) {
    mapHsnPrismaError(error);
  }
};
