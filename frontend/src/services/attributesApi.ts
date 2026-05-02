import { api } from "./api"

// --- Brand Types ---
export type Brand = {
  id: string
  name: string
  description?: string
  logo?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type BrandFormValues = {
  name: string
  description?: string
  logo?: string
  isActive?: boolean
}

export type GetBrandsResponse = {
  data: Brand[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// --- Category Types ---
export type Category = {
  id: string
  name: string
  description?: string
  isActive: boolean
  parentId?: string
  createdAt?: string
  updatedAt?: string
}

export type CategoryFormValues = {
  name: string
  description?: string
  isActive?: boolean
  parentId?: string
}

export type GetCategoriesResponse = {
  data: Category[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// --- Manufacturer Types ---
export type Manufacturer = {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ManufacturerFormValues = {
  name: string
  email?: string
  phone?: string
  address?: string
  isActive?: boolean
}

export type GetManufacturersResponse = {
  data: Manufacturer[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// --- Unit Types ---
export type Unit = {
  id: string
  name: string
  shortName: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type UnitFormValues = {
  name: string
  shortName: string
  isActive?: boolean
}

export type GetUnitsResponse = {
  data: Unit[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const BRAND_BASE_URL = "/attributes/brands"
const CATEGORY_BASE_URL = "/attributes/categories"
const MANUFACTURER_BASE_URL = "/attributes/manufacturers"
const UNIT_BASE_URL = "/attributes/units"

const BrandApi = {
  getBrands: async (params?: any): Promise<GetBrandsResponse> => {
    const res = await api.get<any>(BRAND_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createBrand: async (data: BrandFormValues): Promise<{ data: Brand }> => {
    const res = await api.post<any>(BRAND_BASE_URL, data)
    return { data: res.data }
  },

  updateBrand: async (
    id: string,
    data: BrandFormValues
  ): Promise<{ data: Brand }> => {
    const res = await api.put<any>(`${BRAND_BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteBrand: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BRAND_BASE_URL}/${id}`)
  },
}

export const CategoryApi = {
  getCategories: async (params?: any): Promise<GetCategoriesResponse> => {
    const res = await api.get<any>(CATEGORY_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createCategory: async (
    data: CategoryFormValues
  ): Promise<{ data: Category }> => {
    const res = await api.post<any>(CATEGORY_BASE_URL, data)
    return { data: res.data }
  },

  updateCategory: async (
    id: string,
    data: CategoryFormValues
  ): Promise<{ data: Category }> => {
    const res = await api.put<any>(`${CATEGORY_BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${CATEGORY_BASE_URL}/${id}`)
  },
}

export const ManufacturerApi = {
  getManufacturers: async (
    params?: any
  ): Promise<GetManufacturersResponse> => {
    const res = await api.get<any>(MANUFACTURER_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createManufacturer: async (
    data: ManufacturerFormValues
  ): Promise<{ data: Manufacturer }> => {
    const res = await api.post<any>(MANUFACTURER_BASE_URL, data)
    return { data: res.data }
  },

  updateManufacturer: async (
    id: string,
    data: ManufacturerFormValues
  ): Promise<{ data: Manufacturer }> => {
    const res = await api.put<any>(`${MANUFACTURER_BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteManufacturer: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${MANUFACTURER_BASE_URL}/${id}`)
  },
}

export const UnitApi = {
  getUnits: async (params?: any): Promise<GetUnitsResponse> => {
    const res = await api.get<any>(UNIT_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createUnit: async (data: UnitFormValues): Promise<{ data: Unit }> => {
    const res = await api.post<any>(UNIT_BASE_URL, data)
    return { data: res.data }
  },

  updateUnit: async (
    id: string,
    data: UnitFormValues
  ): Promise<{ data: Unit }> => {
    const res = await api.put<any>(`${UNIT_BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteUnit: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${UNIT_BASE_URL}/${id}`)
  },
}

export default BrandApi
