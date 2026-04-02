import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "@/context/authContext"

type ProtectedRouteProps = {
  allowedRoles?: string[]
  allowedPermissions?: string[]
  permissionMatch?: "all" | "any"
}

export default function ProtectedRoute({
  allowedRoles,
  allowedPermissions,
  permissionMatch = "all",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()
  const location = useLocation()

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

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
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
