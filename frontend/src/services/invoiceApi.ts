import { api } from "./api"

export type PaymentMode = "CASH" | "UPI" | "CARD"
export type InvoiceStatus = "PAID" | "REFUNDED" | "CANCELLED"

export type Invoice = {
  id: string
  invoice_id: string
  customer_name: string
  customer_phone: string | null
  item_count: number
  gross_amount: number
  discount_amount: number
  tax_amount: number
  delivery_cost: number
  total_amount: number
  tendered_amount: number
  change_amount: number
  payment_mode: PaymentMode
  status: InvoiceStatus
  createdAt: string
  updatedAt?: string
  items?: InvoiceItem[]
}

export type InvoiceItem = {
  id: string
  inventory_id: string
  inventory_name: string
  batch_id: string | null
  batch_no: string | null
  qty: number
  sell_unit: string
  rate_type: string
  rate_value: number
  item_discount: number
  sub_total: number
  createdAt?: string
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

const mapInvoiceItem = (item: any): InvoiceItem => ({
  id: item.id,
  inventory_id: item.inventory_id ?? item.inventoryId ?? "",
  inventory_name: item.inventory_name ?? item.inventoryName ?? "",
  batch_id: item.batch_id ?? item.batchId ?? null,
  batch_no: item.batch_no ?? item.batchNo ?? null,
  qty: toNumber(item.qty),
  sell_unit: item.sell_unit ?? item.sellUnit ?? "strip",
  rate_type: item.rate_type ?? item.rateType ?? "mrp",
  rate_value: toNumber(item.rate_value ?? item.rateValue),
  item_discount: toNumber(item.item_discount ?? item.itemDiscount),
  sub_total: toNumber(item.sub_total ?? item.subTotal),
  createdAt: item.createdAt,
})

const mapInvoice = (invoice: any): Invoice => ({
  id: invoice.id,
  invoice_id: invoice.invoice_id ?? invoice.invoiceId ?? "",
  customer_name: invoice.customer_name ?? invoice.customerName ?? "Walk-in Customer",
  customer_phone: invoice.customer_phone ?? invoice.customerPhone ?? null,
  item_count: toNumber(invoice.item_count ?? invoice.itemCount ?? invoice.items?.length),
  gross_amount: toNumber(invoice.gross_amount ?? invoice.grossAmount),
  discount_amount: toNumber(invoice.discount_amount ?? invoice.discountAmount),
  tax_amount: toNumber(invoice.tax_amount ?? invoice.taxAmount),
  delivery_cost: toNumber(invoice.delivery_cost ?? invoice.deliveryCost),
  total_amount: toNumber(invoice.total_amount ?? invoice.totalAmount),
  tendered_amount: toNumber(invoice.tendered_amount ?? invoice.tenderedAmount),
  change_amount: toNumber(invoice.change_amount ?? invoice.changeAmount),
  payment_mode: invoice.payment_mode ?? invoice.paymentMode ?? "CASH",
  status: invoice.status ?? "PAID",
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
  items: Array.isArray(invoice.items) ? invoice.items.map(mapInvoiceItem) : [],
})

const InvoiceApi = {
  getInvoices: async (params?: any): Promise<GetInvoicesResponse> => {
    const queryParams = normalizeParams(params)
    const res = await api.get<any>(BASE_URL, {
      params: queryParams,
    })

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data.map(mapInvoice),
        meta: {
          total: res.meta?.total ?? 0,
          page: res.meta?.page ?? params?.page ?? 1,
          limit: res.meta?.limit ?? params?.perPage ?? params?.limit ?? 10,
          pages: res.meta?.totalPages ?? 1,
        },
      }
    }

    return {
      data: (res.data?.items ?? []).map(mapInvoice),
      meta: {
        total: res.data?.pagination?.total ?? 0,
        page: res.data?.pagination?.page ?? params?.page ?? 1,
        limit: res.data?.pagination?.limit ?? params?.perPage ?? params?.limit ?? 10,
        pages: res.data?.pagination?.totalPages ?? 1,
      },
    }
  },

  getInvoiceStats: async (): Promise<{ data: InvoiceStats }> => {
    const res = await api.get<{ success: boolean; data: InvoiceStats }>(
      `${BASE_URL}/stats`
    )
    return res
  },

  getInvoice: async (id: string): Promise<{ data: Invoice }> => {
    const res = await api.get<{ success: boolean; data: Invoice }>(
      `${BASE_URL}/${id}`
    )
    return { data: mapInvoice(res.data) }
  },

  createInvoice: async (data: any): Promise<{ data: Invoice }> => {
    const res = await api.post<{ success: boolean; data: Invoice }>(BASE_URL, data)
    return { data: mapInvoice(res.data) }
  },

  getGstSummary: async (params?: { startDate?: string; endDate?: string }): Promise<any> => {
    return api.get(`${BASE_URL}/gst-summary`, { params })
  },
}

export default InvoiceApi

