import { useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell"
import { useAuth } from "@/context/authContext"
import AuthApi from "@/services/authApi"
import { queryClient } from "@/services/customQueryClient"
import { queryKeys } from "@/lib/queryKeys"
import {
  PlatformShieldIcon,
  getVisibleSuperAdminNavigation,
} from "@/components/super-admin/super-admin-navigation"

const SuperAdminLayout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const navigationGroups = useMemo(
    () => getVisibleSuperAdminNavigation(user),
    [user]
  )

  const logoutMutation = useMutation({
    mutationFn: AuthApi.logout,
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.auth.user(), null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      navigate("/admin/login", { replace: true })
    },
  })

  return (
    <WorkspaceShell
      appLabel="Pharmacy Software"
      workspaceLabel="Super Admin"
      workspaceTitle={user?.tenant?.name ?? "Platform Console"}
      workspaceSubtitle="Role-aware super admin operations workspace"
      userName={user?.name ?? "Super Admin"}
      userRole={user?.role ?? "Super Admin"}
      userEmail={user?.email}
      isLoggingOut={logoutMutation.isPending}
      navigationGroups={navigationGroups}
      brandIcon={<PlatformShieldIcon className="size-5" />}
      onLogout={() => logoutMutation.mutate()}
    />
  )
}

export default SuperAdminLayout
