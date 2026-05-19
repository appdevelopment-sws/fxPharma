import axios from "axios"

const CustomApi = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
})

CustomApi.interceptors.request.use((config) => {
  const branchId = localStorage.getItem("activeBranchId")
  const orgId = localStorage.getItem("activeOrganizationId")
  if (branchId) {
    config.headers["x-branch-id"] = branchId
  }
  if (orgId) {
    config.headers["x-organization-id"] = orgId
  }
  return config
})

CustomApi.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response
    }

    const data = response.data

    // Treat application-level failures as real errors even when the HTTP status is 200.
    if (data?.success === false) {
      const apiError: any = new Error(data?.message || "Request failed")
      apiError.response = response
      apiError.data = data
      return Promise.reject(apiError)
    }

    return data
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
