import { useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useAuth } from "@/context/authContext"
import AuthApi from "@/services/authApi"
import { queryClient } from "@/services/customQueryClient"
import { queryKeys } from "@/lib/queryKeys"
import {
  PharmacyCrossIcon,
  getVisibleAdminNavigation,
} from "@/components/admin/admin-navigation"
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell"

const AdminLayout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const navigationGroups = useMemo(
    () => getVisibleAdminNavigation(user),
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
      appLabel="Dawa Dukaan"
      workspaceLabel={user?.name ?? "Tenant Workspace"}
      workspaceTitle={
        user?.organizations[0].organization.name ?? "Tenant Workspace"
      }
      workspaceSubtitle={
        user?.organizations[0].organization.logo ?? "Tenant Workspace"
      }
      userName={user?.name ?? "Workspace User"}
      userRole={user?.role ?? "Member"}
      userEmail={user?.email}
      isLoggingOut={logoutMutation.isPending}
      navigationGroups={navigationGroups}
      brandIcon={<PharmacyCrossIcon className="size-5" />}
      onOpenProfile={() => navigate("/admin/profile")}
      onLogout={() => logoutMutation.mutate()}
    />
  )
}

export default AdminLayout
