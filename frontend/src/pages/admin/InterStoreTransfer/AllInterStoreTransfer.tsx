import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import { transferApi } from "@/services/transferApi"

import {
  INITIAL_STOCK_TRANSFER_FILTERS,
  STOCK_TRANSFER_COLUMNS,
} from "@/constants/page/admin/interstoretransfer"
import InterStoreTransferDialog from "@/components/dialog/admin/InterStoreTransfer"

export default function AllInterStoreTransferPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(
    INITIAL_STOCK_TRANSFER_FILTERS
  )

  const { data: transferData, isLoading } = useQuery({
    queryKey: queryKeys.transfers.list(filter),
    queryFn: () => transferApi.getAll(filter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transferApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all })
      deleteDisclosure.onClose()
      toast.success("Transfer deleted successfully")
    },
  })

  const handleOpen = (
    transfer: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      transfer ? { ...transfer, id: transfer.id, viewMode: mode === "view" } : null
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
        key: "reference_no",
        header: "Reference No.",
        accessor: "reference_no",
      },
      {
        key: "from_store",
        header: "From Store",
        accessor: "from_store",
      },
      {
        key: "to_store",
        header: "To Store",
        accessor: "to_store",
      },
      {
        key: "transfer_date",
        header: "Transfer Date",
        accessor: "transfer_date",
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "COMPLETED" ? "bg-green-100 text-green-700" :
            row.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        key: "action",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
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
              onClick={() => deleteDisclosure.onOpen(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ]
  }, [filter.page, filter.perPage, deleteDisclosure])

  return (
    <div className="space-y-6">
      <InterStoreTransferDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        transfer={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Transfer"
        description={`Are you sure you want to delete transfer "${deleteDisclosure.data?.reference_no}"?`}
        onConfirm={() => deleteMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Inter Store Transfer"
        description="Manage stock transfers between different stores."
        action={
          <Button onClick={() => handleOpen(null, "create")}>
            <Plus className="mr-2 size-4" />
            New Transfer
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search reference no..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={transferData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={transferData?.meta?.totalPages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={transferData?.meta?.total || 0}
            isLoading={isLoading}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No transfers found"
            emptyDescription="Create a new transfer or adjust the filters."
          />
        </div>
      </SectionCard>
    </div>
  )
}
