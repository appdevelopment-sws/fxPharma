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
import { compoundingApi } from "@/services/compoundingApi"

import {
  INITIAL_COMPOUNDING_FILTERS,
  COMPOUNDING_COLUMNS,
} from "@/constants/page/admin/newcompound"
import NewCompoundDialog from "@/components/dialog/admin/NewCompoundDialog"

export default function AllCompoundPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(
    INITIAL_COMPOUNDING_FILTERS
  )

  const { data: compoundData, isLoading } = useQuery({
    queryKey: queryKeys.compounding.list(filter),
    queryFn: () => compoundingApi.getAll(filter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => compoundingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compounding.all })
      deleteDisclosure.onClose()
      toast.success("Compound deleted successfully")
    },
  })

  const handleOpen = (
    compound: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      compound ? { ...compound, id: compound.id, viewMode: mode === "view" } : null
    )
  }

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
        key: "compound_name",
        header: "Compound Name",
        accessor: "compound_name",
      },
      {
        key: "patient",
        header: "Patient",
        accessor: "patient",
      },
      {
        key: "provider",
        header: "Prescriber",
        accessor: "provider",
      },
      {
        key: "total_qty",
        header: "Total Qty",
        accessor: "total_qty",
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "ACTIVE" ? "bg-green-100 text-green-700" :
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
      <NewCompoundDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        compound={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Compound"
        description={`Are you sure you want to delete compound "${deleteDisclosure.data?.compound_name}"?`}
        onConfirm={() => deleteMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Prescription Compounding"
        description="Manage custom prescription compounds."
        action={
          <Button onClick={() => handleOpen(null, "create")}>
            <Plus className="mr-2 size-4" />
            New Compound RX
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
              placeholder="Search compound name..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={compoundData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={compoundData?.meta?.totalPages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={compoundData?.meta?.total || 0}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}

            emptyTitle="No compounds found"
            emptyDescription="Create a new compound or adjust the filters."
          />
        </div>
      </SectionCard>
    </div>
  )
}
