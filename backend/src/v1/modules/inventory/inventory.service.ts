import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

const Decimal = Prisma.Decimal;


export const addStock = async (data: {
  branchId: string;
  masterProductId: string;
  batchNumber: string;
  expiryDate: Date;
  purchasePrice: number;
  mrp: number;
  salePrice: number;
  quantity: number;
}) => {
  // Upsert inventory for the batch
  const existing = await prisma.inventory.findFirst({
    where: {
      branchId: data.branchId,
      masterProductId: data.masterProductId,
      batchNumber: data.batchNumber,
    },
  });

  if (existing) {
    return prisma.inventory.update({
      where: { id: existing.id },
      data: {
        stockQuantity: { increment: data.quantity },
        purchasePrice: new Decimal(data.purchasePrice),
        mrp: new Decimal(data.mrp),
        salePrice: new Decimal(data.salePrice),
        expiryDate: data.expiryDate,
      },
    });
  }

  return prisma.inventory.create({
    data: {
      branchId: data.branchId,
      masterProductId: data.masterProductId,
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate,
      purchasePrice: new Decimal(data.purchasePrice),
      mrp: new Decimal(data.mrp),
      salePrice: new Decimal(data.salePrice),
      stockQuantity: data.quantity,
    },
  });
};

export const getBranchInventory = async (branchId: string) => {
  return prisma.inventory.findMany({
    where: { branchId },
    include: {
      masterProduct: {
        include: { company: true },
      },
    },
    orderBy: { expiryDate: "asc" },
  });
};

export const getExpiringSoon = async (branchId: string, days: number = 30) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);

  return prisma.inventory.findMany({
    where: {
      branchId,
      expiryDate: {
        lte: threshold,
        gte: new Date(),
      },
      stockQuantity: { gt: 0 },
    },
    include: { masterProduct: true },
  });
};
