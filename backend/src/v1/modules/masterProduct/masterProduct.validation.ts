import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .optional()
  .nullable();

export const productIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const listMasterProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  companyId: z.string().cuid().optional(),
  productTypeId: z.string().cuid().optional(),
  hsnCodeId: z.string().cuid().optional(),
});

export const createMasterProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  salt: z.string().trim().min(2).max(120),
  barcode: optionalTrimmedString,
  brand_name: optionalTrimmedString,
  pack_size: optionalTrimmedString,
  strength: optionalTrimmedString,
  hsnCodeId: z.string().cuid(),
  company_id: z.string().cuid(),
  product_type_id: z.string().cuid(),
});

export const updateMasterProductSchema = createMasterProductSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

export const createHsnCodeSchema = z.object({
  code: z.string().trim().min(2).max(12),
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
export type CreateHsnCodeInput = z.infer<typeof createHsnCodeSchema>;
