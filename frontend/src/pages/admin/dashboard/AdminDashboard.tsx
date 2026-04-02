import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import {
  flattenAdminNavigationItems,
  getPermissionSummary,
  getVisibleAdminNavigation,
} from "@/components/admin/admin-navigation"

export default function AdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const permissionCards = getPermissionSummary(user)
  const visibleModules = flattenAdminNavigationItems(getVisibleAdminNavigation(user))
    .filter((item) => item.to !== "/admin/dashboard")

  const stats = [
    {
      label: "Granted permissions",
      value: String(permissionCards.length),
      helper: "Resolved from the current authenticated session",
    },
    {
      label: "Visible modules",
      value: String(visibleModules.length + 1),
      helper: "Sidebar items currently available to this user",
    },
    {
      label: "Tenant status",
      value: user.tenant?.status ?? "Unknown",
      helper: "Workspace health reported by the backend",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Tenant Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {user.tenant?.name} • {user.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 shadow-sm">
            <CardHeader>
              <CardDescription className="uppercase tracking-[0.2em]">
                {stat.label}
              </CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {stat.helper}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Accessible Modules</CardTitle>
            <CardDescription>
              Navigation visibility is derived from the same permission model
              that guards your routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visibleModules.length > 0 ? (
              visibleModules.map((module) => (
                <div
                  key={module.to}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="text-sm font-medium">{module.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No additional modules are visible for this account yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Granted Permissions</CardTitle>
            <CardDescription>
              The following permissions are available right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissionCards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {permissionCards.map(({ permission, label }) => (
                  <Badge
                    key={permission}
                    variant="outline"
                    className="rounded-full px-3 py-1"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No permissions are assigned to this account yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
