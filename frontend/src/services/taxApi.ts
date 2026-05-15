import { api } from "./api"

export type TaxType = "INCLUSIVE" | "EXCLUSIVE"

export type TaxRate = {
  id: string
  name: string
  rate: number
  taxType: TaxType
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type TaxFormValues = {
  name: string
  rate: number
  taxType: TaxType
  isActive?: boolean
}

export type GetTaxesResponse = {
  data: TaxRate[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const BASE_URL = "/taxes"

const TaxApi = {
  getTaxes: async (params?: any): Promise<GetTaxesResponse> => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createTax: async (data: TaxFormValues): Promise<{ data: TaxRate }> => {
    const res = await api.post<any>(BASE_URL, data)
    return { data: res.data }
  },

  updateTax: async (
    id: string,
    data: TaxFormValues
  ): Promise<{ data: TaxRate }> => {
    const res = await api.put<any>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteTax: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export type HsnCode = {
  code: any
  id: string
  hsncode: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type HsnFormValues = {
  hsncode: string
  description?: string
  isActive?: boolean
}

export type HsnMapping = {
  id: string
  hsnid: string
  taxid: string
  effectiveFrom?: string | null
  effectiveTo?: string | null
  createdAt?: string
  updatedAt?: string
  hsn?: HsnCode
  tax?: TaxRate
}

export type HsnMappingFormValues = {
  hsnId: string
  taxId: string
  effectiveFrom?: string
  effectiveTo?: string
}

const HSN_BASE_URL = "/hsn"
const MAPPING_BASE_URL = "/hsn-mappings"

export const HsnApi = {
  getHsnCodes: async (
    params?: any
  ): Promise<{ data: HsnCode[]; meta?: any }> => {
    const res = await api.get<any>(HSN_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createHsn: async (data: HsnFormValues) => api.post(HSN_BASE_URL, data),

  updateHsn: async (id: string, data: HsnFormValues) =>
    api.put(`${HSN_BASE_URL}/${id}`, data),

  deleteHsn: async (id: string) => api.delete(`${HSN_BASE_URL}/${id}`),

  getMappings: async (
    params?: any
  ): Promise<{ data: HsnMapping[]; meta?: any }> => {
    const res = await api.get<any>(MAPPING_BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  createMapping: async (values: HsnMappingFormValues) => {
    // Map frontend names to backend names
    const data = {
      hsnid: values.hsnId,
      taxid: values.taxId,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo || null,
    }
    return api.post(MAPPING_BASE_URL, data)
  },

  updateMapping: async (id: string | number, values: HsnMappingFormValues) => {
    const data = {
      hsnid: values.hsnId,
      taxid: values.taxId,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo || null,
    }
    return api.put(`${MAPPING_BASE_URL}/${id}`, data)
  },

  deleteMapping: async (id: string | number) =>
    api.delete(`${MAPPING_BASE_URL}/${id}`),
}

export default TaxApi
