import { api } from "./api"

export const RoleApi = {
  getRoles: async (params?: any) => {
    return api.get("/roles", { params })
  },
  getRole: async (id: string) => {
    return api.get(`/roles/${id}`)
  },
  createRole: async (data: any) => {
    return api.post("/roles", data)
  },
  updateRole: async (id: string, data: any) => {
    return api.put(`/roles/${id}`, data)
  },
  deleteRole: async (id: string) => {
    return api.delete(`/roles/${id}`)
  },
}
