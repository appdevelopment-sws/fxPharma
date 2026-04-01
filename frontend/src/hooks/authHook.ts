// src/features/auth/hooks/useRegister.ts

import { useMutation } from "@tanstack/react-query"
import AuthApi from "@/services/authApi"
import { queryClient } from "@/services/customQueryClient"
import { queryKeys } from "@/lib/queryKeys"
import { useNavigate } from "react-router"

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: AuthApi.register,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.all,
      })
      navigate("/admin/login")
    },
  })
}
export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: AuthApi.login,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      })

      const role = response?.data?.role
      navigate(role === "Super Admin" ? "/super-admin" : "/admin/dashboard")
    },
  })
}
