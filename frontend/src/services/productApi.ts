import { api } from "./api"

export type MasterProductFormValues = {
  name: string
  genericName: string
  category: string
  manufacturer: string
  unit: string
  sku: string
  purchasePrice: string
  sellingPrice: string
  stock: string
  reorderLevel: string
  status: "active" | "inactive"
  description: string
}

export type MasterProduct = Omit<
  MasterProductFormValues,
  "purchasePrice" | "sellingPrice" | "stock" | "reorderLevel"
> & {
  id: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  reorderLevel: number
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

export type GetProductResponse = {
  data: MasterProduct
}

export type CreateProductResponse = {
  data: MasterProduct
}

export type UpdateProductResponse = {
  data: MasterProduct
}

const BASE_URL = "/products"

const ProductApi = {
  /**
   * Get all products with optional filtering
   */
  getProducts: async (filters?: {
    category?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<GetProductsResponse> => {
    const params = new URLSearchParams()

    if (filters?.category) params.append("category", filters.category)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))

    const queryString = params.toString()
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL

    return api.get(url)
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: string): Promise<GetProductResponse> => {
    return api.get(`${BASE_URL}/${id}`)
  },

  /**
   * Create a new product
   */
  createProduct: async (
    data: MasterProductFormValues
  ): Promise<CreateProductResponse> => {
    return api.post(BASE_URL, {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      sellingPrice: Number(data.sellingPrice),
      stock: Number(data.stock),
      reorderLevel: Number(data.reorderLevel),
    })
  },

  /**
   * Update an existing product
   */
  updateProduct: async (
    id: string,
    data: MasterProductFormValues
  ): Promise<UpdateProductResponse> => {
    return api.put(`${BASE_URL}/${id}`, {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      sellingPrice: Number(data.sellingPrice),
      stock: Number(data.stock),
      reorderLevel: Number(data.reorderLevel),
    })
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default ProductApi
