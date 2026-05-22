import { z } from "zod";

const returnItemSchema = z.object({
  id: z.string().optional(),
  invoice_item_id: z.string().optional().nullable(),
  invoiceItemId: z.string().optional().nullable(),
  inventory_id: z.string().optional().nullable(),
  inventoryId: z.string().optional().nullable(),
  batch_id: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  selected: z.boolean().optional(),
  name: z.string().optional().nullable(),
  batch: z.string().optional().nullable(),
  expiry: z.string().optional().nullable(),
  unit_price: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
  purchased_qty: z.coerce.number().int().optional(),
  purchasedQty: z.coerce.number().int().optional(),
  return_qty: z.coerce.number().int().positive().optional(),
  returnQty: z.coerce.number().int().positive().optional(),
  reason: z.string().optional().nullable(),
  refund_amt: z.coerce.number().optional(),
  refundAmt: z.coerce.number().optional(),
}).refine((item) => item.return_qty !== undefined || item.returnQty !== undefined, {
  message: "Return quantity is required",
  path: ["return_qty"],
});

export const createReturnSchema = z.object({
  invoice_number: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceId: z.string().optional(),
  original_invoice: z.string().optional(),
  reason_for_return: z.string().min(1, "Reason for return is required"),
  refund_method: z.string().min(1, "Refund method is required"),
  restocking_fee: z.coerce.number().default(0),
  note: z.string().optional().nullable(),
  status: z.enum(["REFUNDED", "PENDING", "REJECTED"]).optional(),
  items: z.array(returnItemSchema).min(1, "At least one item is required"),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(["REFUNDED", "PENDING", "REJECTED"]),
});
