import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/authContext"
import {
  flattenAdminNavigationItems,
  getPermissionSummary,
  getVisibleAdminNavigation,
} from "@/components/admin/admin-navigation"
import { StatCard } from "@/components/stat-card"
import { ChartCard } from "@/components/chart-card"
import { DashboardBarChart, DashboardLineChart } from "@/components/charts"
import { ShieldCheck, LayoutGrid, Building2, Activity } from "lucide-react"

// Mock data for demonstration purposes
const activityData = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 18 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 25 },
  { name: "Fri", value: 20 },
  { name: "Sat", value: 10 },
  { name: "Sun", value: 30 },
]

const moduleUsageData = [
  { name: "Users", value: 45 },
  { name: "Roles", value: 20 },
  { name: "Products", value: 80 },
  { name: "Sales", value: 65 },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const permissionCards = getPermissionSummary(user)
  const visibleModules = flattenAdminNavigationItems(
    getVisibleAdminNavigation(user)
  ).filter((item) => item.to !== "/admin/dashboard")

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          Tenant Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {user?.name} • {user.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Granted Permissions"
          value={permissionCards.length}
          helper="Resolved from current session"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Visible Modules"
          value={visibleModules.length + 1}
          helper="Available sidebar items"
          icon={<LayoutGrid className="h-4 w-4" />}
        />
        <StatCard
          title="Tenant Status"
          value={user.tenant?.status ?? "Unknown"}
          helper="Workspace health"
          icon={<Building2 className="h-4 w-4" />}
          valueClassName="capitalize text-2xl"
        />
        <StatCard
          title="Weekly Activity"
          value="84%"
          helper="+12% from last week"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Weekly Activity Overview"
          description="A summary of actions taken this week."
        >
          <DashboardLineChart data={activityData} xKey="name" yKey="value" />
        </ChartCard>

        <ChartCard
          title="Module Engagement"
          description="Most interacted modules in this tenant."
        >
          <DashboardBarChart data={moduleUsageData} xKey="name" yKey="value" />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <ChartCard
          title="Accessible Modules"
          description="Navigation visibility is derived from the same permission model that guards your routes."
        >
          <div className="grid gap-3">
            {visibleModules.length > 0 ? (
              visibleModules.map((module) => (
                <div
                  key={module.to}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <p className="text-sm font-medium">{module.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No additional modules are visible for this account yet.
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Granted Permissions"
          description="The following permissions are available right now."
        >
          {permissionCards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissionCards.map(({ permission, label }) => (
                <Badge
                  key={permission}
                  variant="outline"
                  className="rounded-full bg-background px-3 py-1"
                >
                  {label}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No permissions are assigned to this account yet.
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
