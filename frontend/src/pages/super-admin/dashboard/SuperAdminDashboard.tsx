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
  flattenSuperAdminNavigationItems,
  getSuperAdminPermissionSummary,
  getVisibleSuperAdminNavigation,
} from "@/components/super-admin/super-admin-navigation"

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const permissionCards = getSuperAdminPermissionSummary(user)
  const visibleModules = flattenSuperAdminNavigationItems(
    getVisibleSuperAdminNavigation(user)
  ).filter((item) => item.to !== "/super-admin")

  const stats = [
    {
      label: "Platform permissions",
      value: String(permissionCards.length),
      helper: "Resolved from the active super admin role",
    },
    {
      label: "Visible modules",
      value: String(visibleModules.length + 1),
      helper: "Sidebar entries available to this platform user",
    },
    {
      label: "Tenant scope",
      value: user.tenant?.name ?? "Platform",
      helper: "Reserved tenant boundary for platform operations",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Platform Control
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Signed in as {user.email}
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
            <CardTitle>Accessible Platform Modules</CardTitle>
            <CardDescription>
              Super admin navigation is now driven by role and permission rules,
              not a hardcoded dashboard-only layout.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visibleModules.map((module) => (
              <div
                key={module.to}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <p className="text-sm font-medium">{module.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Active Permission Set</CardTitle>
            <CardDescription>
              Permissions currently loaded into the super admin session.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
