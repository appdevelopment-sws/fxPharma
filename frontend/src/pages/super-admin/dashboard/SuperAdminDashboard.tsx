import { useAuth } from "@/context/authContext"

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Platform Control
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Signed in as {user.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Role
          </p>
          <h2 className="mt-3 text-lg font-semibold">{user.role}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Full platform-level access across tenants.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Tenant Scope
          </p>
          <h2 className="mt-3 text-lg font-semibold">
            {user.tenant?.name ?? "Platform"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reserved area for tenant oversight and platform operations.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Permissions
          </p>
          <h2 className="mt-3 text-lg font-semibold">
            {user.permissions.length}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Active permissions loaded into the current session.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Active Permission Set
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.permissions.map((permission) => (
            <span
              key={permission}
              className="rounded-full border px-3 py-1 text-xs font-medium"
            >
              {permission}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
