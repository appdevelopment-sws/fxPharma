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
      workspaceLabel={user?.tenant?.name ?? "Tenant Workspace"}
      workspaceTitle={user?.tenant?.name ?? "Tenant Workspace"}
      workspaceSubtitle="Permission-aware admin workspace"
      userName={user?.name ?? "Workspace User"}
      userRole={user?.role ?? "Member"}
      userEmail={user?.email}
      isLoggingOut={logoutMutation.isPending}
      navigationGroups={navigationGroups}
      brandIcon={<PharmacyCrossIcon className="size-5" />}
      onLogout={() => logoutMutation.mutate()}
    />
  )
}

export default AdminLayout
