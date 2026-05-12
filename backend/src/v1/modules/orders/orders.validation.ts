import { z } from "zod";

const orderItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional().nullable(),
  qty: z.number().int().positive().default(1),
  unit: z.string().optional().nullable(),
});

export const createOrderSchema = z.object({
  supplierId: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "SENT", "PENDING", "COMPLETED", "CANCELLED"])
    .optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = createOrderSchema.partial();
