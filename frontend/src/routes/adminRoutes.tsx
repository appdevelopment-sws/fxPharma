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
import AllCompound from "@/pages/admin/compound/AllCompound"
import Orders from "@/pages/admin/orders/Orders"
import Suppliers from "@/pages/admin/supplier/suppliers"
import ReturnsPage from "@/pages/admin/returns/ReturnsPage"
import RecentInvoicesPage from "@/pages/admin/invoices/RecentInvoicesPage"
import POS from "@/pages/admin/sales/pos"
import ImportInventory from "@/pages/admin/InterStoreTransfer/ImportInventory"
import AllInterStoreTransfer from "@/pages/admin/InterStoreTransfer/AllInterStoreTransfer"
import DailyTransactionReport from "@/pages/admin/reports/DailyTransactionReport"
import ExpiryReports from "@/pages/admin/reports/ExpiryReports"
import Branch from "@/pages/admin/Branch/Branch"

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
          <Route path="all-compound" element={<AllCompound />} />
          <Route path="import-inventory" element={<ImportInventory />} />
          <Route
            path="inter-store-transfer"
            element={<AllInterStoreTransfer />}
          />
          <Route path="orders" element={<Orders />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="invoices" element={<RecentInvoicesPage />} />
          <Route path="pos" element={<POS />} />
          <Route path="branch" element={<Branch />} />

          <Route
            element={
              <ProtectedRoute allowedPermissions={[PERMISSIONS.USER_READ]} />
            }
          >
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute allowedPermissions={[PERMISSIONS.ROLE_MANAGE]} />
            }
          >
            <Route path="roles" element={<AdminRolesPage />} />
          </Route>
          <Route
            path="reports/daily-transaction-report"
            element={<DailyTransactionReport />}
          />
          <Route path="reports/expiry-reports" element={<ExpiryReports />} />
        </Route>
      </Route>
    </>
  )
}
