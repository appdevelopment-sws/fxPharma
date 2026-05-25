import type { Invoice } from "@/services/invoiceApi"

export type ReturnFormItem = {
  id: string
  invoice_item_id: string
  inventory_id: string
  batch_id: string | null
  selected: boolean
  name: string
  batch: string
  expiry: string
  unit_price: number
  purchased_qty: number
  return_qty: number
  reason: string
}

export const buildReturnItems = (invoice: Invoice): ReturnFormItem[] => {
  return (invoice.items || []).map((item) => {
    const unitPrice = item.qty > 0 ? item.sub_total / item.qty : item.rate_value

    return {
      id: item.id,
      invoice_item_id: item.id,
      inventory_id: item.inventory_id,
      batch_id: item.batch_id,
      selected: true,
      name: item.inventory_name,
      batch: item.batch_no || "-",
      expiry: "-",
      unit_price: unitPrice,
      purchased_qty: item.qty,
      return_qty: item.qty > 0 ? 1 : 0,
      reason: "",
    }
  })
}

