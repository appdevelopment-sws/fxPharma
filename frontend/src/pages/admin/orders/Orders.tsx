import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  Share,
  Check,
  CheckLine,
  CheckCheck,
} from "lucide-react"
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
import { ordersApi } from "@/services/ordersApi"
import OrderDialog from "@/components/dialog/admin/orderDialog"
import { StatusBadge } from "@/components/ui/badge-status"
import ShareDialog from "@/components/dialog/admin/shareDialog"
import OrderConfirmFormDialog from "@/components/dialog/admin/orderConfirmFormDialog"

const Orders = () => {
  const queryClient = useQueryClient()

  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const shareDisclosure = useDisclosure<any>()
  const orderConfirmDisclosure = useDisclosure<any>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_ORDER_FILTERS)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.list(filter),
    queryFn: () => ordersApi.getAll(filter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      deleteDisclosure.onClose()
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
        key: "id",
        header: "Order ID",
        render: (row) => <span className="font-mono text-xs">{row.id}</span>,
      },
      {
        key: "supplier",
        header: "Supplier",
        render: (row) => row.supplier?.companyName || "N/A",
      },
      {
        key: "date",
        header: "Date",
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        key: "items",
        header: "Items",
        render: (row) => row.items?.length || 0,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
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
            {row.status != "COMPLETED" && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handleOpen(row, "edit")}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => shareDisclosure.onOpen(row)}
            >
              <Share className="size-4" />
            </Button>

            <Button
              size="icon-sm"
              variant="ghost"
              className={
                row.status === "COMPLETED"
                  ? "rounded-2xl font-bold text-primary"
                  : ""
              }
              disabled={row.status === "COMPLETED"}
              onClick={() => orderConfirmDisclosure.onOpen(row)}
            >
              {row.status === "COMPLETED" ? (
                <CheckCheck className="size-6" />
              ) : (
                <Check className="size-6" />
              )}
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
      <OrderConfirmFormDialog
        open={orderConfirmDisclosure.isOpen}
        onClose={orderConfirmDisclosure.onClose}
        order={orderConfirmDisclosure.data}
      />
      <ShareDialog
        open={shareDisclosure.isOpen}
        onClose={shareDisclosure.onClose}
        order={shareDisclosure.data}
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
            lastPage={data?.meta?.totalPages || 1}
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
