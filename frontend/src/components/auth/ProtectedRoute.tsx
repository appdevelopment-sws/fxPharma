import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "@/context/authContext"
import type { PermissionName, RoleName } from "@/lib/access"

type ProtectedRouteProps = {
  allowedRoles?: RoleName[]
  allowedPermissions?: PermissionName[]
  permissionMatch?: "all" | "any"
}

export default function ProtectedRoute({
  allowedRoles,
  allowedPermissions,
  permissionMatch = "all",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()

  const location = useLocation()
  console.log("USER", user)
  console.log("ROLES CONST", allowedRoles)

  console.log(
    "ORG ROLES",
    user?.organizations?.map((o: any) => o.role?.key)
  )
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }
  if (allowedRoles && user) {
    const hasRole = user.organizations?.some((org: any) =>
      allowedRoles.includes(org.role?.key)
    )

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }
  if (allowedPermissions?.length) {
    const hasAccess =
      permissionMatch === "any"
        ? allowedPermissions.some((permission) => hasPermission(permission))
        : hasPermission(...allowedPermissions)

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />
    }
  }

  return <Outlet />
}
