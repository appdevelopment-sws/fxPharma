import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import {
  HsnApi,
  type HsnMapping,
  type HsnMappingFormValues,
} from "@/services/taxApi"
import HsnMappingDialog from "./HsnMappingDialog"

const INITIAL_MAPPING_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return format(date, "dd MMM yyyy")
}

const HsnMappingPage = () => {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure<HsnMapping | null>()
  const deleteDisclosure = useDisclosure<HsnMapping>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_MAPPING_FILTERS)

  const { data: mappingData, isLoading: isLoadingMapping } = useQuery({
    queryKey: queryKeys.hsnMappings.list(filter),
    queryFn: () => HsnApi.getMappings(filter),
  })

  const createMappingMutation = useMutation({
    mutationFn: (values: HsnMappingFormValues) => HsnApi.createMapping(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnMappings.all })
      dialogDisclosure.onClose()
      toast.success("HSN mapped to tax rule successfully")
    },
  })

  const updateMappingMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number
      values: HsnMappingFormValues
    }) => HsnApi.updateMapping(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnMappings.all })
      dialogDisclosure.onClose()
      toast.success("HSN mapping updated successfully")
    },
  })

  const deleteMappingMutation = useMutation({
    mutationFn: (id: number) => HsnApi.deleteMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnMappings.all })
      deleteDisclosure.onClose()
      toast.success("HSN mapping deleted successfully")
    },
  })

  const handleOpen = (mapping: HsnMapping | null = null) => {
    dialogDisclosure.onOpen(mapping)
  }

  const handleSubmit = async (values: HsnMappingFormValues) => {
    if (dialogDisclosure.data?.id) {
      await updateMappingMutation.mutateAsync({
        id: dialogDisclosure.data.id,
        values,
      })
    } else {
      await createMappingMutation.mutateAsync(values)
    }
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<HsnMapping>[] = useMemo(
    () => [
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
        key: "hsn",
        header: "HSN Code",
        render: (row) => row.hsn?.hsncode || `HSN #${row.hsnid}`,
      },
      {
        key: "tax",
        header: "Tax Rule",
        render: (row) =>
          row.tax
            ? `${row.tax.name} (${row.tax.rate}%)`
            : `Tax #${row.taxid}`,
      },
      {
        key: "effectiveFrom",
        header: "Effective From",
        render: (row) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formatDate(row.effectiveFrom)}</span>
          </div>
        ),
      },
      {
        key: "effectiveTo",
        header: "Effective To",
        render: (row) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formatDate(row.effectiveTo)}</span>
          </div>
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
              onClick={() => handleOpen(row)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => deleteDisclosure.onOpen(row)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [filter.page, filter.perPage, deleteDisclosure]
  )

  return (
    <div className="space-y-6">
      <HsnMappingDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        onSubmit={handleSubmit}
        mapping={dialogDisclosure.data}
        isSubmitting={
          createMappingMutation.isPending || updateMappingMutation.isPending
        }
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete HSN-Tax Link"
        description="Are you sure you want to remove this mapping? This might affect tax calculations for medicines under this HSN."
        onConfirm={() =>
          deleteMappingMutation.mutate(deleteDisclosure.data!.id)
        }
        isLoading={deleteMappingMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">HSN Mapping</h2>
          <p className="text-sm text-muted-foreground">
            Link HSN codes to tax rules with effective dates.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 size-4" />
          Link HSN to Tax
        </Button>
      </div>

      <div className="space-y-4">
        <FilterBar
          values={{
            search: filter.search || "",
          }}
          onChange={handleFilterChange}
        >
          <FilterBar.Search
            name="search"
            placeholder="Search by HSN code or tax name..."
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={mappingData?.data || []}
          rowKey="id"
          currentPage={filter.page || 1}
          lastPage={mappingData?.meta?.totalPages || 1}
          pageSize={filter.perPage || 10}
          totalRecords={mappingData?.meta?.total || 0}
          isLoading={isLoadingMapping}
          onPageChange={(page) => handleFilterChange({ page })}
          onPageSizeChange={(perPage) =>
            handleFilterChange({ perPage, page: 1 })
          }
          emptyTitle="No HSN mappings found"
          emptyDescription="Link an HSN code to a tax rule to see it listed here."
        />
      </div>
    </div>
  )
}

export default HsnMappingPage
