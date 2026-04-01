import { Route } from "react-router"
import AdminLayout from "@/layout/AdminLayout"
import LoginScreen from "@/pages/admin/auth/login"
import RegisterPage from "@/pages/admin/auth/register"
import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute"

export const AdminRoutes = () => {
  return (
    <>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/admin/login" element={<LoginScreen />} />
        <Route path="/admin/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin", "User"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
    </>
  )
}
