import { any, z } from "zod";

const InventoryStatusEnum = z.enum(["CONTINUE", "DISCONTINUE"]);

export const createInventorySchema = z.object({
  // 01 Product Identification
  name: z.string().min(1, "Product name is required"),
  status: InventoryStatusEnum.optional(),
  manufacturer: z.string().optional().nullable(),
  saltComposition: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  // 02 Classification & Units
  packing: z.string().optional().nullable(),
  unit1st: z.string().optional().nullable(),
  unit2nd: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  itemType: z.string().optional().nullable(),
  colorType: z.string().optional().nullable(),
  decimal: z.string().optional().nullable(),
  type: z.string().optional().nullable(),

  // 03 Pricing & Taxation
  localTax: z.string().optional().nullable(),
  centralTax: z.string().optional().nullable(),
  sgst: z.coerce.number().optional().default(0),
  cgst: z.coerce.number().optional().default(0),
  igst: z.coerce.number().optional().default(0),
  mrp: z.coerce.number().optional().default(0),
  purchaseRate: z.coerce.number().optional().default(0),
  costPerUnit: z.coerce.number().optional().default(0),
  rateA: z.coerce.number().optional().default(0),
  rateB: z.coerce.number().optional().default(0),
  rateC: z.coerce.number().optional().default(0),
  cer: z.coerce.number().optional().default(0),

  // 04 Inventory Thresholds
  minQty: z.coerce.number().int().optional().default(0),
  maxQty: z.coerce.number().int().optional().default(0),
  reorderQty: z.coerce.number().int().optional().default(0),
  daysLimit: any().optional().default(null), // Can be number of days or a date string
  convStri: z.coerce.number().optional().default(0),
  convCas: z.coerce.number().optional().default(0),

  // 05 Discounts & Margins
  volumeDiscount: z.coerce.number().optional().default(0),
  itemDiscount: z.coerce.number().optional().default(0),
  maxDiscount: z.coerce.number().optional().default(0),
  minMargin: z.coerce.number().optional().default(0),
  specialDiscount: z.coerce.number().optional().default(0),
  purchaseDiscount: z.coerce.number().optional().default(0),

  // 06 Regulatory & Product Flags
  isNarcotic: z.boolean().optional().default(false),
  isScheduleH: z.boolean().optional().default(false),
  isScheduleH1: z.boolean().optional().default(false),
  hideProduct: z.boolean().optional().default(false),
  negativeStock: z.boolean().optional().default(false),
  editRates: z.boolean().optional().default(true),

  branchId: z.string().optional().nullable(),
});

export const updateInventorySchema = createInventorySchema.partial();
