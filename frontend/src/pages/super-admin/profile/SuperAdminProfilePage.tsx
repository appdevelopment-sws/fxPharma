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

export default function SuperAdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const permissions = getSuperAdminPermissionSummary(user)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          Platform Identity
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Platform account details used to resolve super admin role access and
          sidebar visibility.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>Current platform session details.</CardDescription>
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
            <CardTitle>Platform Tenant</CardTitle>
            <CardDescription>
              Reserved workspace details for platform administration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileField
              label="Tenant Name"
              value={user.tenant?.name ?? "Platform"}
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
          <CardTitle>Resolved Platform Permissions</CardTitle>
          <CardDescription>
            All permissions available to the current super admin role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {permissions.map(({ permission, label }) => (
              <Badge key={permission} variant="outline" className="px-3 py-1">
                {label}
              </Badge>
            ))}
          </div>
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
