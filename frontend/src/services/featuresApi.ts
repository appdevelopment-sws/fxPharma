import { api } from "./api"

const BASE_URL = "/features"

export interface Feature {
  id: string
  key: string
  name: string
  description?: string
  module: string
  createdAt?: string
  updatedAt?: string
}

const FeaturesApi = {
  getFeatures: async (params?: any) => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  },

  getFeatureById: async (id: string) => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: res.data }
  },

  createFeature: async (data: Partial<Feature>) => {
    const res = await api.post<any>(BASE_URL, data)
    return { data: res.data }
  },

  updateFeature: async (id: string, data: Partial<Feature>): Promise<{ data: any }> => {
    const res = await api.patch<any>(`${BASE_URL}/${id}`, data)
    return { data: res.data }
  },

  deleteFeature: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default FeaturesApi
