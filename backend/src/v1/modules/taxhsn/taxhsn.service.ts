import * as taxHsnRepository from "./taxhsn.repository.js";

/**
 * --- Tax Services ---
 */

export const createTax = async (data: {
  name: string;
  rate: number;
  taxType: "Exclusive" | "Inclusive";
  isActive?: boolean;
}) => {
  return taxHsnRepository.createTax(data);
};

export const getAllTaxes = async () => {
  return taxHsnRepository.findTaxes();
};

export const getTaxById = async (id: string) => {
  return taxHsnRepository.findTaxById(id);
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
  return taxHsnRepository.updateTax(id, data);
};

export const deleteTax = async (id: string) => {
  return taxHsnRepository.deleteTax(id);
};

/**
 * --- HSN Services ---
 */

export const createHSN = async (data: {
  hsncode: string;
  description: string;
  isActive?: boolean;
  taxIds?: string[];
}) => {
  const { taxIds, ...hsnData } = data;

  return taxHsnRepository.withTransaction(async (tx) => {
    const hsn = await tx.hsn.create({
      data: {
        ...hsnData,
        isActive: hsnData.isActive ?? true,
      },
    });

    if (taxIds && taxIds.length > 0) {
      await tx.hsnmapping.createMany({
        data: taxIds.map((taxid) => ({
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
  return taxHsnRepository.findHSNs();
};

export const getHSNById = async (id: string) => {
  return taxHsnRepository.findHSNById(id);
};

export const updateHSN = async (
  id: string,
  data: Partial<{
    hsncode: string;
    description: string;
    isActive: boolean;
    taxIds: string[];
  }>
) => {
  const { taxIds, ...hsnData } = data;

  return taxHsnRepository.withTransaction(async (tx) => {
    const hsn = await tx.hsn.update({
      where: { id },
      data: hsnData,
    });

    if (taxIds) {
      await tx.hsnmapping.deleteMany({
        where: { hsnid: id },
      });

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
  return taxHsnRepository.deleteHSN(id);
};

/**
 * --- Mapping Services ---
 */

export const assignTaxToHSN = async (hsnid: string, taxid: string) => {
  return taxHsnRepository.createHSNMapping(hsnid, taxid);
};

export const removeTaxFromHSN = async (hsnid: string, taxid: string) => {
  return taxHsnRepository.deleteHSNMapping(hsnid, taxid);
};
