import { useAuth } from "@/context/authContext"

const permissionLabels: Record<string, string> = {
  USER_CREATE: "Can create tenant users",
  USER_READ: "Can view tenant users",
  USER_UPDATE: "Can update tenant users",
  USER_DELETE: "Can delete tenant users",
  ROLE_MANAGE: "Can manage tenant roles",
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth()

  if (!user) return null

  const permissionCards = Object.entries(permissionLabels).filter(([permission]) =>
    hasPermission(permission),
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Tenant Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-muted-foreground">
          {user.tenant?.name} • {user.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {permissionCards.map(([permission, label]) => (
          <div
            key={permission}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Permission
            </p>
            <h2 className="mt-3 text-lg font-semibold">{permission}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {permissionCards.length === 0 && (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          No permissions are assigned to this account yet.
        </div>
      )}
    </div>
  )
}
