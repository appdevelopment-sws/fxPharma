import axios from "axios"

const CustomApi = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
})

CustomApi.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response
    }
    return response.data
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

export const api = {
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    return await CustomApi.get(url, config)
  },
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return await CustomApi.post(url, data, config)
  },
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return await CustomApi.put(url, data, config)
  },
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return await CustomApi.patch(url, data, config)
  },
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    return await CustomApi.delete(url, config)
  },
}
