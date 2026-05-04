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
      // Prefer a real branch membership for tenant-scoped requests.
      const user = response?.data
      const activeBranchMembership = user?.memberships?.find(
        (m: any) => m.scopeType === "branch" && m.scopeId
      )
      const activeOrganizationMembership = user?.memberships?.find(
        (m: any) => m.scopeType === "organization" && m.scopeId
      )

      if (activeBranchMembership?.scopeId) {
        localStorage.setItem("activeBranchId", activeBranchMembership.scopeId)
      } else {
        localStorage.removeItem("activeBranchId")
      }

      if (activeOrganizationMembership?.scopeId) {
        localStorage.setItem(
          "activeOrganizationId",
          activeOrganizationMembership.scopeId
        )
      } else {
        localStorage.removeItem("activeOrganizationId")
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      })

      const isSuperAdmin = user?.memberships?.some((m: any) => m.level >= 100)
      navigate(isSuperAdmin ? "/super-admin" : "/admin/dashboard")
    },
  })
}
