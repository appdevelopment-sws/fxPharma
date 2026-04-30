import { z } from "zod";

export const createHsnSchema = z.object({
  hsncode: z.string().min(2).max(20),
  description: z.string().min(2).max(500),
  isActive: z.boolean().optional(),
  taxIds: z.array(z.string()).optional(),
});

export const updateHsnSchema = createHsnSchema.partial();
