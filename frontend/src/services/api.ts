import axios from "axios"

const baseApiSettings = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
})

baseApiSettings.interceptors.response.use(
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
