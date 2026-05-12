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

    onSuccess: async (response: any) => {
      const user = response?.data
      if (!user) return

      // Set initial organization and branch context from first organization
      const firstOrg = user.organizations?.[0]
      const organizationBranches = firstOrg?.organization?.branches ?? []
      const mainBranch =
        organizationBranches.find((branch: any) => branch.isMainBranch) ||
        organizationBranches[0]
      const firstBranch = firstOrg?.branches?.[0]?.branch ?? mainBranch

      if (firstOrg?.organizationId) {
        localStorage.setItem("activeOrganizationId", firstOrg.organizationId)
      }
      
      if (firstBranch?.id) {
        localStorage.setItem("activeBranchId", firstBranch.id)
      } else {
        localStorage.removeItem("activeBranchId")
      }

      // Update query cache immediately for synchronous route switching
      queryClient.setQueryData(queryKeys.auth.user(), response)

      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      })

      // Resolve role and redirect
      const roleKey = firstOrg?.role?.key
      if (roleKey === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard")
      } else {
        navigate("/admin/dashboard")
      }
    },
  })
}
