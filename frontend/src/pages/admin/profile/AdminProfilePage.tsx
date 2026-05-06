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
import { useDisclosure } from "@/hooks/useDisclosure"
import UserDialog from "@/components/dialog/admin/userDialog"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const userDisclosure = useDisclosure()

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
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Quickly add new users to your workspace and assign them to
              branches.
            </CardDescription>
          </div>
          <Button onClick={() => userDisclosure.onOpen()}>
            <Plus className="mr-2 size-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/60 p-8 text-center">
            <div className="mx-auto flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" />
              </div>
              <p className="text-sm font-medium">Manage your team</p>
              <p className="text-xs text-muted-foreground">
                You can add and manage workspace users here. Branch assignment
                is required for all new users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserDialog
        open={userDisclosure.isOpen}
        onClose={userDisclosure.onClose}
      />
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
