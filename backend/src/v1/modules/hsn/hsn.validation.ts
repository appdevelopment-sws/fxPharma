import { z } from "zod";

export const createHsnSchema = z.object({
  hsncode: z.string().min(2).max(20),
  description: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(2).max(500).optional(),
  ),
  isActive: z.boolean().optional(),
  taxIds: z.array(z.string()).optional(),
});

export const updateHsnSchema = createHsnSchema.partial();
