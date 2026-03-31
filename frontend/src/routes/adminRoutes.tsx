// src/routes/AdminRoutes.jsx

import AdminLayout from "@/layout/AdminLayout"
import LoginScreen from "@/pages/admin/auth/login"
import RegisterPage from "@/pages/admin/auth/register"
import { Route } from "react-router"

export const AdminRoutes = () => {
  return (
    <>
      {/* <Route path="/admin" element={<AdminLayout />}> */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="register" element={<RegisterPage />} />{" "}
        <Route path="login" element={<LoginScreen />} />
        <Route path="dashboard" element={"hiii"} />
        <Route path="dashboard" element={"hiii"} />
      </Route>
    </>
  )
}
