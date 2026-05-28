import { api } from "./api"

export type InventoryFormValues = {
  id?: string
  imageUrl?: string | null
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

const normalizeParams = (params?: Record<string, any>) => {
  if (!params) return undefined

  const { perPage, ...rest } = params
  return {
    ...rest,
    limit: params.limit ?? perPage,
  }
}

export type InventoryBatch = {
  id: string
  batchNo?: string
  expiry?: string | null
  expiryDate?: string | null
  availableQty?: number
  receivedQty?: number
  purchaseRate?: number | string | null
  mrp?: number | string | null
  rateA?: number | string | null
  rateB?: number | string | null
  rateC?: number | string | null
  cgst?: number | string | null
  sgst?: number | string | null
  receivedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type InventoryItem = {
  id: string
  name: string
  status: "CONTINUE" | "DISCONTINUE"
  imageUrl?: string | null
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
  batches?: InventoryBatch[]
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

export type ExpiryReportItem = {
  id: string
  inventoryId: string
  productName: string
  saltComposition?: string | null
  manufacturer?: InventoryRelation | null
  category?: InventoryRelation | null
  batchNo: string
  expiryDate?: string | null
  expiry?: string | null
  remainingDays: number | null
  stockQty: number
  unit?: string | null
  value: number
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED"
  statusLabel?: string
  purchaseRate?: number
  mrp?: number
  rateA?: number
  rateB?: number
  rateC?: number
  cgst?: number
  sgst?: number
  receivedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type ExpiryReportStats = {
  alreadyExpired: number
  expiring15: number
  expiring30: number
  expiring90: number
  valueAtRisk: number
}

export type ExpiryReportResponse = {
  data: ExpiryReportItem[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
  stats?: ExpiryReportStats
}

export type LowStockReportStats = {
  totalLowStock: number
  outOfStock: number
  nearReorder: number
}

export type LowStockReportResponse = {
  data: InventoryItem[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
  stats?: LowStockReportStats
}

const BASE_URL = "/inventory/add-medicine"
const EXPIRY_REPORT_URL = `${BASE_URL}/expiry-report`

const InventoryApi = {
  getAll: async (params?: any): Promise<InventoryListResponse> => {
    const queryParams = normalizeParams(params)
    const res = await api.get<any>(BASE_URL, { params: queryParams })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  getExpiryReport: async (
    params?: any
  ): Promise<ExpiryReportResponse> => {
    const queryParams = normalizeParams(params)
    const res = await api.get<any>(EXPIRY_REPORT_URL, {
      params: queryParams,
    })

    return {
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta
        ? {
            ...res.meta,
            totalPages: res.meta.totalPages ?? res.meta.pages ?? 1,
          }
        : res.meta,
      stats: res.stats,
    }
  },

  getLowStockReport: async (
    params?: any
  ): Promise<LowStockReportResponse> => {
    const queryParams = normalizeParams(params)
    const res = await api.get<any>(`${BASE_URL}/low-stock-report`, {
      params: queryParams,
    })

    return {
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta
        ? {
            ...res.meta,
            totalPages: res.meta.totalPages ?? res.meta.pages ?? 1,
          }
        : res.meta,
      stats: res.stats,
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
