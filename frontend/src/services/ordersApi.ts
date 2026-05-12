import { api } from "./api"

const BASE_URL = "/orders"

export interface OrderItem {
  id?: string
  name: string
  description?: string
  qty: number
  unit?: string
}

export interface OrderFormValues {
  id?: string
  supplierId: string
  status: string
  items: OrderItem[]
}

const mapToApi = (data: any) => {
  return {
    supplierId: data.supplierId,
    status: data.status || "DRAFT",
    items: (data.items || []).map((item: any) => ({
      name: item.name,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit: item.unit,
    })),
  }
}

const mapFromApi = (data: any) => {
  return {
    ...data,
    supplierId: data.supplierId,
    items: (data.items || []).map((item: any) => ({
      ...item,
      qty: item.qty,
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
