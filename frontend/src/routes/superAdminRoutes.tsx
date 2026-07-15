import { Navigate, Route } from "react-router"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import SuperAdminLayout from "@/layout/SuperAdminLayout"
import SuperAdminDashboard from "@/pages/super-admin/dashboard/SuperAdminDashboard"
import SuperAdminTenantsPage from "@/pages/super-admin/tenants/SuperAdminTenantsPage"
import SuperAdminProductsNewPage from "@/pages/super-admin/products/MasterProductsPage"
import { PERMISSIONS, ROLES } from "@/lib/access"
import HsnPage from "@/pages/super-admin/hsn/HsnPage"
import StoreList from "@/pages/super-admin/store-list/storeList"
import TaxHsnPage from "@/pages/shared/Hsntax/hsnTax"
import TaxSettings from "@/pages/shared/Hsntax/TaxSettings"
import HsnList from "@/pages/shared/Hsntax/HsnList"
import HsnMapping from "@/pages/shared/Hsntax/HsnMapping"
import Brands from "@/pages/shared/Attributes/brands"
import Categories from "@/pages/shared/Attributes/categories"
import Manufacturers from "@/pages/shared/Attributes/manufacturers"
import Units from "@/pages/shared/Attributes/units"
import ManageSubscriptionPage from "@/pages/super-admin/subscription/Subscription"

import AttributesPage from "@/pages/shared/Attributes/AttributesPage"
import FeatureManagementPage from "@/pages/super-admin/features/featureManagementPage"
import AdminCreditPage from "@/pages/super-admin/credit/AdminCreditPage"

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
        <Route path="tax-hsn" element={<TaxHsnPage />}>
          <Route index element={<Navigate to="tax" replace />} />
          <Route path="tax" element={<TaxSettings />} />
          <Route path="hsn" element={<HsnList />} />
          <Route path="mapping" element={<HsnMapping />} />
        </Route>
        <Route path="subscription" element={<ManageSubscriptionPage />} />
        <Route path="features-management" element={<FeatureManagementPage />} />
        <Route path="master-products" element={<SuperAdminProductsNewPage />} />
        <Route path="hsn" element={<HsnPage />} />
        <Route path="attributes" element={<AttributesPage />}>
          <Route index element={<Navigate to="brands" replace />} />
          <Route path="brands" element={<Brands />} />
          <Route path="categories" element={<Categories />} />
          <Route path="manufacturers" element={<Manufacturers />} />
          <Route path="units" element={<Units />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN]}
              allowedPermissions={[PERMISSIONS.USER_VIEW]}
            />
          }
        >
          <Route path="tenants" element={<SuperAdminTenantsPage />} />
        </Route>
        <Route path="credit-requests" element={<AdminCreditPage />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN]}
              allowedPermissions={[PERMISSIONS.ROLE_MANAGE]}
            />
          }
        ></Route>
      </Route>
    </Route>
  )
}
