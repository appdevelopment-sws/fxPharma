import { COMPOUNDING_SAMPLE_DATA } from "@/constants/page/admin/newcompound"

export const compoundingApi = {
  getAll: async (params?: any) => {
    // Mocking API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      data: COMPOUNDING_SAMPLE_DATA,
      meta: {
        total: COMPOUNDING_SAMPLE_DATA.length,
        page: params?.page || 1,
        limit: params?.perPage || 10,
        totalPages: 1,
      },
    }
  },

  getById: async (id: string) => {
    const item = COMPOUNDING_SAMPLE_DATA.find((i) => i.id === id)
    return { data: item }
  },

  create: async (data: any) => {
    console.log("Creating compound:", data)
    return { data: { ...data, id: Math.random().toString(36).substr(2, 9) } }
  },

  update: async (id: string, data: any) => {
    console.log("Updating compound:", id, data)
    return { data: { ...data, id } }
  },

  delete: async (id: string) => {
    console.log("Deleting compound:", id)
    return { success: true }
  },
}
