import { z } from "zod";

const orderItemSchema = z.object({
  inventoryId: z.string().min(1, "Inventory item is required"),
  qty: z.coerce.number().int().positive().default(1),
  unit: z.string().optional().nullable(),
  purchaseRate: z.coerce.number().optional().nullable(),
});

export const createOrderSchema = z.object({
  supplierId: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "SENT", "PENDING", "COMPLETED", "CANCELLED"])
    .optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = createOrderSchema.partial();
