import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

const Decimal = Prisma.Decimal;


export const createSale = async (data: {
  branchId: string;
  userId: string;
  customerName?: string;
  customerMobile?: string;
  items: {
    inventoryId: string;
    quantity: number;
    discountPercent?: number;
  }[];
  paymentMethod: string;
}) => {
  return prisma.$transaction(async (tx) => {
    let totalAmount = new Decimal(0);
    let totalTax = new Decimal(0);
    const saleItemsData = [];

    for (const item of data.items) {
      const inventory = await tx.inventory.findUnique({
        where: { id: item.inventoryId },
        include: {
          masterProduct: {
            include: { hsnCode: true }
          }
        },
      });

      if (!inventory || inventory.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product in batch ${inventory?.batchNumber}`);
      }

      // Deduct Stock
      await tx.inventory.update({
        where: { id: item.inventoryId },
        data: { stockQuantity: { decrement: item.quantity } },
      });

      const unitPrice = inventory.salePrice;
      const itemTotal = unitPrice.mul(item.quantity);
      const taxRate = inventory.masterProduct.hsnCode?.gstPercent || new Decimal(18);
      const itemTax = itemTotal.mul(taxRate.div(100));

      totalAmount = totalAmount.add(itemTotal);
      totalTax = totalTax.add(itemTax);

      saleItemsData.push({
        masterProductId: inventory.masterProductId,
        batchNumber: inventory.batchNumber,
        quantity: item.quantity,
        unitPrice,
        taxAmount: itemTax,
        totalAmount: itemTotal.add(itemTax),
      });
    }

    const sale = await tx.sale.create({
      data: {
        branchId: data.branchId,
        userId: data.userId,
        customerName: data.customerName,
        customerMobile: data.customerMobile,
        totalAmount,
        taxAmount: totalTax,
        payableAmount: totalAmount.add(totalTax),
        paymentMethod: data.paymentMethod,
        items: {
          create: saleItemsData,
        },
      },
      include: { items: true },
    });

    return sale;
  });
};

export const getSaleHistory = async (branchId: string) => {
  return prisma.sale.findMany({
    where: { branchId },
    include: {
      items: { include: { masterProduct: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
