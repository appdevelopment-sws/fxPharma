import { useEffect, useState } from "react"
import { Link } from "react-router"
import { api } from "@/services/api"
import { useAuth } from "@/context/authContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { ChartCard } from "@/components/chart-card"
import { DashboardAreaChart, DashboardBarChart } from "@/components/charts"
import SectionCard from "@/components/SectionCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  Users,
  Receipt,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Activity,
  Award,
  ArrowRight,
  RefreshCw,
  Clock,
  BarChart3,
  Layers,
} from "lucide-react"

interface DashboardStats {
  summary: {
    totalShops: number
    activeShops: number
    inactiveShops: number
    totalUsers: number
    totalInvoices: number
    totalRevenue: number
    totalPlans: number
  }
  planDistribution: Array<{
    planId: string | null
    planName: string
    count: number
  }>
  recentOrganizations: Array<{
    id: string
    name: string
    slug: string
    ownerEmail: string
    isActive: boolean
    planName: string
    createdAt: string
    lastActive: string
    branchCount: number
    memberCount: number
    invoiceCount: number
    inventoryCount: number
    totalActions: number
  }>
  organizationLeaderboard: Array<{
    rank: number
    id: string
    name: string
    slug: string
    ownerEmail: string
    planName: string
    isActive: boolean
    activityScore: number
    auditLogCount: number
    invoiceCount: number
    inventoryCount: number
    memberCount: number
    lastActive: string
  }>
  featureUsage: Array<{
    feature: string
    entity: string
    usageCount: number
  }>
  activityTrend: Array<{
    date: string
    formattedDate: string
    value: number
  }>
  recentAuditLogs: Array<{
    id: string
    action: string
    entity: string
    entityId: string
    userName: string
    userEmail: string | null
    organizationName: string
    organizationSlug: string | null
    ipAddress: string | null
    createdAt: string
  }>
}

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>("/superadmin/dashboard-stats")
      if (res?.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error("Failed to load super admin stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (!user) return null

  const getActionBadge = (act: string) => {
    switch (act) {
      case "CREATE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200">CREATE</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-200">UPDATE</Badge>
      case "DELETE":
        return <Badge className="bg-rose-500/15 text-rose-600 border-rose-200">DELETE</Badge>
      case "LOGIN":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-200">LOGIN</Badge>
      default:
        return <Badge variant="outline">{act}</Badge>
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase font-medium">
              Enterprise Control Center
            </p>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Live Production
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Super Admin Overview</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Analytics
          </Button>
          <Button asChild size="sm">
            <Link to="/super-admin/audit-logs">
              <ShieldCheck className="h-4 w-4 mr-2" />
              View Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Organizations"
          value={loading ? "..." : (stats?.summary.totalShops ?? 0)}
          helper={`${stats?.summary.activeShops ?? 0} active, ${stats?.summary.inactiveShops ?? 0} inactive`}
          icon={<Building2 className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Total Platform Users"
          value={loading ? "..." : (stats?.summary.totalUsers ?? 0)}
          helper="Registered store staff & admins"
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Platform Invoices"
          value={loading ? "..." : (stats?.summary.totalInvoices ?? 0)}
          helper="Total transactions created"
          icon={<Receipt className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Platform Volume"
          value={loading ? "..." : formatCurrency(stats?.summary.totalRevenue ?? 0)}
          helper="Total billed invoice volume"
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          valueClassName="text-xl font-bold"
        />
        <StatCard
          title="Subscription Plans"
          value={loading ? "..." : (stats?.summary.totalPlans ?? 0)}
          helper="Available tier offerings"
          icon={<Boxes className="h-4 w-4 text-rose-500" />}
        />
      </div>

      {/* Charts Grid: Activity Trend & Feature Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Platform Activity Volume"
          description="30-day activity volume across all active client organizations."
        >
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Loading activity trends...
            </div>
          ) : (
            <DashboardAreaChart
              data={stats?.activityTrend || []}
              xKey="formattedDate"
              yKey="value"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Feature Usage Distribution"
          description="Total interactions per software module (Billing, Inventory, Orders, Credit)."
        >
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Loading feature usage metrics...
            </div>
          ) : (
            <DashboardBarChart
              data={(stats?.featureUsage || []).map((f) => ({
                name: f.feature,
                value: f.usageCount,
              }))}
              xKey="name"
              yKey="value"
            />
          )}
        </ChartCard>
      </div>

      {/* Recent Organizations Table */}
      <SectionCard
        title="Recent Organizations Using Software"
        description="Newly registered and active pharmacies/medical shops on the platform."
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/super-admin/store-list" className="text-xs">
              Manage Stores <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        }
      >
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Organization Name</TableHead>
                <TableHead>Owner / Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
                <TableHead className="text-right">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                    Loading recent organizations...
                  </TableCell>
                </TableRow>
              ) : !stats?.recentOrganizations || stats.recentOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                    No organizations found.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentOrganizations.map((org) => (
                  <TableRow key={org.id} className="hover:bg-muted/20">
                    <TableCell className="font-semibold text-sm">
                      <div>
                        {org.name}
                        <p className="text-[11px] font-mono text-muted-foreground font-normal">
                          slug: {org.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {org.ownerEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {org.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {org.isActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {org.memberCount}
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {org.invoiceCount}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(org.lastActive).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Grid: Organization Leaderboard & Live Audit Feed */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Active Organizations Leaderboard */}
        <SectionCard
          title="Most Active Organizations Leaderboard"
          description="Top stores ranked by transaction volume and platform engagement."
        >
          <div className="space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading leaderboard...</p>
            ) : !stats?.organizationLeaderboard || stats.organizationLeaderboard.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active organization metrics yet.</p>
            ) : (
              stats.organizationLeaderboard.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        org.rank === 1
                          ? "bg-amber-500/20 text-amber-600 border border-amber-300"
                          : org.rank === 2
                          ? "bg-slate-300/40 text-slate-700 dark:text-slate-200 border border-slate-300"
                          : org.rank === 3
                          ? "bg-amber-800/20 text-amber-800 dark:text-amber-300 border border-amber-700/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {org.rank === 1 ? <Award className="h-4 w-4 text-amber-500" /> : `#${org.rank}`}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.invoiceCount} invoices • {org.auditLogCount} logged actions
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-primary">
                      Score: {org.activityScore}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Active: {new Date(org.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Live Audit Log Feed */}
        <SectionCard
          title="Real-Time Audit & Activity Log Feed"
          description="Recent platform events across all medical stores."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/super-admin/audit-logs" className="text-xs">
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading audit log stream...</p>
            ) : !stats?.recentAuditLogs || stats.recentAuditLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent log events recorded.</p>
            ) : (
              stats.recentAuditLogs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 text-xs bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getActionBadge(log.action)}
                    <div className="min-w-0">
                      <p className="font-medium truncate text-foreground">
                        <span className="font-semibold">{log.entity}</span> by {log.userName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Org: {log.organizationName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground shrink-0 pl-2">
                    <Clock className="h-3 w-3 inline mr-1 text-muted-foreground" />
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
