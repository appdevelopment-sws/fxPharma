import { z } from "zod";

export const createManufacturerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateManufacturerSchema = createManufacturerSchema.partial();
