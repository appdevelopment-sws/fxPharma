import { useAuth } from "@/context/authContext"
import {
  flattenAdminNavigationItems,
  getPermissionSummary,
  getVisibleAdminNavigation,
} from "@/components/admin/admin-navigation"
import { ChartCard } from "@/components/chart-card"
import { DashboardAreaChart, DashboardBarChart } from "@/components/charts"
import {
  ShieldCheck,
  LayoutGrid,
  Building2,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
  FileText,
  RotateCcw,
  Receipt,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { useTheme } from "@/components/theme-provider"
import { useQuery } from "@tanstack/react-query"
import InvoiceApi from "@/services/invoiceApi"

// ─── Mock Data ────────────────────────────────────────────────────────────────
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
  { name: "Inventory", value: 80 },
  { name: "Sales", value: 65 },
  { name: "Orders", value: 45 },
  { name: "Returns", value: 20 },
]

const recentActivity = [
  {
    id: 1,
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Invoice #1042 processed",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Stock updated — Paracetamol 500mg",
    time: "14 min ago",
  },
  {
    id: 3,
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Low stock alert — Amoxicillin",
    time: "1 hr ago",
  },
  {
    id: 4,
    icon: RotateCcw,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Return processed — Order #0998",
    time: "3 hr ago",
  },
  {
    id: 5,
    icon: Receipt,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    title: "GST report generated",
    time: "Yesterday",
  },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string
  value: string | number
  helper: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  colors: {
    shape1: string
    shape2: string
    iconBg: string
    iconText: string
    gradient: string
  }
}

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  trend = "neutral",
  trendLabel,
  colors,
}: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className={cn("absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20", colors.shape1)} />
        <div className={cn("absolute -bottom-4 -left-4 h-12 w-12 rounded-full opacity-15", colors.shape2)} />
        <div className={cn("absolute top-1/2 -right-3 h-10 w-10 -translate-y-1/2 rotate-12 rounded-lg opacity-10", colors.shape1)} />
        <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-30", colors.gradient)} />
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xl font-bold tracking-tight text-foreground leading-none">
            {value}
          </div>
          <div className="mt-0.5 text-xs font-medium text-muted-foreground truncate">{title}</div>
          <div className="mt-0.5 flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-500" />}
            <span className="text-[10px] text-muted-foreground/70 truncate">{helper}</span>
            {trendLabel && (
              <span className={cn("text-[10px] font-semibold", trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground")}>
                {trendLabel}
              </span>
            )}
          </div>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110", colors.iconBg, colors.iconText)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

// ─── Quick Module Card ────────────────────────────────────────────────────────
interface ModuleTileProps {
  title: string
  description: string
  icon: React.ElementType
  to: string
  color: string
  bg: string
}

function ModuleTile({ title, description, icon: Icon, to, color, bg }: ModuleTileProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border"
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110", bg, color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground leading-none">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground" />
    </Link>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
// Theme handled globally via index.css variables

export default function AdminDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const permissionCards = getPermissionSummary(user)
  const visibleModules = flattenAdminNavigationItems(
    getVisibleAdminNavigation(user)
  ).filter((item) => item.to !== "/admin/dashboard")

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => InvoiceApi.getInvoiceStats(),
  })

  const stats = statsResponse?.data

  const kpiCards: KpiCardProps[] = [
    {
      title: "Today's Revenue",
      value: isLoading
        ? "..."
        : `₹${Number(stats?.todays_sales ?? 0).toLocaleString("en-IN")}`,
      helper: isLoading ? "Loading..." : (stats?.todays_sales_trend ?? "0% vs yesterday"),
      icon: Receipt,
      trend: stats?.todays_sales_trend?.startsWith("+")
        ? "up"
        : stats?.todays_sales_trend?.startsWith("-")
        ? "down"
        : "neutral",
      colors: {
        shape1: "bg-blue-500",
        shape2: "bg-blue-400",
        iconBg: "bg-blue-500/15",
        iconText: "text-blue-500",
        gradient: "from-blue-500/5",
      },
    },
    {
      title: "Monthly Revenue",
      value: isLoading
        ? "..."
        : `₹${Number(stats?.monthly_sales_total ?? 0).toLocaleString("en-IN")}`,
      helper: isLoading ? "Loading..." : (stats?.monthly_sales_trend ?? "0% vs last month"),
      icon: TrendingUp,
      trend: stats?.monthly_sales_trend?.startsWith("+")
        ? "up"
        : stats?.monthly_sales_trend?.startsWith("-")
        ? "down"
        : "neutral",
      colors: {
        shape1: "bg-violet-500",
        shape2: "bg-purple-400",
        iconBg: "bg-violet-500/15",
        iconText: "text-violet-500",
        gradient: "from-violet-500/5",
      },
    },
    {
      title: "Total Invoices",
      value: isLoading
        ? "..."
        : Number(stats?.total_invoices ?? 0).toLocaleString("en-IN"),
      helper: isLoading ? "Loading..." : (stats?.total_invoices_trend ?? "0% vs yesterday"),
      icon: FileText,
      trend: stats?.total_invoices_trend?.startsWith("+")
        ? "up"
        : stats?.total_invoices_trend?.startsWith("-")
        ? "down"
        : "neutral",
      colors: {
        shape1: "bg-emerald-500",
        shape2: "bg-teal-400",
        iconBg: "bg-emerald-500/15",
        iconText: "text-emerald-500",
        gradient: "from-emerald-500/5",
      },
    },
    {
      title: "Low Stock Alerts",
      value: isLoading
        ? "..."
        : Number(stats?.low_stock_count ?? 0).toLocaleString("en-IN"),
      helper: isLoading ? "Loading..." : "Items to reorder",
      icon: AlertCircle,
      trend: (stats?.low_stock_count ?? 0) > 0 ? "down" : "up",
      trendLabel: (stats?.low_stock_count ?? 0) > 0 ? "Warning" : "Good",
      colors: {
        shape1: "bg-rose-500",
        shape2: "bg-orange-400",
        iconBg: "bg-rose-500/15",
        iconText: "text-rose-500",
        gradient: "from-rose-500/5",
      },
    },
  ]

  const quickModules: ModuleTileProps[] = [
    {
      title: "Invoices",
      description: "Transaction history",
      icon: FileText,
      to: "/admin/invoices",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Inventory",
      description: "Manage stock levels",
      icon: Package,
      to: "/admin/all-inventory",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Sales Returns",
      description: "Customer refunds",
      icon: RotateCcw,
      to: "/admin/returns",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      title: "Reports",
      description: "Daily transactions",
      icon: Receipt,
      to: "/admin/reports/daily-transaction-report",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="space-y-4">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5 shadow-sm transition-all duration-500 bg-card text-foreground border border-border/60">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/5" />
          <div className="absolute top-4 right-24 h-20 w-20 rounded-full bg-primary/5" />
          <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-primary/10" />
          <div className="absolute bottom-2 left-1/3 h-16 w-16 rotate-45 rounded-xl bg-primary/5" />
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1 text-primary">
              Tenant Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.role} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="rounded-xl backdrop-blur-sm border border-border bg-background/50 px-4 py-2 text-center shadow-sm">
              <div className="text-xl font-bold text-foreground">{visibleModules.length + 1}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Modules</div>
            </div>
            <div className="rounded-xl backdrop-blur-sm border border-border bg-background/50 px-4 py-2 text-center shadow-sm">
              <div className="text-xl font-bold text-foreground">{permissionCards.length}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Permissions</div>
            </div>
            <div className="rounded-xl backdrop-blur-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center shadow-sm">
              <div className="flex items-center gap-1 justify-center">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {isLoading ? "..." : stats?.monthly_sales_trend?.split(" ")[0] ?? "0%"}
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">Sales Trend</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────────── */}
      <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Monthly Sales"
          description="Total sales revenue across the workspace for the last 6 months"
          action={
            !isLoading && (
              <span className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                stats?.monthly_sales_trend?.startsWith("+")
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : stats?.monthly_sales_trend?.startsWith("-")
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
              )}>
                {stats?.monthly_sales_trend?.startsWith("+") && <TrendingUp className="h-3 w-3" />}
                {stats?.monthly_sales_trend?.startsWith("-") && <TrendingDown className="h-3 w-3" />}
                {stats?.monthly_sales_trend ?? "0% vs last month"}
              </span>
            )
          }
        >
          <DashboardAreaChart
            data={stats?.monthly_sales_chart ?? []}
            xKey="name"
            yKey="value"
            height={200}
            color="var(--primary)"
          />
        </ChartCard>

        <ChartCard
          title="Medicine Stock Levels"
          description="Highest stock levels by medicine"
        >
          <DashboardBarChart
            data={stats?.top_stock_medicines ?? []}
            xKey="name"
            yKey="value"
            height={200}
            color="var(--primary)"
          />
        </ChartCard>
      </div>

      {/* ── Quick Access + Activity ───────────────────────────────────────────── */}
      <div className="grid gap-2 lg:grid-cols-[1fr_1.1fr]">

        {/* Quick Access Modules */}
        <div className="rounded-xl border border-border/40 bg-card shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Quick Access</p>
              <p className="text-xs text-muted-foreground">Jump to key modules</p>
            </div>
            <LayoutGrid className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickModules.map((mod) => (
              <ModuleTile key={mod.to} {...mod} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border/40 bg-card shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Recent Activity</p>
              <p className="text-xs text-muted-foreground">Latest workspace events</p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            {recentActivity.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40"
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", item.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", item.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground/60 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-border/40 pt-2">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
              View all activity <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
