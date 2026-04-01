import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/context/authContext"

export default function PublicOnlyRoute() {
  const { isLoading, isAuthenticated, isSuperAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={isSuperAdmin ? "/super-admin" : "/admin/dashboard"}
        replace
      />
    )
  }

  return <Outlet />
}
