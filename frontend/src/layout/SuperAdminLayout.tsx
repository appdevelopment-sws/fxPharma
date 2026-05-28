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

  const handleLogout = useCallback(() => {
    // Fast logout: clear client state and redirect instantly
    queryClient.clear()
    localStorage.removeItem("activeOrganizationId")
    localStorage.removeItem("activeBranchId")
    navigate("/admin/login", { replace: true })

    // Fire server-side logout in the background (invalidate cookie)
    AuthApi.logout().catch(() => {
      // Silently ignore — client is already logged out
    })
  }, [navigate])

  return (
    <WorkspaceShell
      appLabel="Dawa Dukaan"
      workspaceLabel="Super Admin"
      workspaceTitle={user?.name ?? "Platform Console"}
      workspaceSubtitle="Manage tenants, users, and platform-wide settings"
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
