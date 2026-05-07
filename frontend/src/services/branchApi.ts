import { api } from "./api"

export const BranchApi = {
  getBranches: async (params?: any) => {
    return api.get("/branches", { params })
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
