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
      // 1. If user has memberships, set the first one as active branch
      const user = response?.data
      const firstBranchId = user?.memberships?.find((m: any) => m.scopeId)?.scopeId

      if (firstBranchId) {
        localStorage.setItem("activeBranchId", firstBranchId)
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      })

      const isSuperAdmin = user?.memberships?.some((m: any) => m.level >= 100)
      navigate(isSuperAdmin ? "/super-admin" : "/admin/dashboard")
    },
  })
}
