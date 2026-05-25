import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Eye,
  Printer,
  CheckCircle2,
  RotateCcw,
  Package,
  CreditCard,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import ProcessReturnDrawer from "@/components/dialog/ProcessReturnDrawer"
import ReturnInvoiceSearchDrawer from "@/components/dialog/ReturnInvoiceSearchDrawer"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ReturnApi, { type SalesReturn } from "@/services/returnApi"
import { StatusBadge } from "@/components/ui/badge-status"
import { cn } from "@/lib/utils"

import {
  INITIAL_RETURN_FILTERS,
  RETURN_COLUMNS,
  RETURN_REASON_OPTIONS,
  RETURN_STATUS_OPTIONS,
} from "@/constants/page/admin/returns"
import { StatCard } from "@/components/stat-card"

export default function ReturnsPage() {
  const queryClient = useQueryClient()
  const returnDrawer = useDisclosure()
  const processReturnDrawer = useDisclosure<string>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_RETURN_FILTERS)

  const { data: returnsData, isLoading: isLoadingReturns } = useQuery({
    queryKey: queryKeys.returns.list(filter),
    queryFn: () => ReturnApi.getReturns(filter),
  })

  const { data: statsData } = useQuery({
    queryKey: queryKeys.returns.stats(),
    queryFn: () => ReturnApi.getReturnStats(),
    staleTime: 0,
    initialData: {
      data: {
        total_refunded: 845.0,
        total_refunded_trend: "4% vs yesterday",
        returns_processed: 6,
        returns_processed_trend: "+2 from yesterday",
        items_restocked: 14,
        items_restocked_trend: "Added to inventory",
        pending_refunds: 120.0,
        pending_refunds_count: 1,
      },
    },
  })

  const stats = statsData.data

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "REFUNDED" }) =>
      ReturnApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      toast.success("Return status updated")
    },
    onError: (error: unknown) => {
      const errMsg =
        (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message === "string" &&
          (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message) ||
        (error instanceof Error ? error.message : null) ||
        "Failed to update return status"
      toast.error(errMsg)
    },
  })

  const handleFilterChange = useCallback(
    (updates: Record<string, unknown>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<SalesReturn>[] = [
    {
      key: "serial",
      header: RETURN_COLUMNS.find((c) => c.key === "serial")?.label || "#",
      render: (_, index) => {
        const currentPage = filter.page || 1
        const perPage = filter.perPage || 10
        return (currentPage - 1) * perPage + index + 1
      },
    },
    {
      key: "return_id",
      header: "RETURN ID",
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold">{row.return_id}</div>
          <div className="text-xs text-muted-foreground">{row.createdAt}</div>
        </div>
      ),
    },
    {
      key: "original_invoice",
      header: "ORIGINAL INVOICE",
      render: (row) => (
        <span className="cursor-pointer font-bold text-primary hover:underline">
          {row.original_invoice}
        </span>
      ),
    },
    {
      key: "customer_info",
      header: "CUSTOMER INFO",
      render: (row) => (
        <div className="space-y-0.5 text-sm">
          <div className="font-semibold">{row.customer_name}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="flex size-3.5 items-center justify-center">📞</span>
            {row.customer_phone}
          </div>
        </div>
      ),
    },
    {
      key: "return_value",
      header: "RETURN VALUE",
      render: (row) => (
        <span className="font-bold text-destructive">
          -₹{row.return_value.toFixed(2)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "REASON",
      render: (row) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 opacity-70">⚠️</span>
          {RETURN_REASON_OPTIONS.find((r) => r.value === row.reason)?.label ||
            row.reason}
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
            row.status === "REFUNDED" && "bg-emerald-500/10 text-emerald-600",
            row.status === "PENDING" && "bg-amber-500/10 text-amber-600",
            row.status === "REJECTED" && "bg-red-500/10 text-red-600"
          )}
        />
      ),
    },
    {
      key: "action",
      header: "ACTIONS",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "PENDING" && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                updateStatusMutation.mutate({ id: row.id, status: "REFUNDED" })
              }
              disabled={updateStatusMutation.isPending}
              className="text-primary hover:bg-primary/10"
            >
              <CheckCircle2 className="size-4" />
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-4" />
          </Button>
          {row.status === "REFUNDED" && (
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Printer className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Refunded"
          value={`₹${stats.total_refunded.toFixed(2)}`}
          icon={<CreditCard className="size-5" />}
        />
        <StatCard
          title="Returns Processed"
          value={String(stats.returns_processed)}
          icon={<RotateCcw className="size-5" />}
        />
        <StatCard
          title="Items Restocked"
          value={String(stats.items_restocked)}
          icon={<Package className="size-5" />}
        />
        <StatCard
          title="Pending Refunds"
          value={`₹${stats.pending_refunds.toFixed(2)}`}
          icon={<Clock className="size-5" />}
        />
      </div>

      <ReturnInvoiceSearchDrawer
        open={returnDrawer.isOpen}
        onClose={returnDrawer.onClose}
        onSelectInvoice={(invoiceId) => processReturnDrawer.onOpen(invoiceId)}
      />

      <ProcessReturnDrawer
        open={processReturnDrawer.isOpen}
        onClose={processReturnDrawer.onClose}
        invoiceId={processReturnDrawer.data ?? null}
      />

      <SectionCard
        title="Sales Returns"
        description="Manage customer returns, restock inventory, and process refunds."
        action={
          <Button onClick={returnDrawer.onOpen}>
            <Plus className="mr-2 size-4" />
            Process New Return
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              reason: filter.reason || "all",
              status: filter.status || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search Return ID, Invoice # or Customer..."
            />
            <FilterBar.Select
              name="reason"
              placeholder="All Reasons"
              options={[

                ...RETURN_REASON_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[

                ...RETURN_STATUS_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={returnsData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={returnsData?.meta?.pages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={returnsData?.meta?.total || 0}
            isLoading={isLoadingReturns}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No sales returns found"
            emptyDescription="Process a new return or adjust your filters."
          />
        </div>
      </SectionCard>
    </div>
  )
}
