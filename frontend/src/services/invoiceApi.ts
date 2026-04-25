import { api } from "./api"

export type PaymentMode = "CASH" | "UPI" | "CARD"
export type InvoiceStatus = "PAID" | "REFUNDED" | "CANCELLED"

export type Invoice = {
  id: string
  invoice_id: string
  customer_name: string
  customer_phone: string
  item_count: number
  total_amount: number
  payment_mode: PaymentMode
  status: InvoiceStatus
  createdAt: string
  updatedAt?: string
}

export type GetInvoicesResponse = {
  data: Invoice[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export type InvoiceStats = {
  todays_sales: number
  todays_sales_trend: string
  total_invoices: number
  total_invoices_trend: string
  avg_order_value: number
  avg_order_value_trend: string
  refunds_issued: number
  refunds_issued_trend: string
}

const BASE_URL = "/invoices"

const InvoiceApi = {
  getInvoices: async (params?: any): Promise<GetInvoicesResponse> => {
    const res = await api.get<{
      success: boolean
      data: { items: Invoice[]; pagination: any }
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

  getInvoiceStats: async (): Promise<{ data: InvoiceStats }> => {
    const res = await api.get<{ success: boolean; data: InvoiceStats }>(
      `${BASE_URL}/stats`
    )
    return { data: res.data }
  },

  getInvoice: async (id: string): Promise<{ data: Invoice }> => {
    const res = await api.get<{ success: boolean; data: Invoice }>(
      `${BASE_URL}/${id}`
    )
    return { data: res.data }
  },
}

export default InvoiceApi
