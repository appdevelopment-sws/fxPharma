import { z } from "zod";

export const BranchBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),

  address: z.string().optional().nullable(),

  status: z.number().int().default(1),
});
