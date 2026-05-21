import { z } from "zod";

const orderItemSchema = z.object({
  inventoryId: z.string().min(1, "Inventory item is required"),
  qty: z.coerce.number().int().positive().default(1),
  freeQty: z.coerce.number().int().min(0).optional().nullable(),
  unit: z.string().optional().nullable(),
  batchNo: z.string().optional().nullable(),
  expiry: z.string().optional().nullable(),
  purchaseRate: z.coerce.number().optional().nullable(),
  mrp: z.coerce.number().optional().nullable(),
  rate1: z.coerce.number().optional().nullable(),
  rate2: z.coerce.number().optional().nullable(),
  rate3: z.coerce.number().optional().nullable(),
  discount: z.coerce.number().min(0).optional().nullable(),
  discountType: z.enum(["flat", "percentage"]).optional(),
  discount_type: z.enum(["flat", "percentage"]).optional(),
  cgst: z.coerce.number().optional().nullable(),
  sgst: z.coerce.number().optional().nullable(),
});

export const createOrderSchema = z.object({
  supplierId: z.string().optional().nullable(),
  status: z
    .enum([
      "DRAFT",
      "SENT",
      "PENDING",
      "COMPLETED",
    "CANCELLED",
    "DELIVERED",
  ])
  .optional(),
  paymentMode: z.enum(["cash", "debit", "upi"]).optional().nullable(),
  paymentDetails: z.string().optional().nullable(),
  isUdhar: z.boolean().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = createOrderSchema.partial();
