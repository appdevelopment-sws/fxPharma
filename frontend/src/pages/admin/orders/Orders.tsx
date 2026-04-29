import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirmDialog"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"

import { queryKeys } from "@/lib/queryKeys"
import { ORDER_COLUMNS } from "@/constants/page/admin/order"
import { INITIAL_ORDER_FILTERS } from "@/constants/page/admin/order"
import OrderDialog from "@/components/dialog/admin/orderDialog"

const Orders = () => {
  const queryClient = useQueryClient()

  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_ORDER_FILTERS)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.list(filter),
    // queryFn: () => OrderApi.getOrders(filter),
  })

  const deleteMutation = useMutation({
    // mutationFn: (id: number) => OrderApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      deleteDisclosure.onClose()
      toast.success("Order deleted successfully")
    },
  })

  const handleOpen = (
    order: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      order ? { ...order, viewMode: mode === "view" } : null
    )
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<any>[] = useMemo(() => {
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
        key: "product",
        header:
          ORDER_COLUMNS.find((c) => c.key === "product")?.label ||
          "Product Details",
        render: (row) => (
          <div>
            <p className="font-medium">{row.product_name}</p>
            <p className="text-xs text-muted-foreground">{row.company_name}</p>
          </div>
        ),
      },

      {
        key: "qty",
        header: ORDER_COLUMNS.find((c) => c.key === "qty")?.label || "Qty",
        accessor: "quantity",
      },

      {
        key: "free",
        header: ORDER_COLUMNS.find((c) => c.key === "free")?.label || "Free",
        accessor: "free",
      },

      {
        key: "batch",
        header: ORDER_COLUMNS.find((c) => c.key === "batch")?.label || "Batch",
        accessor: "batch_no",
      },

      {
        key: "expiry",
        header:
          ORDER_COLUMNS.find((c) => c.key === "expiry")?.label || "Expiry",
        accessor: "expiry",
      },

      {
        key: "purchase",
        header:
          ORDER_COLUMNS.find((c) => c.key === "purchase")?.label || "Purchase",
        accessor: "purchase_price",
      },

      {
        key: "mrp",
        header: ORDER_COLUMNS.find((c) => c.key === "mrp")?.label || "MRP",
        accessor: "mrp",
      },

      {
        key: "rate1",
        header: ORDER_COLUMNS.find((c) => c.key === "rate1")?.label || "Rate 1",
        accessor: "rate1",
      },

      {
        key: "rate2",
        header: ORDER_COLUMNS.find((c) => c.key === "rate2")?.label || "Rate 2",
        accessor: "rate2",
      },

      {
        key: "rate3",
        header: ORDER_COLUMNS.find((c) => c.key === "rate3")?.label || "Rate 3",
        accessor: "rate3",
      },

      {
        key: "action",
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row, "view")}
            >
              <Eye className="size-4" />
            </Button>

            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row, "edit")}
            >
              <Pencil className="size-4" />
            </Button>

            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => deleteDisclosure.onOpen(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ]
  }, [filter.page, filter.perPage])

  return (
    <div className="space-y-6">
      <OrderDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        order={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Order"
        description={`Delete this order?`}
        onConfirm={() => deleteMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteMutation.isPending}
        confirmText="delete"
        variant="danger"
      />

      <SectionCard
        title="Orders"
        description="Manage received items"
        action={
          <Button onClick={() => handleOpen()}>
            <Plus className="mr-2 size-4" />
            Add Order
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{ search: filter.search || "" }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              placeholder="Search orders..."
              className="w-[300px]"
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={data?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={data?.meta?.pages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={data?.meta?.total || 0}
            isLoading={isLoading}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
          />
        </div>
      </SectionCard>
    </div>
  )
}

export default Orders
