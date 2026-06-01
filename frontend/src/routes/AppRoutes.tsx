import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AdminRoutes } from "./adminRoutes"
import { SuperAdminRoutes } from "./superAdminRoutes"
import UnauthorizedPage from "@/pages/shared/UnauthorizedPage"
import { useAuth } from "@/context/authContext"

export default function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null // Or a global loading spinner
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Always register both route groups. Access is protected inside each group by ProtectedRoute/PublicOnlyRoute. */}
        {AdminRoutes()}
        {SuperAdminRoutes()}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
