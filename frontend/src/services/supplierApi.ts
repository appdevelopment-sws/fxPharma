import { api } from "./api"

export type SupplierFormValues = {
  companyName: string
  gstNumber: string
  officeAddress: string
  contactPersonName: string
  email: string
  phone: string
  whatsappNumber: string
  isPreferred: boolean
  autoGeneratePO: boolean
  registrationDocuments?: string | null
}

export type Supplier = {
  id: string
  companyName: string
  gstNumber: string
  officeAddress: string
  contactPersonName: string
  email: string
  phone: string
  whatsappNumber: string
  isPreferred: boolean
  autoGeneratePO: boolean
  registrationDocuments?: string | null
  isActive?: boolean
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
  data: Supplier[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type RawSupplierResponse = {
  success: boolean
  data: Supplier
  message?: string
}

const BASE_URL = "/suppliers"

const SupplierApi = {
  getSuppliers: async (params?: any): Promise<GetSuppliersResponse> => {
    const res = await api.get<RawGetSuppliersResponse>(BASE_URL, {
      params,
    })

    return {
      data: res.data ?? [],
      meta: {
        total: res.data?.meta?.total ?? 0,
        page: res.data?.meta?.page ?? params?.page ?? 1,
        limit: res.data?.meta?.limit ?? params?.limit ?? 10,
        pages: res.data?.meta?.totalPages ?? 1,
      },
    }
  },

  getSupplier: async (id: string | number): Promise<{ data: Supplier }> => {
    const res = await api.get<RawSupplierResponse>(`${BASE_URL}/${id}`)
    return { data: res.data }
  },

  createSupplier: async (
    data: SupplierFormValues
  ): Promise<{ data: Supplier }> => {
    const res = await api.post<RawSupplierResponse>(BASE_URL, data)
    return { data: res.data }
  },

  updateSupplier: async (
    id: string | number,
    data: SupplierFormValues
  ): Promise<{ data: Supplier }> => {
    const res = await api.put<RawSupplierResponse>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteSupplier: async (
    id: string | number
  ): Promise<{ success: boolean }> => {
    const res = await api.delete(`${BASE_URL}/${id}`)
    return res
  },

  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await api.post<{ success: boolean; data: { path: string } }>(
      "/upload/single",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return res.data.path
  },
}

export default SupplierApi
