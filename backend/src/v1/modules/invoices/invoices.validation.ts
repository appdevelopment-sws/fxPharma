import { z } from "zod";

const invoiceItemSchema = z.object({
  inventoryId: z.string().min(1, "Inventory item is required"),
  inventoryName: z.string().min(1, "Inventory name is required"),
  batchId: z.string().optional().nullable(),
  batchNo: z.string().optional().nullable(),
  qty: z.coerce.number().int().positive().default(1),
  sellUnit: z.string().default("strip"),
  rateType: z.string().default("mrp"),
  rateValue: z.coerce.number().default(0.0),
  itemDiscount: z.coerce.number().default(0.0),
  subTotal: z.coerce.number().default(0.0),
});

export const createInvoiceSchema = z.object({
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  paymentMode: z.enum(["CASH", "UPI", "CARD"]).default("CASH"),
  grossAmount: z.coerce.number().default(0.0),
  discountAmount: z.coerce.number().default(0.0),
  taxAmount: z.coerce.number().default(0.0),
  deliveryCost: z.coerce.number().default(0.0),
  totalAmount: z.coerce.number().default(0.0),
  tenderedAmount: z.coerce.number().default(0.0),
  changeAmount: z.coerce.number().default(0.0),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});
