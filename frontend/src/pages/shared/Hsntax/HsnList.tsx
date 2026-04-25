import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import { HsnApi, type HsnCode, type HsnFormValues } from "@/services/taxApi"
import HsnDialog from "./HsnDialog"

const INITIAL_HSN_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

const HsnList = () => {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure<HsnCode | null>()
  const deleteDisclosure = useDisclosure<HsnCode>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_HSN_FILTERS)

  const { data: hsnData, isLoading: isLoadingHsn } = useQuery({
    queryKey: queryKeys.hsnCodes.list(filter),
    queryFn: () => HsnApi.getHsnCodes(filter),
  })

  const createHsnMutation = useMutation({
    mutationFn: (values: HsnFormValues) => HsnApi.createHsn(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnCodes.all })
      dialogDisclosure.onClose()
      toast.success("HSN code created successfully")
    },
  })

  const updateHsnMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: HsnFormValues }) =>
      HsnApi.updateHsn(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnCodes.all })
      dialogDisclosure.onClose()
      toast.success("HSN code updated successfully")
    },
  })

  const deleteHsnMutation = useMutation({
    mutationFn: (id: number) => HsnApi.deleteHsn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hsnCodes.all })
      deleteDisclosure.onClose()
      toast.success("HSN code deleted successfully")
    },
  })

  const handleOpen = (hsn: HsnCode | null = null) => {
    dialogDisclosure.onOpen(hsn)
  }

  const handleSubmit = async (values: HsnFormValues) => {
    if (dialogDisclosure.data?.id) {
      await updateHsnMutation.mutateAsync({
        id: dialogDisclosure.data.id,
        values,
      })
    } else {
      await createHsnMutation.mutateAsync(values)
    }
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<HsnCode>[] = useMemo(
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
        key: "code",
        header: "HSN Code",
        accessor: "code",
      },
      {
        key: "description",
        header: "Description",
        accessor: "description",
        render: (row) => (
          <div
            className="max-w-md truncate text-muted-foreground"
            title={row.description}
          >
            {row.description || "—"}
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
      <HsnDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        onSubmit={handleSubmit}
        hsn={dialogDisclosure.data}
        isSubmitting={
          createHsnMutation.isPending || updateHsnMutation.isPending
        }
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete HSN Code"
        description={`Are you sure you want to delete HSN code "${deleteDisclosure.data?.code}"?`}
        onConfirm={() => deleteHsnMutation.mutate(deleteDisclosure.data!.id)}
        isLoading={deleteHsnMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">HSN Codes</h2>
          <p className="text-sm text-muted-foreground">
            Manage the list of HSN codes used for product classification.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 size-4" />
          Add HSN Code
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
            placeholder="Search by HSN code or description..."
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={hsnData?.data || []}
          rowKey="id"
          currentPage={filter.page || 1}
          lastPage={hsnData?.meta?.pages || 1}
          pageSize={filter.perPage || 10}
          totalRecords={hsnData?.meta?.total || 0}
          isLoading={isLoadingHsn}
          onPageChange={(page) => handleFilterChange({ page })}
          onPageSizeChange={(perPage) =>
            handleFilterChange({ perPage, page: 1 })
          }
          emptyTitle="No HSN codes found"
          emptyDescription="Create an HSN code to see it listed here."
        />
      </div>
    </div>
  )
}

export default HsnList
