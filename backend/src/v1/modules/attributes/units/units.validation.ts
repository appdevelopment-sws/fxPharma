import { z } from "zod";

export const createUnitSchema = z.object({
  name: z.string().min(1).max(50),
  shortName: z.string().max(20).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateUnitSchema = createUnitSchema.partial();
