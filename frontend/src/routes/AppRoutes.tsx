import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AdminRoutes } from "./adminRoutes"
import { SuperAdminRoutes } from "./superAdminRoutes"
import UnauthorizedPage from "@/pages/shared/UnauthorizedPage"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {AdminRoutes()}
        {SuperAdminRoutes()}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
