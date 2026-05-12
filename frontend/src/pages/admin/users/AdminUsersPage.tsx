import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { PERMISSIONS } from "@/lib/access"

export default function AdminUsersPage() {
  const { user, hasPermission } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
          Workspace Management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Tenant Users</h1>
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
        </Card>
      </div>
    </div>
  )
}
