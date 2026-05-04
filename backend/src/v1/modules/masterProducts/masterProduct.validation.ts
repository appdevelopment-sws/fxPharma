import { z } from "zod";

const barcodeSchema = z.object({
  value: z.string().min(1, "Barcode value is required"),
});

export const createMasterProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  industry_segment: z.string().optional(),
  category_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  manufacturer_id: z.string().optional().nullable(),
  salt: z.string().optional().nullable(),
  category_type: z.string().optional(),
  status: z.string().optional(),
  hsn_code_id: z.string().optional().nullable(),
  color_type: z.string().optional(),
  is_narcotic: z.boolean().optional(),
  is_schedule_h: z.boolean().optional(),
  is_schedule_h1: z.boolean().optional(),
  barcodes: z.array(barcodeSchema).optional(),
  image_url: z.string().optional().nullable(),
});

export const updateMasterProductSchema = createMasterProductSchema.partial();
