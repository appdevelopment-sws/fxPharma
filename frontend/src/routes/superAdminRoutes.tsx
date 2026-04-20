import { Navigate, Route } from "react-router"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import SuperAdminLayout from "@/layout/SuperAdminLayout"
import SuperAdminDashboard from "@/pages/super-admin/dashboard/SuperAdminDashboard"
import SuperAdminProfilePage from "@/pages/super-admin/profile/SuperAdminProfilePage"
import SuperAdminTenantsPage from "@/pages/super-admin/tenants/SuperAdminTenantsPage"
import SuperAdminAccessPage from "@/pages/super-admin/access/SuperAdminAccessPage"
import SuperAdminProductsNewPage from "@/pages/super-admin/products/MasterProductsPage"
import { PERMISSIONS, ROLES } from "@/lib/access"
import HsnPage from "@/pages/super-admin/hsn/HsnPage"
import StoreList from "@/pages/super-admin/store-list/storeList"
import TaxHsnPage from "@/pages/shared/Hsntax/hsnTax"

export const SuperAdminRoutes = () => {
  return (
    <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        {" "}
        <Route
          index
          element={<Navigate to="/super-admin/dashboard" replace />}
        />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="store-list" element={<StoreList />} />
        <Route path="tax-hsn" element={<TaxHsnPage />} />
        <Route path="profile" element={<SuperAdminProfilePage />} />
        <Route path="master-products" element={<SuperAdminProductsNewPage />} />
        <Route path="hsn" element={<HsnPage />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN]}
              allowedPermissions={[PERMISSIONS.USER_READ]}
            />
          }
        >
          <Route path="tenants" element={<SuperAdminTenantsPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN]}
              allowedPermissions={[PERMISSIONS.ROLE_MANAGE]}
            />
          }
        >
          <Route path="access" element={<SuperAdminAccessPage />} />
        </Route>
      </Route>
    </Route>
  )
}
