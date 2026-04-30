import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

/**
 * --- Tax Repository ---
 */

export const createTax = async (data: Prisma.taxCreateInput) => {
  return prisma.tax.create({
    data,
  });
};

export const findTaxes = async (where: Prisma.taxWhereInput = {}) => {
  return prisma.tax.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const findTaxById = async (id: string) => {
  return prisma.tax.findUnique({
    where: { id },
    include: {
      hsnmappings: {
        include: { hsn: true },
      },
    },
  });
};

export const updateTax = async (id: string, data: Prisma.taxUpdateInput) => {
  return prisma.tax.update({
    where: { id },
    data,
  });
};

export const deleteTax = async (id: string) => {
  return prisma.tax.delete({
    where: { id },
  });
};

/**
 * --- HSN Repository ---
 */

export const createHSN = async (data: Prisma.hsnCreateInput) => {
  return prisma.hsn.create({
    data,
    include: {
      hsnmappings: {
        include: { tax: true },
      },
    },
  });
};

export const findHSNs = async (where: Prisma.hsnWhereInput = {}) => {
  return prisma.hsn.findMany({
    where,
    include: {
      hsnmappings: {
        include: { tax: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findHSNById = async (id: string) => {
  return prisma.hsn.findUnique({
    where: { id },
    include: {
      hsnmappings: {
        include: { tax: true },
      },
    },
  });
};

export const updateHSN = async (id: string, data: Prisma.hsnUpdateInput) => {
  return prisma.hsn.update({
    where: { id },
    data,
    include: {
      hsnmappings: {
        include: { tax: true },
      },
    },
  });
};

export const deleteHSN = async (id: string) => {
  return prisma.hsn.delete({
    where: { id },
  });
};

/**
 * --- HSN Mapping Repository ---
 */

export const createHSNMapping = async (hsnid: string, taxid: string) => {
  return prisma.hsnmapping.create({
    data: {
      hsnid,
      taxid,
    },
  });
};

export const deleteHSNMappingsByHSN = async (hsnid: string) => {
  return prisma.hsnmapping.deleteMany({
    where: { hsnid },
  });
};

export const createManyHSNMappings = async (mappings: { hsnid: string; taxid: string }[]) => {
  return prisma.hsnmapping.createMany({
    data: mappings,
  });
};

export const deleteHSNMapping = async (hsnid: string, taxid: string) => {
  return prisma.hsnmapping.delete({
    where: {
      hsnid_taxid: {
        hsnid,
        taxid,
      },
    },
  });
};

/**
 * --- Transaction Wrapper ---
 */
export const withTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
) => {
  return prisma.$transaction(callback);
};
