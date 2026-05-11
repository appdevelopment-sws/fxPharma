import { z } from "zod";

export const createTaxSchema = z.object({
  name: z.string().min(2).max(100),
  rate: z.number().min(0).max(100),
  taxType: z.enum(["Exclusive", "Inclusive"]),
  isActive: z.boolean().optional(),
});

export const updateTaxSchema = createTaxSchema.partial();
