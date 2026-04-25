import { api } from "./api"

export type ReturnStatus = "REFUNDED" | "PENDING" | "REJECTED"

export type ReturnItem = {
  id: string
  name: string
  batch: string
  expiry: string
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

const ReturnApi = {
  getReturns: async (params?: any): Promise<GetReturnsResponse> => {
    const res = await api.get<{
      success: boolean
      data: { items: SalesReturn[]; pagination: any }
    }>(BASE_URL, {
      params,
    })
    return {
      data: res.data?.items ?? [],
      meta: {
        total: res.data?.pagination?.total ?? 0,
        page: res.data?.pagination?.page ?? params?.page ?? 1,
        limit: res.data?.pagination?.limit ?? params?.limit ?? 10,
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
    return { data: res.data }
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
