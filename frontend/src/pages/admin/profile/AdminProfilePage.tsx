import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { getPermissionSummary } from "@/components/admin/admin-navigation"
import { permissionLabels } from "@/lib/access"

export default function AdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const permissionSummary = getPermissionSummary(user)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
          Account Workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review the account, tenant, and permission information currently
          attached to this authenticated session.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>
              Core account details resolved from the current session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Name" value={user.name} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Role" value={user.role} />
            <ProfileField
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
            <CardDescription>
              Workspace ownership and tenant status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileField
              label="Tenant Name"
              value={user.tenant?.name ?? "Unassigned"}
            />
            <ProfileField
              label="Tenant Status"
              value={user.tenant?.status ?? "Unknown"}
            />
            <ProfileField label="Tenant ID" value={user.tenantId} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Granted Permissions</CardTitle>
          <CardDescription>
            Permissions available to this account and reflected in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionSummary.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissionSummary.map(({ permission, label }) => (
                <Badge key={permission} variant="outline" className="px-3 py-1">
                  {label ?? permissionLabels[permission] ?? permission}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No permissions are assigned to this account yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
