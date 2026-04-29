import { useCallback, useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { useQuery } from "@tanstack/react-query"
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
import { ShieldCheck, LayoutGrid, Building2, Activity, Plus, Eye, Printer, CheckCircle2, Calendar as CalendarIcon, FileDown, ChevronDown, Download, Banknote, QrCode, FileText, RotateCcw, CreditCard, ShoppingCart, Package } from "lucide-react"
import SectionCard from "@/components/SectionCard"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { INITIAL_RETURN_FILTERS, RETURN_REASON_OPTIONS, RETURN_STATUS_OPTIONS } from "@/constants/page/admin/returns"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ReturnApi, { type SalesReturn } from "@/services/returnApi"
import InvoiceApi from "@/services/invoiceApi"
import ProcessReturnDrawer from "@/components/dialog/ProcessReturnDrawer"
import { StatusBadge } from "@/components/ui/badge-status"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import {
  INITIAL_EXPIRY_FILTERS,
  EXPIRY_STATUS_OPTIONS,
  SUPPLIER_OPTIONS,
  CATEGORY_OPTIONS,
  EXPIRY_COLUMNS
} from "@/constants/page/admin/expiry"

// Mock data for expiry report
const MOCK_EXPIRY_DATA = [
  {
    id: "1",
    name: "Amoxicillin 500mg",
    salt: "Amoxicillin Trihydrate",
    batch_no: "AMX-2023-001",
    expiry_date: "2023-12-15",
    remaining_days: -15,
    stock_qty: 450,
    unit: "Strips",
    value: 12500.0,
    status: "EXPIRED"
  },
  {
    id: "2",
    name: "Vitamin C 1000mg",
    salt: "Ascorbic Acid",
    batch_no: "VIT-2024-042",
    expiry_date: "2024-05-10",
    remaining_days: 12,
    stock_qty: 120,
    unit: "Bottles",
    value: 8400.0,
    status: "EXPIRING_SOON"
  },
  {
    id: "3",
    name: "Paracetamol 650mg",
    salt: "Paracetamol",
    batch_no: "PAR-2024-088",
    expiry_date: "2024-06-25",
    remaining_days: 58,
    stock_qty: 2500,
    unit: "Tablets",
    value: 5000.0,
    status: "ACTIVE"
  },
  {
    id: "4",
    name: "Augmentin 625 Duo",
    salt: "Amoxicillin + Clavulanic Acid",
    batch_no: "AUG-2024-112",
    expiry_date: "2024-05-01",
    remaining_days: 2,
    stock_qty: 85,
    unit: "Strips",
    value: 18500.0,
    status: "EXPIRING_SOON"
  }
]

type ExpiryItem = typeof MOCK_EXPIRY_DATA[0]

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
  { name: "Sales", value: 45 },
  { name: "Purchase", value: 20 },
  { name: "Returns", value: 80 },
  { name: "Purchase Returns", value: 65 },
]

export default function DailyTransactionReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { user } = useAuth()
  const returnDrawer = useDisclosure()
  const { filter, handleFilter } = useSearchFilter(INITIAL_EXPIRY_FILTERS)

  // In a real app, this would be a query to the expiry API
  const isLoadingExpiry = false
  const expiryData = {
    data: MOCK_EXPIRY_DATA,
    meta: {
      total: MOCK_EXPIRY_DATA.length,
      page: 1,
      pages: 1
    }
  }

  const expiryStats = {
    already_expired: 12,
    expiring_30: 32,
    expiring_90: 121,
    value_at_risk: 42500.0
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<ExpiryItem>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header:
          EXPIRY_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "product_details",
        header: "PRODUCT DETAILS",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <Package className="size-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-primary">
                {row.name}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {row.salt}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "batch_info",
        header: "BATCH INFO",
        render: (row) => (
          <div className="space-y-0.5 text-sm">
            <div className="font-semibold">{row.batch_no}</div>
          </div>
        ),
      },
      {
        key: "expiry_timeline",
        header: "EXPIRY TIMELINE",
        render: (row) => {
          const isExpired = row.remaining_days <= 0
          const progress = Math.max(0, Math.min(100, (row.remaining_days / 180) * 100))

          return (
            <div className="w-full max-w-[150px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className={cn(isExpired ? "text-red-500" : "text-muted-foreground")}>
                  {isExpired ? "Expired" : `${row.remaining_days} days left`}
                </span>
                <span className="text-muted-foreground/60">{row.expiry_date}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isExpired ? "bg-red-500" : row.remaining_days < 30 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: isExpired ? "100%" : `${progress}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        key: "stock_level",
        header: "STOCK LEVEL",
        render: (row) => (
          <div className="space-y-0.5 text-sm">
            <div className="font-bold">{row.stock_qty}</div>
            <div className="text-[11px] text-muted-foreground">{row.unit}</div>
          </div>
        ),
      },
      {
        key: "value",
        header: "VALUE (₹)",
        render: (row) => (
          <span className="font-bold">₹{row.value.toLocaleString()}</span>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => (
          <StatusBadge
            status={row.status}
            className={cn(
              "px-3 py-1 font-bold",
              row.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-600",
              row.status === "EXPIRING_SOON" && "bg-amber-500/10 text-amber-600",
              row.status === "EXPIRED" && "bg-red-500/10 text-red-600"
            )}
          />
        ),
      },
      {
        key: "action",
        header: "ACTIONS",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        ),
      },
    ]
  }, [])

  if (!user) return null

  const permissionCards = getPermissionSummary(user)
  const visibleModules = flattenAdminNavigationItems(
    getVisibleAdminNavigation(user)
  ).filter((item) => item.to !== "/admin/dashboard")

  const handleExportCSV = () => {
    if (!expiryData?.data?.length) {
      toast.error("No data available to export")
      return
    }

    const headers = ["Product Name", "Salt", "Batch No", "Expiry Date", "Stock Qty", "Unit", "Value", "Status"]
    const rows = expiryData.data.map(row => [
      `"${row.name}"`,
      `"${row.salt}"`,
      `"${row.batch_no}"`,
      `"${row.expiry_date}"`,
      row.stock_qty,
      `"${row.unit}"`,
      row.value,
      `"${row.status}"`
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `expiry_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Report exported successfully")
  }

  return (

    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Inventory Expiry Report
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Monitor and manage expiring and expired medicines across all branches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 rounded-lg border-border/60 bg-background/50 px-4 font-medium transition-all hover:bg-background hover:ring-1 hover:ring-primary/20"
          >
            <FileDown className="mr-2 size-4 text-muted-foreground" />
            Export CSV
          </Button>
          <Button >
            <Printer className="mr-2 size-4" />
            Print Report
          </Button>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Already Expired"
          value={String(expiryStats.already_expired)}
          helper="Requires immediate disposal"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Expiring < 30 Days"
          value={String(expiryStats.expiring_30)}
          helper="Needs attention soon"
          icon={<LayoutGrid className="h-4 w-4" />}
        />
        <StatCard
          title="Expiring < 90 Days"
          value={String(expiryStats.expiring_90)}
          helper="Plan for clearance"
          icon={<Building2 className="h-4 w-4" />}
          valueClassName="capitalize text-2xl"
        />
        <StatCard
          title="Value at Risk"
          value={`₹${(expiryStats.value_at_risk / 1000).toFixed(1)}k`}
          helper="Total value of flagged items"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <ProcessReturnDrawer
        open={returnDrawer.isOpen}
        onClose={returnDrawer.onClose}
      />

      <SectionCard
        title="Risk Inventory Register"
        description="Monitor stock that is at risk of expiry. Filter by date range and batch status."
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              category: filter.category || "all",
              supplier: filter.supplier || "all",
              status: filter.status || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search Inventory..."
            />
            <FilterBar.Select
              name="category"
              placeholder="All Categories"
              options={[
                { label: "All Categories", value: "all" },
                ...CATEGORY_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="supplier"
              placeholder="All Suppliers"
              options={[
                { label: "All Suppliers", value: "all" },
                ...SUPPLIER_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[
                { label: "All Status", value: "all" },
                ...EXPIRY_STATUS_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={expiryData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={expiryData?.meta?.pages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={expiryData?.meta?.total || 0}
            isLoading={isLoadingExpiry}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No expiring items found"
            emptyDescription="Your inventory looks healthy."
          />
        </div>
      </SectionCard>

    </div>
  )
}

