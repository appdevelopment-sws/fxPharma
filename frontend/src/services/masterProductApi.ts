import { api } from "./api"

export type MasterProductFormValues = {
  name: string
  salt: string
  barcode: string
  brand_name: string
  pack_size: string
  strength: string
  hsnCodeId: string
  company_id: string
  product_type_id: string
}

export type MasterProductCompany = {
  id: number
  name: string
  gstin?: string | null
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
}

export type MasterProductType = {
  id: number
  name: string
  unit_type: string
  description?: string | null
}

export type MasterProductHsnCode = {
  id: number
  code: string
  description?: string | null
  type: "GOODS" | "SERVICE"
  isActive: boolean
}

export type MasterProduct = {
  id: number
  name: string
  salt: string
  barcode?: string | null
  brand_name?: string | null
  pack_size?: string | null
  strength?: string | null
  hsnCodeId: number
  company_id: number
  product_type_id: number
  company?: MasterProductCompany
  product_type?: MasterProductType
  hsnCode?: MasterProductHsnCode
  createdAt?: string
  updatedAt?: string
}

export type GetProductsResponse = {
  data: MasterProduct[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

type RawGetMasterProductsResponse = {
  success: boolean
  data?: {
    items?: MasterProduct[]
    pagination?: {
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }
  }
  message?: string
}

type RawMasterProductResponse = {
  success: boolean
  data?: MasterProduct
  message?: string
}

export type GetProductResponse = {
  data: MasterProduct
}

export type CreateProductResponse = {
  data: MasterProduct
}

export type UpdateProductResponse = {
  data: MasterProduct
}

const BASE_URL = "/master-products"

const normalizePayload = (data: MasterProductFormValues) => ({
  name: data.name.trim(),
  salt: data.salt.trim(),
  barcode: data.barcode.trim() || null,
  brand_name: data.brand_name.trim() || null,
  pack_size: data.pack_size.trim() || null,
  strength: data.strength.trim() || null,
  hsnCodeId: Number(data.hsnCodeId),
  company_id: Number(data.company_id),
  product_type_id: Number(data.product_type_id),
})

const ProductApi = {
  getMasterProducts: async (params?: any): Promise<GetProductsResponse> => {
    const res = await api.get<RawGetMasterProductsResponse>(BASE_URL, {
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

  getProduct: async (id: string | number): Promise<GetProductResponse> => {
    const res = await api.get<RawMasterProductResponse>(`${BASE_URL}/${id}`)
    return { data: res.data! }
  },

  createProduct: async (
    data: MasterProductFormValues
  ): Promise<CreateProductResponse> => {
    const res = await api.post<RawMasterProductResponse>(
      BASE_URL,
      normalizePayload(data)
    )
    return { data: res.data! }
  },

  updateProduct: async (
    id: string | number,
    data: MasterProductFormValues
  ): Promise<UpdateProductResponse> => {
    const res = await api.put<RawMasterProductResponse>(
      `${BASE_URL}/${id}`,
      normalizePayload(data)
    )
    return { data: res.data! }
  },

  deleteProduct: async (id: string | number): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default ProductApi
