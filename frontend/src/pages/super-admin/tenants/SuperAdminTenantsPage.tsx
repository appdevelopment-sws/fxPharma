import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { platformTenantCapabilities } from "@/lib/access"

export default function SuperAdminTenantsPage() {
  const { user, hasPermission } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Platform Oversight
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Tenants</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This route is now protected and surfaced through the super admin
          sidebar only when the authenticated role and permission set allow it.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Tenant Operations Shell</CardTitle>
            <CardDescription>
              Dedicated entry point for future tenant tables, audits, and
              platform monitoring views.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Super admin navigation now treats tenants as a governed module
              instead of a hidden dashboard-only concern.
            </p>
            <p>
              That keeps platform operations aligned with the same permission and
              route-boundary rules used elsewhere in the app.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Capability Matrix</CardTitle>
            <CardDescription>
              Effective permissions for tenant-level platform actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformTenantCapabilities.map((item) => (
              <div
                key={item.permission}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.permission}
                  </p>
                </div>
                <Badge variant={hasPermission(item.permission) ? "default" : "outline"}>
                  {hasPermission(item.permission) ? "Granted" : "Not Granted"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
