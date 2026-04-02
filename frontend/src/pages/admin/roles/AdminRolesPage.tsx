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
  getPermissionSummary,
  permissionLabels,
} from "@/components/admin/admin-navigation"

export default function AdminRolesPage() {
  const { user } = useAuth()

  if (!user) return null

  const grantedPermissions = getPermissionSummary(user)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Access Control
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Roles & Permissions
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This area is restricted to accounts with `ROLE_MANAGE`, making it the
          correct home for future role editors and permission policies.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Current Access Envelope</CardTitle>
          <CardDescription>
            Permissions available to the signed-in user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {grantedPermissions.map(({ permission, label }) => (
              <Badge key={permission} variant="outline" className="px-3 py-1">
                {label}
              </Badge>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            Role editing UI is not implemented yet, but the navigation,
            permission gate, and page boundary are in place for a clean rollout.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(permissionLabels).map(([permission, label]) => {
          const granted = user.permissions.includes(permission)

          return (
            <Card key={permission} size="sm" className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>{permission}</CardTitle>
                <CardDescription>{label}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={granted ? "default" : "outline"}>
                  {granted ? "Granted in this role" : "Not included"}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
