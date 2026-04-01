import type { RegisterSchema } from "@/validations/admin/registerValidation"
import { api } from "./api"
import type { loginSchema } from "@/validations/admin/loginValidation"
const API_URL = "/auth"

const AuthApi = {
  register: (data: RegisterSchema) => api.post(`${API_URL}/register`, data),
  login: (data: loginSchema) => api.post(`${API_URL}/login`, data),
  getCurrentUser: () => api.get(`${API_URL}/getuser`),
  logout: () => api.post(`${API_URL}/logout`),
}

export default AuthApi
