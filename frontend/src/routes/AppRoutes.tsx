import { BrowserRouter, Routes } from "react-router"
import { AdminRoutes } from "./adminRoutes"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>{AdminRoutes()}</Routes>
    </BrowserRouter>
  )
}
