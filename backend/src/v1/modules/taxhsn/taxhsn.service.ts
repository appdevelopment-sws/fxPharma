import { prisma } from "@/lib/prisma.js";

/**
 * --- Tax Services ---
 */

export const createTax = async (data: {
  name: string;
  rate: number;
  taxType: "Exclusive" | "Inclusive";
  isActive?: boolean;
}) => {
  return prisma.tax.create({
    data,
  });
};

export const getAllTaxes = async () => {
  return prisma.tax.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getTaxById = async (id: string) => {
  return prisma.tax.findUnique({
    where: { id },
    include: {
      hsnmappings: {
        include: {
          hsn: true,
        },
      },
    },
  });
};

export const updateTax = async (
  id: string,
  data: Partial<{
    name: string;
    rate: number;
    taxType: "Exclusive" | "Inclusive";
    isActive: boolean;
  }>
) => {
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
 * --- HSN Services ---
 */

export const createHSN = async (data: {
  hsncode: string;
  description: string;
  isActive?: boolean;
  taxIds?: string[]; // Optional: provide tax mappings during creation
}) => {
  return prisma.$transaction(async (tx) => {
    const hsn = await tx.hsn.create({
      data: {
        hsncode: data.hsncode,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    if (data.taxIds && data.taxIds.length > 0) {
      await tx.hsnmapping.createMany({
        data: data.taxIds.map((taxid) => ({
          hsnid: hsn.id,
          taxid: taxid,
        })),
      });
    }

    return tx.hsn.findUnique({
      where: { id: hsn.id },
      include: {
        hsnmappings: {
          include: { tax: true },
        },
      },
    });
  });
};

export const getAllHSNs = async () => {
  return prisma.hsn.findMany({
    include: {
      hsnmappings: {
        include: {
          tax: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getHSNById = async (id: string) => {
  return prisma.hsn.findUnique({
    where: { id },
    include: {
      hsnmappings: {
        include: {
          tax: true,
        },
      },
    },
  });
};

export const updateHSN = async (
  id: string,
  data: Partial<{
    hsncode: string;
    description: string;
    isActive: boolean;
    taxIds: string[]; // If provided, it will sync the mappings
  }>
) => {
  const { taxIds, ...hsnData } = data;

  return prisma.$transaction(async (tx) => {
    const hsn = await tx.hsn.update({
      where: { id },
      data: hsnData,
    });

    if (taxIds) {
      // Delete old mappings
      await tx.hsnmapping.deleteMany({
        where: { hsnid: id },
      });

      // Add new mappings
      if (taxIds.length > 0) {
        await tx.hsnmapping.createMany({
          data: taxIds.map((taxId) => ({
            hsnid: id,
            taxid: taxId,
          })),
        });
      }
    }

    return tx.hsn.findUnique({
      where: { id },
      include: {
        hsnmappings: {
          include: { tax: true },
        },
      },
    });
  });
};

export const deleteHSN = async (id: string) => {
  return prisma.hsn.delete({
    where: { id },
  });
};

/**
 * --- Mapping Services (Standalone) ---
 */

export const assignTaxToHSN = async (hsnid: string, taxid: string) => {
  return prisma.hsnmapping.create({
    data: {
      hsnid,
      taxid,
    },
  });
};

export const removeTaxFromHSN = async (hsnid: string, taxid: string) => {
  return prisma.hsnmapping.delete({
    where: {
      hsnid_taxid: {
        hsnid,
        taxid,
      },
    },
  });
};
