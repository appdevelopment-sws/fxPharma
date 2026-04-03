import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { PERMISSIONS, userManagementCapabilities } from "@/lib/access"

export default function AdminUsersPage() {
  const { user, hasPermission } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Workspace Management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tenant Users
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This section is already protected by route permissions and gives you a
          safe place to plug in a full users table later.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>User Directory Module</CardTitle>
            <CardDescription>
              Production-ready shell for a permissions-aware users feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The sidebar only exposes this page when the signed-in user has the
              `{PERMISSIONS.USER_READ}` permission, and the route itself blocks direct access
              without it.
            </p>
            <p>
              That means future CRUD screens can live here without duplicating
              navigation checks in multiple places.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Capability Matrix</CardTitle>
            <CardDescription>
              Quick snapshot of what this account can do inside user management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userManagementCapabilities.map((item) => (
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
