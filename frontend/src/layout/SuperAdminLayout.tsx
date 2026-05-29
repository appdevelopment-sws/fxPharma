import { useMemo, useCallback } from "react"
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
      workspaceLabel="Super Admin"
      workspaceTitle={user?.name ?? "Platform Console"}
      workspaceSubtitle={
         "/logo.png"
      }
      userName={user?.name ?? "Super Admin"}
      userRole={user?.role ?? "Super Admin"}
      userEmail={user?.email}
      isLoggingOut={false}
      navigationGroups={navigationGroups}
      brandIcon={<PlatformShieldIcon className="size-5" />}
      onLogout={handleLogout}
    />
  )
}

export default SuperAdminLayout
