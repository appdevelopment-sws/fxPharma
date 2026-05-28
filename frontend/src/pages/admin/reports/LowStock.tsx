import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ShieldCheck, LayoutGrid, Building2, Eye, Printer, FileDown, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { useAuth } from "@/context/authContext"
import { StatCard } from "@/components/stat-card"
import SectionCard from "@/components/SectionCard"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/badge-status"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/queryKeys"
import InventoryApi, { type InventoryItem } from "@/services/inventoryApi"
import useSearchFilter from "@/hooks/useSearchFilter"

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

const fallbackStats = {
  totalLowStock: 0,
  outOfStock: 0,
  nearReorder: 0,
}

const INITIAL_LOW_STOCK_FILTERS = {
  page: 1,
  limit: 10,
  search: "",
}

export default function LowStock() {
  const { user } = useAuth()
  const { filter, handleFilter } = useSearchFilter(INITIAL_LOW_STOCK_FILTERS)

  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: queryKeys.inventory.lowStockReport(filter),
    queryFn: () => InventoryApi.getLowStockReport(filter),
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

  const reportRows = reportData?.data ?? []
  const stats = reportData?.stats ?? fallbackStats

  const columns: DataTableColumn<InventoryItem>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.limit || 10
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
              <div className="font-bold text-primary">{row.name}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">
                {row.saltComposition || "-"}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground/70">
                <span>
                  {(typeof row.manufacturer === "object"
                    ? row.manufacturer?.name
                    : row.manufacturer) || "-"}
                </span>
                <span className="text-muted-foreground/40">|</span>
                <span>
                  {(typeof row.category === "object"
                    ? row.category?.name
                    : row.category) || "-"}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "min_qty",
        header: "MIN THRESHOLD",
        render: (row) => (
          <span className="font-semibold text-muted-foreground">
            {row.minQty || 10} Units
          </span>
        ),
      },
      {
        key: "available_stock",
        header: "AVAILABLE STOCK",
        render: (row) => {
          const stock = row.availableStock ?? 0
          const isOutOfStock = stock === 0
          return (
            <span
              className={cn(
                "font-bold",
                isOutOfStock ? "text-red-500" : "text-amber-500"
              )}
            >
              {stock} Units
            </span>
          )
        },
      },
      {
        key: "reorder_qty",
        header: "REORDER QTY",
        render: (row) => <span>{row.reorderQty || "-"}</span>,
      },
      {
        key: "value",
        header: "EST. VALUE (₹)",
        render: (row) => {
          const rate = Number(row.purchaseRate || row.mrp || 0)
          const stock = row.availableStock ?? 0
          return <span className="font-bold">{formatCurrency(rate * stock)}</span>
        },
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => {
          const stock = row.availableStock ?? 0
          const isOutOfStock = stock === 0
          return (
            <StatusBadge
              status={isOutOfStock ? "OUT_OF_STOCK" : "LOW_STOCK"}
              className={cn(
                "px-3 py-1 font-bold",
                isOutOfStock
                  ? "bg-red-500/10 text-red-600"
                  : "bg-amber-500/10 text-amber-600"
              )}
            />
          )
        },
      },
    ]
  }, [filter.page, filter.limit])

  const handleExportCSV = useCallback(async () => {
    try {
      const exportResponse = await InventoryApi.getLowStockReport({
        ...filter,
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
        "Min Threshold",
        "Available Stock",
        "Reorder Qty",
        "Purchase Rate",
        "MRP",
        "Status",
      ]

      const rows = exportResponse.data.map((row) => [
        `"${row.name}"`,
        `"${row.saltComposition || ""}"`,
        `"${typeof row.manufacturer === "object" ? row.manufacturer?.name : row.manufacturer || ""}"`,
        `"${typeof row.category === "object" ? row.category?.name : row.category || ""}"`,
        row.minQty || 10,
        row.availableStock ?? 0,
        row.reorderQty || 0,
        row.purchaseRate || 0,
        row.mrp || 0,
        (row.availableStock ?? 0) === 0 ? "Out of Stock" : "Low Stock",
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      )

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `low_stock_report_${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Report exported successfully")
    } catch (_error) {
      toast.error("Failed to export the report")
    }
  }, [filter])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Low Stock Report
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Live inventory items that are running below minimum safety threshold.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Low Stock Items"
          value={String(stats.totalLowStock)}
          helper="Requires procurement review"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Out of Stock"
          value={String(stats.outOfStock)}
          helper="Immediate reorder needed"
          icon={<ShieldCheck className="h-4 w-4 text-red-500" />}
        />
        <StatCard
          title="Critical Reorder Levels"
          value={String(stats.nearReorder)}
          helper="Stock below 50% of threshold"
          icon={<Building2 className="h-4 w-4 text-amber-600" />}
          valueClassName="capitalize text-2xl"
        />
      </div>

      <SectionCard
        title="Low Stock Inventory Register"
        description="Monitor stock items currently running below their minimum reorder levels."
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterBar
              values={{
                search: filter.search || "",
              }}
              onChange={handleFilterChange}
            >
              <FilterBar.Search
                name="search"
                className="w-[30%]"
                placeholder="Search medicine, salt, manufacturer..."
              />
            </FilterBar>
          </div>

          <DataTable
            columns={columns}
            data={reportRows}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={reportData?.meta?.totalPages || 1}
            pageSize={filter.limit || 10}
            totalRecords={reportData?.meta?.total || 0}
            isLoading={isLoadingReport}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            emptyTitle="No low stock items found"
            emptyDescription="All products are well stocked above their thresholds."
          />
        </div>
      </SectionCard>
    </div>
  )
}
