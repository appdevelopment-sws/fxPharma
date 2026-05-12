import { z } from "zod";

export const createFeatureSchema = z.object({
  key: z.string().min(3).max(50),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  module: z.string().optional(),
});

export const updateFeatureSchema = createFeatureSchema.partial();
