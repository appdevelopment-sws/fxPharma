import { api } from "./api"

export type SupplierFormValues = {
  company_name: string
  gstin: string
  address: string
  contact_person: string
  email: string
  phone: string
  whatsapp: string
  is_preferred: boolean
  auto_generate_po: boolean
  registration_docs?: string | null
}

export type Supplier = {
  id: number
  company_name: string
  gstin: string
  address: string
  contact_person: string
  email: string
  phone: string
  whatsapp: string
  is_preferred: boolean
  auto_generate_po: boolean
  registration_docs?: string | null
  createdAt?: string
  updatedAt?: string
}

export type GetSuppliersResponse = {
  data: Supplier[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

type RawGetSuppliersResponse = {
  success: boolean
  data?: {
    items?: Supplier[]
    pagination?: {
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }
  }
  message?: string
}

type RawSupplierResponse = {
  success: boolean
  data?: Supplier
  message?: string
}

const BASE_URL = "/suppliers"

const SupplierApi = {
  getSuppliers: async (params?: any): Promise<GetSuppliersResponse> => {
    const res = await api.get<RawGetSuppliersResponse>(BASE_URL, {
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

  getSupplier: async (id: string | number): Promise<{ data: Supplier }> => {
    const res = await api.get<RawSupplierResponse>(`${BASE_URL}/${id}`)
    return { data: res.data! }
  },

  createSupplier: async (
    data: SupplierFormValues
  ): Promise<{ data: Supplier }> => {
    const res = await api.post<RawSupplierResponse>(BASE_URL, data)
    return { data: res.data! }
  },

  updateSupplier: async (
    id: string | number,
    data: SupplierFormValues
  ): Promise<{ data: Supplier }> => {
    const res = await api.put<RawSupplierResponse>(`${BASE_URL}/${id}`, data)
    return { data: res.data! }
  },

  deleteSupplier: async (
    id: string | number
  ): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default SupplierApi
