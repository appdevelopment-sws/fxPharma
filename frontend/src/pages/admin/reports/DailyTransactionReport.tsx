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
import { INITIAL_INVOICE_FILTERS, INVOICE_STATUS_OPTIONS, PAYMENT_MODE_OPTIONS } from "@/constants/page/admin/invoices"
import { type Invoice } from "@/services/invoiceApi"

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
  const { filter, handleFilter } = useSearchFilter(INITIAL_INVOICE_FILTERS)

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: queryKeys.invoices.list({ ...filter, ...date }),
    queryFn: () => InvoiceApi.getInvoices({
      ...filter,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
    }),
  })

  const { data: statsData } = useQuery({
    queryKey: queryKeys.invoices.stats(),
    queryFn: () => InvoiceApi.getInvoiceStats(),
  })

  const invoiceStats = statsData?.data

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )
  const handlePageChange = useCallback(
    (page: number) => {
      handleFilter({ page })
    },
    [handleFilter]
  )

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      handleFilter({ limit, page: 1 })
    },
    [handleFilter]
  )


  const columns: DataTableColumn<Invoice>[] = useMemo(() => {
    return [
      {
        key: "invoice_details",
        header: "INVOICE DETAILS",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div className="space-y-0.5">
              <div className="cursor-pointer font-bold text-primary hover:underline">
                {row.invoice_id}
              </div>
              <div className="text-xs text-muted-foreground">
                {row.createdAt}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "customer_info",
        header: "CUSTOMER INFO",
        render: (row) => (
          <div className="space-y-0.5 text-sm">
            <div className="font-semibold">{row.customer_name}</div>
            <div className="text-xs text-muted-foreground">
              {row.customer_phone || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "items",
        header: "ITEMS",
        render: (row) => (
          <Badge
            variant="secondary"
            className="border-none bg-muted/50 font-medium text-muted-foreground"
          >
            {row.item_count} Items
          </Badge>
        ),
      },
      {
        key: "total_amount",
        header: "TOTAL AMOUNT",
        render: (row) => (
          <span className="font-bold">₹{row.total_amount.toFixed(2)}</span>
        ),
      },
      {
        key: "payment_mode",
        header: "PAYMENT MODE",
        render: (row) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            {row.payment_mode === "CASH" && <Banknote className="size-4" />}
            {row.payment_mode === "UPI" && <QrCode className="size-4" />}
            {row.payment_mode === "CARD" && <CreditCard className="size-4" />}
            <span className="capitalize">{row.payment_mode.toLowerCase()}</span>
          </div>
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
              row.status === "PAID" && "bg-emerald-500/10 text-emerald-600",
              row.status === "REFUNDED" && "bg-red-500/10 text-red-600"
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
              <Printer className="size-4" />
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
    if (!invoicesData?.data?.length) {
      toast.error("No data available to export")
      return
    }

    const headers = ["Invoice ID", "Customer Name", "Customer Phone", "Item Count", "Total Amount", "Payment Mode", "Status", "Date"]
    const rows = invoicesData.data.map(row => [
      `"${row.invoice_id}"`,
      `"${row.customer_name}"`,
      `"${row.customer_phone || ""}"`,
      row.item_count,
      row.total_amount,
      `"${row.payment_mode}"`,
      `"${row.status}"`,
      `"${row.createdAt}"`
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `invoice_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
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
            All Transaction Report
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {user?.name} • {user.role}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-lg border-border/60 bg-background/50 px-4 font-medium transition-all hover:bg-background hover:ring-1 hover:ring-primary/20"
              >
                <CalendarIcon className="mr-2 size-4 text-primary" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDown className="ml-2 size-4 opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
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
          title="Total Sales(In)"
          value={invoiceStats ? `₹${invoiceStats.todays_sales.toFixed(2)}` : "₹0.00"}
          helper={invoiceStats?.todays_sales_trend || "No trend data"}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Total Purchases(Out)"
          value="₹0.00"
          helper="Decrease 5% vs Last Month"
          icon={<LayoutGrid className="h-4 w-4" />}
        />
        <StatCard
          title="Net Income"
          value={invoiceStats ? `₹${(invoiceStats.todays_sales - invoiceStats.refunds_issued).toFixed(2)}` : "₹0.00"}
          helper="+10% vs Last Month"
          icon={<Building2 className="h-4 w-4" />}
          valueClassName="capitalize text-2xl"
        />
        <StatCard
          title="Total Transactions"
          value={invoiceStats?.total_invoices || 0}
          helper={invoiceStats?.total_invoices_trend || "No trend data"}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Monthly Activity Overview"
          description="A summary of actions taken this month."
        >
          <DashboardLineChart data={activityData} xKey="name" yKey="value" />
        </ChartCard>

        <ChartCard
          title="Transaction Breakup"
          description="Distribution of transactions across different types."
        >
          <div className="space-y-6 pt-2">
            {[
              { label: "Sales", value: 68, color: "bg-emerald-500", icon: <ShoppingCart className="size-4" />, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
              { label: "Purchases", value: 25, color: "bg-amber-500", icon: <Package className="size-4" />, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
              { label: "Returns", value: 7, color: "bg-red-500", icon: <RotateCcw className="size-4" />, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-9 items-center justify-center rounded-lg", item.iconBg, item.iconColor)}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-foreground/80">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
                <div className="relative h-1 w-full rounded-full bg-muted/40">
                  <div
                    className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000", item.color)}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ProcessReturnDrawer
        open={returnDrawer.isOpen}
        onClose={returnDrawer.onClose}
      />



      <SectionCard
        title="All Transactions Report"
        description="All Transactions List and Details."


      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              payment_mode: filter.payment_mode || "all",
              status: filter.status || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search by Invoice #, Customer Name or Phone..."
            />
            <FilterBar.Select
              name="payment_mode"
              placeholder="All Payment Modes"
              options={[

                ...PAYMENT_MODE_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[

                ...INVOICE_STATUS_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={invoicesData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={invoicesData?.meta?.pages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={invoicesData?.meta?.total || 0}
            isLoading={isLoadingInvoices}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}

            emptyTitle="No invoices found"
            emptyDescription="Create a new sale or adjust your filters."
          />
        </div>
      </SectionCard>

    </div>
  )
}

