import { api } from "./api"

const BASE_URL = "/orders"

export interface OrderItem {
  id?: string
  inventoryId?: string
  name: string
  description?: string
  qty: number
  freeQty?: number
  batchNo?: string
  expiry?: string
  unit?: string
  purchaseRate?: number
  mrp?: number
  rate1?: number
  rate2?: number
  rate3?: number
  cgst?: number
  sgst?: number
  inventory?: any
}

export interface OrderFormValues {
  id?: string
  supplierId: string
  status: string
  paymentMode?: string
  paymentDetails?: string
  isUdhar?: string | boolean
  paidAmount?: number
  items: OrderItem[]
}

const mapToApi = (data: any) => {
  return {
    supplierId: data.supplierId,
    status: data.status || "DRAFT",
    receivedAt: data.receivedAt || undefined,
    invoiceNo: data.invoiceNo || undefined,
    notes: data.notes || undefined,
    paymentMode: data.paymentMode || undefined,
    paymentDetails: data.paymentDetails || undefined,
    isUdhar:
      data.isUdhar === "YES" || data.isUdhar === true
        ? true
        : data.isUdhar === "NO" || data.isUdhar === false
          ? false
          : undefined,
    paidAmount:
      data.paidAmount === undefined || data.paidAmount === null
        ? undefined
        : Number(data.paidAmount),
    items: (data.items || []).map((item: any) => ({
      inventoryId: item.inventoryId || undefined,
      qty: Math.max(1, Number(item.qty) || 1),
      freeQty: Math.max(0, Number(item.freeQty) || 0),
      batchNo: item.batchNo || undefined,
      expiry: item.expiry || undefined,
      unit: item.unit,
      purchaseRate:
        item.purchaseRate === undefined || item.purchaseRate === null
          ? undefined
          : Number(item.purchaseRate),
      mrp:
        item.mrp === undefined || item.mrp === null ? undefined : Number(item.mrp),
      rate1:
        item.rate1 === undefined || item.rate1 === null
          ? undefined
          : Number(item.rate1),
      rate2:
        item.rate2 === undefined || item.rate2 === null
          ? undefined
          : Number(item.rate2),
      rate3:
        item.rate3 === undefined || item.rate3 === null
          ? undefined
          : Number(item.rate3),
      cgst:
        item.cgst === undefined || item.cgst === null
          ? undefined
          : Number(item.cgst),
      sgst:
        item.sgst === undefined || item.sgst === null
          ? undefined
          : Number(item.sgst),
    })),
  }
}

const mapFromApi = (data: any) => {
  return {
    ...data,
    supplierId: data.supplierId,
    receivedAt: data.receivedAt,
    invoiceNo: data.invoiceNo,
    notes: data.notes,
    paymentMode: data.paymentMode,
    paymentDetails: data.paymentDetails,
    isUdhar: Boolean(data.isUdhar),
    paidAmount: data.paidAmount,
    items: (data.items || []).map((item: any) => ({
      ...item,
      inventoryId: item.inventoryId,
      name: item.inventory?.name || item.name,
      description: item.inventory?.saltComposition || item.description,
      qty: item.qty,
      freeQty: item.freeQty,
      batchNo: item.batchNo,
      expiry: item.expiry,
      mrp: item.mrp,
      rate1: item.rate1,
      rate2: item.rate2,
      rate3: item.rate3,
      cgst: item.cgst,
      sgst: item.sgst,
    })),
  }
}

export const ordersApi = {
  getAll: async (params?: any) => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: (res.data || []).map(mapFromApi),
      meta: res.meta,
    }
  },

  getById: async (id: string) => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: mapFromApi(res.data) }
  },

  create: async (data: any) => {
    const payload = mapToApi(data)
    const res = await api.post<any>(BASE_URL, payload)
    return { data: mapFromApi(res.data) }
  },

  update: async (id: string, data: any) => {
    const payload = mapToApi(data)
    const res = await api.put<any>(`${BASE_URL}/${id}`, payload)
    return { data: mapFromApi(res.data) }
  },

  delete: async (id: string) => {
    return await api.delete(`${BASE_URL}/${id}`)
  },
}
