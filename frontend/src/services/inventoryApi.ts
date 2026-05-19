import { api } from "./api"

export type InventoryFormValues = {
  id?: string
  product_name: string
  status?: "CONTINUE" | "DISCONTINUE"
  company?: string
  salt_composition?: string
  category?: string
  packing?: string
  unit_1st?: string
  unit_2nd?: string
  pack_qty_1?: string | number
  pack_qty_2?: string | number
  pack_qty_3?: string | number
  hsn_code?: string
  item_type?: string
  color_type?: string
  decimal?: string
  type?: string
  local_tax?: string
  central_tax?: string
  sgst?: string | number
  cgst?: string | number
  igst?: string | number
  mrp?: string | number
  purchase_rate?: string | number
  cost_unit?: string | number
  rate_a?: string | number
  rate_b?: string | number
  rate_c?: string | number
  cer?: string | number
  minimum_qty?: string | number
  maximum_qty?: string | number
  reorder_qty?: string | number
  days_limit?: string | number
  temperature_limit?: string | number
  conv_stri?: string | number
  conv_cas?: string | number
  volume_discount?: string | number
  item_discount?: string | number
  maximum_discount?: string | number
  minimum_margin?: string | number
  special_discount?: string | number
  purchase_discount?: string | number
  is_narcotic?: boolean
  is_schedule_h?: boolean
  is_schedule_h1?: boolean
  hide_product?: boolean
  negative_stock?: boolean
  edit_rates?: boolean
}

export type InventoryRequestPayload = Record<string, unknown>

type InventoryRelation = {
  id: string
  name?: string | null
}

export type InventoryItem = {
  id: string
  name: string
  status: "CONTINUE" | "DISCONTINUE"
  manufacturerId?: string | null
  manufacturer?: InventoryRelation | string | null
  saltComposition?: string | null
  categoryId?: string | null
  category?: InventoryRelation | string | null
  brandId?: string | null
  brand?: InventoryRelation | null
  packing?: string | null
  unit1st?: string | null
  unit2nd?: string | null
  packQty1?: number | null
  packQty2?: number | null
  packQty3?: number | null
  hsnCode?: string | null
  itemType?: string | null
  colorType?: string | null
  decimal?: string | null
  type?: string | null
  localTax?: string | null
  centralTax?: string | null
  sgst?: number | string | null
  cgst?: number | string | null
  igst?: number | string | null
  mrp?: number | string | null
  purchaseRate?: number | string | null
  costPerUnit?: number | string | null
  rateA?: number | string | null
  rateB?: number | string | null
  rateC?: number | string | null
  cer?: number | string | null
  minQty?: number | null
  maxQty?: number | null
  reorderQty?: number | null
  daysLimit?: number | null
  convStri?: number | string | null
  convCas?: number | string | null
  volumeDiscount?: number | string | null
  itemDiscount?: number | string | null
  maxDiscount?: number | string | null
  minMargin?: number | string | null
  specialDiscount?: number | string | null
  purchaseDiscount?: number | string | null
  isNarcotic?: boolean
  isScheduleH?: boolean
  isScheduleH1?: boolean
  hideProduct?: boolean
  negativeStock?: boolean
  editRates?: boolean
  createdAt?: string
  updatedAt?: string
}

export type InventoryListResponse = {
  data: InventoryItem[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
}

const BASE_URL = "/inventory/add-medicine"

const InventoryApi = {
  getAll: async (params?: any): Promise<InventoryListResponse> => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  getById: async (id: string | number): Promise<{ data: InventoryItem }> => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: res.data }
  },

  create: async (
    data: InventoryRequestPayload
  ): Promise<{ data: InventoryItem }> => {
    const res = await api.post<any>(BASE_URL, data)
    return { data: res.data }
  },

  update: async (
    id: string | number,
    data: InventoryRequestPayload
  ): Promise<{ data: InventoryItem }> => {
    const res = await api.put<any>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  delete: async (id: string | number): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default InventoryApi
