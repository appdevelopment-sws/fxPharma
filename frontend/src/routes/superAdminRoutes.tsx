import { Navigate, Route } from "react-router"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import SuperAdminLayout from "@/layout/SuperAdminLayout"
import SuperAdminDashboard from "@/pages/super-admin/dashboard/SuperAdminDashboard"
import SuperAdminProfilePage from "@/pages/super-admin/profile/SuperAdminProfilePage"
import SuperAdminTenantsPage from "@/pages/super-admin/tenants/SuperAdminTenantsPage"
import SuperAdminAccessPage from "@/pages/super-admin/access/SuperAdminAccessPage"
import SuperAdminProductsNewPage from "@/pages/super-admin/products/ProductsNewPage"

export const SuperAdminRoutes = () => {
  return (
    <Route element={<ProtectedRoute allowedRoles={["Super Admin"]} />}>
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        {" "}
        <Route
          index
          element={<Navigate to="/super-admin/dashboard" replace />}
        />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="profile" element={<SuperAdminProfilePage />} />
        <Route path="products/new" element={<SuperAdminProductsNewPage />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Super Admin"]}
              allowedPermissions={["USER_READ"]}
            />
          }
        >
          <Route path="tenants" element={<SuperAdminTenantsPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Super Admin"]}
              allowedPermissions={["ROLE_MANAGE"]}
            />
          }
        >
          <Route path="access" element={<SuperAdminAccessPage />} />
        </Route>
      </Route>
    </Route>
  )
}
