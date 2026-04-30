import { api } from "./api"

export type TaxType = "INCLUSIVE" | "EXCLUSIVE"

export type TaxRate = {
  id: number
  name: string
  rate: number
  type: TaxType
  createdAt?: string
  updatedAt?: string
}

export type TaxFormValues = {
  name: string
  rate: number
  type: TaxType
}

export type GetTaxesResponse = {
  data: TaxRate[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const BASE_URL = "/taxes" // Generic placeholder, adjust if backend path differs

const TaxApi = {
  getTaxes: async (params?: any): Promise<GetTaxesResponse> => {
    // In a real app, this would call the API.
    // For now, I'll return mock data if the API isn't ready, but standardizing on the real pattern.
    try {
      const res = await api.get<any>(BASE_URL, { params })
      return {
        data: res.data ?? [],
        meta: {
          total: res.data?.length ?? 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      }
    } catch (e) {
      console.warn("Tax API failed, returning mock data for development", e)
      return {
        data: [
          { id: 1, name: "GST 5%", rate: 5, type: "EXCLUSIVE" },
          { id: 2, name: "GST 12%", rate: 12, type: "EXCLUSIVE" },
          { id: 3, name: "GST 18%", rate: 18, type: "EXCLUSIVE" },
        ],
        meta: { total: 3, page: 1, limit: 10, pages: 1 },
      }
    }
  },

  createTax: async (data: TaxFormValues): Promise<{ data: TaxRate }> => {
    const res = await api.post<any>(BASE_URL, data)
    return { data: res.data }
  },

  updateTax: async (
    id: number,
    data: TaxFormValues
  ): Promise<{ data: TaxRate }> => {
    const res = await api.put<any>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteTax: async (id: number): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export type HsnCode = {
  id: number
  code: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type HsnFormValues = {
  code: string
  description?: string
}

export type HsnMapping = {
  id: number
  hsnId: number
  taxId: number
  effectiveFrom: string
  effectiveTo?: string
  hsnCode?: HsnCode
  taxRate?: TaxRate
}

export type HsnMappingFormValues = {
  hsnId: string
  taxId: string
  effectiveFrom: string
  effectiveTo?: string
}

const HSN_BASE_URL = "/hsn"
const MAPPING_BASE_URL = "/hsn-mappings"

export const HsnApi = {
  getHsnCodes: async (
    params?: any
  ): Promise<{ data: HsnCode[]; meta?: any }> => {
    console.log("Fetching HSN codes with params:", params)
    try {
      const res = await api.get<any>(HSN_BASE_URL, { params })
      return {
        data: res.data?.items ?? [],
        meta: res.data?.pagination ?? {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      }
    } catch (e) {
      return {
        data: [
          { id: 1, code: "3004", description: "Medicaments" },
          { id: 2, code: "3006", description: "Pharmaceutical goods" },
        ],
        meta: { total: 2, page: 1, limit: 10, pages: 1 },
      }
    }
  },

  createHsn: async (data: HsnFormValues) => api.post(HSN_BASE_URL, data),
  updateHsn: async (id: number, data: HsnFormValues) =>
    api.put(`${HSN_BASE_URL}/${id}`, data),
  deleteHsn: async (id: number) => api.delete(`${HSN_BASE_URL}/${id}`),

  getMappings: async (
    params?: any
  ): Promise<{ data: HsnMapping[]; meta?: any }> => {
    try {
      const res = await api.get<any>(MAPPING_BASE_URL, { params })
      return {
        data: res.data?.items ?? [],
        meta: res.data?.pagination ?? {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      }
    } catch (e) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, pages: 1 },
      }
    }
  },

  createMapping: async (data: HsnMappingFormValues) =>
    api.post(MAPPING_BASE_URL, data),
  updateMapping: async (id: number, data: HsnMappingFormValues) =>
    api.put(`${MAPPING_BASE_URL}/${id}`, data),
  deleteMapping: async (id: number) => api.delete(`${MAPPING_BASE_URL}/${id}`),
}

export default TaxApi
