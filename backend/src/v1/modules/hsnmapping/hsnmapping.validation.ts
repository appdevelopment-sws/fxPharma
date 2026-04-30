import { z } from "zod";

export const createHsnMappingSchema = z.object({
  hsnid: z.string().min(1, "HSN ID is required"),
  taxid: z.string().min(1, "Tax ID is required"),
});
