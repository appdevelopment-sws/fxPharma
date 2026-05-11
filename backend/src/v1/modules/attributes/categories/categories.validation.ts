import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  parentId: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();
