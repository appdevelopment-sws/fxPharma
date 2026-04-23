import { Navigate, Route } from "react-router"
import AdminLayout from "@/layout/AdminLayout"
import LoginScreen from "@/pages/admin/auth/login"
import RegisterPage from "@/pages/admin/auth/register"
import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard"
import AdminUsersPage from "@/pages/admin/users/AdminUsersPage"
import AdminRolesPage from "@/pages/admin/roles/AdminRolesPage"
import AdminProfilePage from "@/pages/admin/profile/AdminProfilePage"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute"
import { PERMISSIONS, ROLES } from "@/lib/access"
import AllInventory from "@/pages/admin/inventory/AllInventory"

export const AdminRoutes = () => {
  return (
    <>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/admin/login" element={<LoginScreen />} />
        <Route path="/admin/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.BRANCH_ADMIN, ROLES.STAFF]} />
        }
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="all-inventory" element={<AllInventory />} />
          <Route
            element={
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.USER_READ]}
              />
            }
          >


            <Route path="users" element={<AdminUsersPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.ROLE_MANAGE]}
              />
            }
          >
            <Route path="roles" element={<AdminRolesPage />} />
          </Route>
        </Route>
      </Route>
    </>
  )
}
