import { Route } from "react-router"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import SuperAdminLayout from "@/layout/SuperAdminLayout"
import SuperAdminDashboard from "@/pages/super-admin/dashboard/SuperAdminDashboard"

export const SuperAdminRoutes = () => {
  return (
    <Route element={<ProtectedRoute allowedRoles={["Super Admin"]} />}>
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboard />} />
      </Route>
    </Route>
  )
}
