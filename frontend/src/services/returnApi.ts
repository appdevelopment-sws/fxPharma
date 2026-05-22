import { api } from "./api"

export type ReturnStatus = "REFUNDED" | "PENDING" | "REJECTED"

export type ReturnItem = {
  id: string
  invoice_item_id?: string | null
  inventory_id?: string
  batch_id?: string | null
  name: string
  batch: string | null
  expiry: string | null
  unit_price: number
  purchased_qty: number
  return_qty: number
  reason: string
  refund_amt: number
}

export type SalesReturn = {
  id: string
  return_id: string
  original_invoice: string
  customer_name: string
  customer_phone: string
  return_value: number
  reason: string
  status: ReturnStatus
  items_restocked: number
  createdAt: string
  updatedAt?: string
  items?: ReturnItem[]
  subtotal: number
  tax: number
  restocking_fee: number
  refund_method: string
  note?: string
}

export type GetReturnsResponse = {
  data: SalesReturn[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export type ReturnStats = {
  total_refunded: number
  total_refunded_trend: string
  returns_processed: number
  returns_processed_trend: string
  items_restocked: number
  items_restocked_trend: string
  pending_refunds: number
  pending_refunds_count: number
}

const BASE_URL = "/returns"

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeParams = (params?: any) => {
  if (!params) return undefined
  const { perPage, ...rest } = params
  return {
    ...rest,
    limit: params.limit ?? perPage,
  }
}

const mapReturnItem = (item: any): ReturnItem => ({
  id: item.id,
  invoice_item_id: item.invoice_item_id ?? item.invoiceItemId ?? null,
  inventory_id: item.inventory_id ?? item.inventoryId,
  batch_id: item.batch_id ?? item.batchId ?? null,
  name: item.name,
  batch: item.batch ?? null,
  expiry: item.expiry ?? null,
  unit_price: toNumber(item.unit_price ?? item.unitPrice),
  purchased_qty: toNumber(item.purchased_qty ?? item.purchasedQty),
  return_qty: toNumber(item.return_qty ?? item.returnQty),
  reason: item.reason,
  refund_amt: toNumber(item.refund_amt ?? item.refundAmt),
})

const mapReturn = (item: any): SalesReturn => ({
  id: item.id,
  return_id: item.return_id ?? item.returnId ?? "",
  original_invoice: item.original_invoice ?? item.originalInvoice ?? "",
  customer_name: item.customer_name ?? item.customerName ?? "Walk-in Customer",
  customer_phone: item.customer_phone ?? item.customerPhone ?? "",
  return_value: toNumber(item.return_value ?? item.returnValue),
  reason: item.reason,
  status: item.status ?? "REFUNDED",
  items_restocked: toNumber(item.items_restocked ?? item.itemsRestocked),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  items: Array.isArray(item.items) ? item.items.map(mapReturnItem) : [],
  subtotal: toNumber(item.subtotal),
  tax: toNumber(item.tax),
  restocking_fee: toNumber(item.restocking_fee ?? item.restockingFee),
  refund_method: item.refund_method ?? item.refundMethod ?? "",
  note: item.note,
})

const ReturnApi = {
  getReturns: async (params?: any): Promise<GetReturnsResponse> => {
    const queryParams = normalizeParams(params)
    const res = await api.get<any>(BASE_URL, {
      params: queryParams,
    })

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data.map(mapReturn),
        meta: {
          total: res.meta?.total ?? 0,
          page: res.meta?.page ?? params?.page ?? 1,
          limit: res.meta?.limit ?? params?.perPage ?? params?.limit ?? 10,
          pages: res.meta?.totalPages ?? 1,
        },
      }
    }

    return {
      data: (res.data?.items ?? []).map(mapReturn),
      meta: {
        total: res.data?.pagination?.total ?? 0,
        page: res.data?.pagination?.page ?? params?.page ?? 1,
        limit: res.data?.pagination?.limit ?? params?.perPage ?? params?.limit ?? 10,
        pages: res.data?.pagination?.totalPages ?? 1,
      },
    }
  },

  getReturnStats: async (): Promise<{ data: ReturnStats }> => {
    const res = await api.get<{ success: boolean; data: ReturnStats }>(
      `${BASE_URL}/stats`
    )
    return { data: res.data }
  },

  getReturn: async (id: string): Promise<{ data: SalesReturn }> => {
    const res = await api.get<{ success: boolean; data: SalesReturn }>(
      `${BASE_URL}/${id}`
    )
    return { data: mapReturn(res.data) }
  },

  processReturn: async (data: any): Promise<{ success: boolean }> => {
    return api.post(BASE_URL, data)
  },

  updateStatus: async (
    id: string,
    status: ReturnStatus
  ): Promise<{ success: boolean }> => {
    return api.patch(`${BASE_URL}/${id}/status`, { status })
  },
}

export default ReturnApi
