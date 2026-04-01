import { Outlet } from "react-router"
import { useAuth } from "@/context/authContext"

const SuperAdminLayout = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <div className="border-b border-stone-800 bg-stone-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
              Platform Console
            </p>
            <h1 className="text-lg font-semibold">Super Admin</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-sm text-stone-400">{user?.role}</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default SuperAdminLayout
