import { useMemo, useCallback } from "react"
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

  const handleLogout = useCallback(async () => {
    try {
      queryClient.cancelQueries({ queryKey: queryKeys.auth.user() })
      queryClient.setQueryData(queryKeys.auth.user(), null)
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
      localStorage.removeItem("activeOrganizationId")
      localStorage.removeItem("activeBranchId")

      await AuthApi.logout()
    } catch {
      // Ignore server-side logout errors; the client session is already cleared.
    } finally {
      window.location.replace("/admin/login")
    }
  }, [])

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
      isLoggingOut={false}
      navigationGroups={navigationGroups}
      brandIcon={<PharmacyCrossIcon className="size-5" />}
      onOpenProfile={() => navigate("/admin/profile")}
      onLogout={handleLogout}
    />
  )
}

export default AdminLayout
