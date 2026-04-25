import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { getSuperAdminPermissionSummary } from "@/components/super-admin/super-admin-navigation"
import { superAdminPermissionLabels, type PermissionName } from "@/lib/access"

export default function SuperAdminAccessPage() {
  const { user } = useAuth()

  if (!user) return null

  const permissions = getSuperAdminPermissionSummary(user)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          Platform Governance
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Roles & Permissions
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Super admin access control now has its own dedicated route, nested
          sidebar entry, and route boundary.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Current Access Envelope</CardTitle>
          <CardDescription>
            Permissions resolved for the current platform role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {permissions.map(({ permission, label }) => (
              <Badge key={permission} variant="outline" className="px-3 py-1">
                {label}
              </Badge>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            The actual platform role editor is not built yet, but the sidebar,
            access boundaries, and page structure are now ready for it.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(
          Object.entries(superAdminPermissionLabels) as [
            PermissionName,
            string,
          ][]
        ).map(([permission, label]) => {
          const granted = user.permissions.includes(permission)

          return (
            <Card
              key={permission}
              size="sm"
              className="border-border/60 shadow-sm"
            >
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
