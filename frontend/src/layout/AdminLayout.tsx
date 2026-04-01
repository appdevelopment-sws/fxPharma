import { Outlet } from "react-router"
import { useAuth } from "@/context/authContext"

const AdminLayout = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
              Pharmacy Software
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              {user?.tenant?.name ?? "Tenant Workspace"}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
