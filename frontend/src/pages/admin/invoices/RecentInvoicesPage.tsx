import { useCallback, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Eye,
  Printer,
  RotateCcw,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  ArrowUpRight,
  Download,
} from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import InvoiceApi, { type Invoice } from "@/services/invoiceApi"
import { StatusBadge } from "@/components/ui/badge-status"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  INITIAL_INVOICE_FILTERS,
  PAYMENT_MODE_OPTIONS,
  INVOICE_STATUS_OPTIONS,
} from "@/constants/page/admin/invoices"

export default function RecentInvoicesPage() {
  const queryClient = useQueryClient()
  const { filter, handleFilter } = useSearchFilter(INITIAL_INVOICE_FILTERS)

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: queryKeys.invoices.list(filter),
    queryFn: () => InvoiceApi.getInvoices(filter),
  })

  const { data: statsData } = useQuery({
    queryKey: queryKeys.invoices.stats(),
    queryFn: () => InvoiceApi.getInvoiceStats(),
    initialData: {
      data: {
        todays_sales: 14250.0,
        todays_sales_trend: "12% vs yesterday",
        total_invoices: 45,
        total_invoices_trend: "8% vs yesterday",
        avg_order_value: 316.5,
        avg_order_value_trend: "3% vs yesterday",
        refunds_issued: 120.0,
        refunds_issued_trend: "1 return today",
      },
    },
  })

  const stats = statsData.data

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`₹${stats.todays_sales.toLocaleString()}`}
          icon={<CreditCard className="size-5" />}
        />
        <StatCard
          title="Total Invoices"
          value={String(stats.total_invoices)}
          icon={<FileText className="size-5" />}
        />
        <StatCard
          title="Average Order Value"
          value={`₹${stats.avg_order_value.toFixed(2)}`}
          icon={<CreditCard className="size-5" />}
        />
        <StatCard
          title="Refunds Issued"
          value={`₹${stats.refunds_issued.toFixed(2)}`}
          icon={<RotateCcw className="size-5" />}
        />
      </div>

      <SectionCard
        title="Recent Invoices"
        description="View and manage all sales transactions and invoice history."
        action={
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" variant="outline">
              <Download className="mr-2 size-4" />
              Export Data
            </Button>
          </div>
        }
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
                { label: "All Payment Modes", value: "all" },
                ...PAYMENT_MODE_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[
                { label: "All Status", value: "all" },
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
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No invoices found"
            emptyDescription="Create a new sale or adjust your filters."
          />
        </div>
      </SectionCard>
    </div>
  )
}
