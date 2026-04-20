import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/authContext"
import {
  flattenSuperAdminNavigationItems,
  getSuperAdminPermissionSummary,
  getVisibleSuperAdminNavigation,
} from "@/components/super-admin/super-admin-navigation"
import { StatCard } from "@/components/stat-card"
import { ChartCard } from "@/components/chart-card"
import { DashboardAreaChart, DashboardBarChart } from "@/components/charts"
import { Layers, ShieldAlert, Cpu, Network } from "lucide-react"
import SectionCard from "@/components/SectionCard"

// Mock data for demonstration purposes
const metricData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 550 },
  { name: "Apr", value: 450 },
  { name: "May", value: 700 },
  { name: "Jun", value: 650 },
]

const tenantActivityData = [
  { name: "Tenant A", value: 120 },
  { name: "Tenant B", value: 80 },
  { name: "Tenant C", value: 150 },
  { name: "Tenant D", value: 90 },
]

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const permissionCards = getSuperAdminPermissionSummary(user)
  const visibleModules = flattenSuperAdminNavigationItems(
    getVisibleSuperAdminNavigation(user)
  ).filter((item) => item.to !== "/super-admin")

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          Platform Control
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Signed in as {user.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Shops"
          value={permissionCards.length}
          helper="From active super admin role"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard
          title="Expired
Businesses"
          value={visibleModules.length + 1}
          helper="Available sidebar entries"
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          title="Plan Subscribes"
          value={4}
          helper="Platform boundaries"
          icon={<Network className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <StatCard
          title="Total Categories"
          value="24%"
          helper="Stable operational metrics"
          icon={<Cpu className="h-4 w-4" />}
        />
        <StatCard
          title="Total Plans"
          value="24%"
          helper="Stable operational metrics"
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Platform Request Volume"
          description="API hits across the entire platform over the last 6 months."
        >
          <DashboardAreaChart data={metricData} xKey="name" yKey="value" />
        </ChartCard>

        <ChartCard
          title="Top Tenants by Activity"
          description="Tenants with the most resource utilization."
        >
          <DashboardBarChart
            data={tenantActivityData}
            xKey="name"
            yKey="value"
          />
        </ChartCard>
      </div>
      {/* <div>
        <SectionCard title="New Registrations">
          <div className="grid gap-4 lg:grid-cols-2"></div>
        </SectionCard>
      </div> */}
      {/* <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          size="sm"
          title="Accessible Platform Modules"
          className="tex-sm"
          description="Super admin navigation is driven by role and permission rules, not a hardcoded layout."
        >
          <div className="grid gap-3">
            {visibleModules.map((module) => (
              <div
                key={module.to}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
              >
                <p className="text-sm font-medium">{module.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <ChartCard
          title="Active Permission Set"
          description="Permissions currently loaded into the super admin session."
        >
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
        </ChartCard>
      </div> */}
    </div>
  )
}
