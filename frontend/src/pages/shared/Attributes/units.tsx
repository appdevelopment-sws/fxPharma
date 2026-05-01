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
import { UnitApi } from "@/services/attributesApi"
import { INITIAL_UNIT_FILTERS } from "@/constants/page/super-admin/unit"
import UnitDialog from "@/components/dialog/UnitDialog"

const Units = () => {
  const queryClient = useQueryClient()

  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_UNIT_FILTERS)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.units.list(filter),
    queryFn: () => UnitApi.getUnits(filter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => UnitApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
      deleteDisclosure.onClose()
      toast.success("Unit deleted successfully")
    },
  })

  const handleOpen = (
    unit: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      unit ? { ...unit, viewMode: mode === "view" } : null
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
        key: "general",
        header: "General Info",
        render: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.createdAt}</p>
          </div>
        ),
      },

      {
        key: "symbol",
        header: "Symbol",
        render: (row) => (
          <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
            {row.short_name}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              row.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {row.status}
          </span>
        ),
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
      <UnitDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        unit={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Unit"
        description={`Delete "${deleteDisclosure.data?.name}"?`}
        onConfirm={() => deleteMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteMutation.isPending}
        confirmText="delete"
        variant="danger"
      />

      <SectionCard
        title="Units"
        description="Manage measurement units"
        action={
          <Button onClick={() => handleOpen()}>
            <Plus className="mr-2 size-4" />
            Add Unit
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
              placeholder="Search units..."
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
            emptyTitle="No units found"
            emptyDescription="Add a unit to get started."
          />
        </div>
      </SectionCard>
    </div>
  )
}

export default Units
