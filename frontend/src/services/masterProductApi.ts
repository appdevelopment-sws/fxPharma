import { api } from "./api"

export type MasterProductFormValues = {
  name: string
  industry_segment?: string
  category_id?: string
  brand_id?: string
  manufacturer_id?: string
  salt?: string
  category_type?: string
  status?: string
  hsn_code_id?: string
  color_type?: string
  is_narcotic?: boolean
  is_schedule_h?: boolean
  is_schedule_h1?: boolean
  barcodes?: { value: string }[]
  image_url?: string | File | null
}

export type MasterProduct = MasterProductFormValues & {
  id: string
  createdAt?: string
  updatedAt?: string
}

export type GetProductsResponse = {
  data: MasterProduct[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const BASE_URL = "/master-products"

const ProductApi = {
  getMasterProducts: async (params?: any): Promise<GetProductsResponse> => {
    const res = await api.get<any>(BASE_URL, {
      params,
    })

    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  getProduct: async (id: string | number): Promise<{ data: MasterProduct }> => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: res.data }
  },

  createProduct: async (
    data: MasterProductFormValues
  ): Promise<{ data: MasterProduct }> => {
    const res = await api.post<any>(BASE_URL, data)
    return { data: res.data }
  },

  updateProduct: async (
    id: string | number,
    data: MasterProductFormValues
  ): Promise<{ data: MasterProduct }> => {
    const res = await api.put<any>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteProduct: async (id: string | number): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },

  downloadTemplate: async (): Promise<Blob> => {
    const res = await api.get<any>(`${BASE_URL}/import-template`, {
      responseType: "blob",
    })
    return res.data
  },

  bulkImport: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post(`${BASE_URL}/bulk-import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export default ProductApi
