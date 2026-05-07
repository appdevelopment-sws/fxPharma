import { api } from "./api"

export const UserApi = {
  getUsers: async (params?: any) => {
    return api.get("/users", { params })
  },
  getUser: async (id: string) => {
    return api.get(`/users/${id}`)
  },
  createUser: async (data: any) => {
    return api.post("/users", data)
  },
  updateUser: async (id: string, data: any) => {
    return api.put(`/users/${id}`, data)
  },
  deleteUser: async (id: string) => {
    return api.delete(`/users/${id}`)
  },
}
