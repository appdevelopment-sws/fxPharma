import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .optional()
  .nullable();

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listMasterProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  companyId: z.coerce.number().int().positive().optional(),
  productTypeId: z.coerce.number().int().positive().optional(),
  hsnCodeId: z.coerce.number().int().positive().optional(),
});

export const createMasterProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  salt: z.string().trim().min(2).max(120),
  barcode: optionalTrimmedString,
  brand_name: optionalTrimmedString,
  pack_size: optionalTrimmedString,
  strength: optionalTrimmedString,
  hsnCodeId: z.coerce.number().int().positive(),
  company_id: z.coerce.number().int().positive(),
  product_type_id: z.coerce.number().int().positive(),
});

export const updateMasterProductSchema = createMasterProductSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

export type ListMasterProductsQuery = z.infer<
  typeof listMasterProductsQuerySchema
>;
export type CreateMasterProductInput = z.infer<
  typeof createMasterProductSchema
>;
export type UpdateMasterProductInput = z.infer<
  typeof updateMasterProductSchema
>;
