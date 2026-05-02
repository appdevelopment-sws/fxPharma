import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();
