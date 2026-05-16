import { api } from "./api"

export const BranchApi = {
  getBranches: async (params?: any) => {
    const { perPage, ...rest } = params || {}
    const res = await api.get("/branches", {
      params: {
        ...rest,
        limit: perPage ?? rest.limit,
      },
    })

    return {
      ...res,
      meta: res.meta
        ? {
            ...res.meta,
            pages: res.meta.totalPages,
          }
        : res.meta,
    }
  },
  getBranch: async (id: string) => {
    return api.get(`/branches/${id}`)
  },
  createBranch: async (data: any) => {
    return api.post("/branches", data)
  },
  updateBranch: async (id: string, data: any) => {
    return api.put(`/branches/${id}`, data)
  },
  deleteBranch: async (id: string) => {
    return api.delete(`/branches/${id}`)
  },
}
