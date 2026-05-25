import { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { useQuery } from "@tanstack/react-query"
import { ShieldCheck, LayoutGrid, Building2, Activity, Eye, Printer, FileDown, Calendar as CalendarIcon, RotateCcw, Package } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/context/authContext"
import { StatCard } from "@/components/stat-card"
import SectionCard from "@/components/SectionCard"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/badge-status"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/queryKeys"
import InventoryApi, { type ExpiryReportItem } from "@/services/inventoryApi"
import { INITIAL_EXPIRY_FILTERS, EXPIRY_STATUS_OPTIONS } from "@/constants/page/admin/expiry"
import useSearchFilter from "@/hooks/useSearchFilter"

const MONTH_YEAR_PATTERN = /^(0[1-9]|1[0-2])\/(\d{4})$/

const formatDate = (value?: string | null) => {
  if (!value) return "-"

  const trimmed = value.trim()
  const monthYearMatch = trimmed.match(MONTH_YEAR_PATTERN)
  if (monthYearMatch) return `${monthYearMatch[1]}/${monthYearMatch[2]}`

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return value

  return format(parsed, "dd MMM yyyy")
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

const fallbackStats = {
  alreadyExpired: 0,
  expiring30: 0,
  expiring90: 0,
  valueAtRisk: 0,
}

export default function ExpiryReports() {
  const { user } = useAuth()
  const { filter, handleFilter } = useSearchFilter(INITIAL_EXPIRY_FILTERS)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const reportFilters = useMemo(
    () => ({
      ...filter,
      from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }),
    [dateRange, filter]
  )

  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: queryKeys.inventory.expiryReport(reportFilters),
    queryFn: () => InventoryApi.getExpiryReport(reportFilters),
  })

  if (!user) return null

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

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range)
      handleFilter({ page: 1 })
    },
    [handleFilter]
  )

  const reportRows = reportData?.data ?? []
  const expiryStats = reportData?.stats ?? fallbackStats

  const columns: DataTableColumn<ExpiryReportItem>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: "#",
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
              <div className="font-bold text-primary">{row.productName}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">
                {row.saltComposition || "-"}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground/70">
                <span>{row.manufacturer?.name || "-"}</span>
                <span className="text-muted-foreground/40">|</span>
                <span>{row.category?.name || "-"}</span>
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
            <div className="font-semibold">{row.batchNo}</div>
            <div className="text-[11px] text-muted-foreground">
              {row.unit || "Units"}
            </div>
          </div>
        ),
      },
      {
        key: "expiry_timeline",
        header: "EXPIRY TIMELINE",
        render: (row) => {
          const remainingDays = row.remainingDays
          const isExpired = remainingDays !== null && remainingDays <= 0
          const isSoon = remainingDays !== null && remainingDays > 0 && remainingDays <= 30
          const progress =
            remainingDays === null
              ? 0
              : isExpired
                ? 100
                : Math.max(0, Math.min(100, ((90 - remainingDays) / 90) * 100))

          return (
            <div className="w-full max-w-[170px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span
                  className={cn(
                    isExpired && "text-red-500",
                    isSoon && "text-amber-500",
                    !isExpired && !isSoon && "text-emerald-600"
                  )}
                >
                  {remainingDays === null
                    ? "-"
                    : isExpired
                      ? "Expired"
                      : `${remainingDays} days left`}
                </span>
                <span className="text-muted-foreground/60">
                  {formatDate(row.expiryDate || row.expiry)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isExpired
                      ? "bg-red-500"
                      : isSoon
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  )}
                  style={{ width: `${progress}%` }}
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
            <div className="font-bold">{row.stockQty}</div>
            <div className="text-[11px] text-muted-foreground">
              {row.unit || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "value",
        header: "VALUE (₹)",
        render: (row) => (
          <span className="font-bold">{formatCurrency(row.value)}</span>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => (
          <StatusBadge
            status={row.statusLabel || row.status}
            className={cn(
              "px-3 py-1 font-bold",
              row.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-600",
              row.status === "EXPIRING_SOON" &&
                "bg-amber-500/10 text-amber-600",
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
              title={`View ${row.productName}`}
              onClick={() => toast.info("Batch detail view is not wired yet")}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              title="Reconcile"
              onClick={() =>
                toast.info("Expiry reconciliation is not wired yet")
              }
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        ),
      },
    ]
  }, [filter.page, filter.perPage])

  const handleExportCSV = useCallback(async () => {
    try {
      const exportResponse = await InventoryApi.getExpiryReport({
        ...reportFilters,
        page: 1,
        limit: 1000,
      })

      if (!exportResponse.data.length) {
        toast.error("No data available to export")
        return
      }

      const headers = [
        "Product Name",
        "Salt Composition",
        "Manufacturer",
        "Category",
        "Batch No",
        "Expiry Date",
        "Remaining Days",
        "Stock Qty",
        "Unit",
        "Value",
        "Status",
      ]

      const rows = exportResponse.data.map((row) => [
        `"${row.productName}"`,
        `"${row.saltComposition || ""}"`,
        `"${row.manufacturer?.name || ""}"`,
        `"${row.category?.name || ""}"`,
        `"${row.batchNo}"`,
        `"${row.expiryDate || row.expiry || ""}"`,
        row.remainingDays ?? "",
        row.stockQty,
        `"${row.unit || ""}"`,
        row.value,
        `"${row.statusLabel || row.status}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      )

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `expiry_report_${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Report exported successfully")
    } catch (_error) {
      toast.error("Failed to export the report")
    }
  }, [reportFilters])

  const selectedDateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "All expiry dates"

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Inventory Expiry Report
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Live inventory batch report driven by the backend inventory batch
            records.
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
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 size-4" />
            Print Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Already Expired"
          value={String(expiryStats.alreadyExpired)}
          helper="Requires immediate disposal"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Expiring < 30 Days"
          value={String(expiryStats.expiring30)}
          helper="Needs attention soon"
          icon={<LayoutGrid className="h-4 w-4" />}
        />
        <StatCard
          title="Expiring < 90 Days"
          value={String(expiryStats.expiring90)}
          helper="Plan for clearance"
          icon={<Building2 className="h-4 w-4" />}
          valueClassName="capitalize text-2xl"
        />
        <StatCard
          title="Value at Risk"
          value={`₹${(expiryStats.valueAtRisk / 1000).toFixed(1)}k`}
          helper="Total value of flagged stock"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <SectionCard
        title="Risk Inventory Register"
        description="Monitor stock that is at risk of expiry. Filter by expiry status and date range."
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterBar
              values={{
                search: filter.search || "",
                status: filter.status || "all",
              }}
              onChange={handleFilterChange}
            >
              <FilterBar.Search
                name="search"
                className="w-[30%]"
                placeholder="Search medicine, batch, category..."
              />
              <FilterBar.Select
                name="status"
                placeholder="All Status"
                options={EXPIRY_STATUS_OPTIONS}
              />
            </FilterBar>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 min-w-[240px] justify-start border-input bg-background text-left font-normal"
                >
                  <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">
                    {selectedDateLabel}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Filter by expiry date
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pick a date range to narrow the report.
                  </p>
                </div>
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  initialFocus
                />
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(undefined)}
                  >
                    Clear range
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {selectedDateLabel}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <DataTable
            columns={columns}
            data={reportRows}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={reportData?.meta?.totalPages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={reportData?.meta?.total || 0}
            isLoading={isLoadingReport}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            emptyTitle="No expiring items found"
            emptyDescription="Try expanding the date range or clearing the search filters."
          />
        </div>
      </SectionCard>
    </div>
  )
}
