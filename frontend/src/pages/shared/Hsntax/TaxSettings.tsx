import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import TaxApi, { type TaxRate, type TaxFormValues } from "@/services/taxApi"
import TaxDialog from "./TaxDialog"

const INITIAL_TAX_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

const TaxSettings = () => {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure<TaxRate | null>()
  const deleteDisclosure = useDisclosure<TaxRate>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_TAX_FILTERS)

  const { data: taxesData, isLoading: isLoadingTaxes } = useQuery({
    queryKey: queryKeys.taxes.list(filter),
    queryFn: () => TaxApi.getTaxes(filter),
  })

  const createTaxMutation = useMutation({
    mutationFn: (values: TaxFormValues) => TaxApi.createTax(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes.all })
      dialogDisclosure.onClose()
      toast.success("Tax rule created successfully")
    },
  })

  const updateTaxMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: TaxFormValues }) =>
      TaxApi.updateTax(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes.all })
      dialogDisclosure.onClose()
      toast.success("Tax rule updated successfully")
    },
  })

  const deleteTaxMutation = useMutation({
    mutationFn: (id: number) => TaxApi.deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes.all })
      deleteDisclosure.onClose()
      toast.success("Tax rule deleted successfully")
    },
  })

  const handleOpen = (tax: TaxRate | null = null) => {
    dialogDisclosure.onOpen(tax)
  }

  const handleSubmit = async (values: TaxFormValues) => {
    if (dialogDisclosure.data?.id) {
      await updateTaxMutation.mutateAsync({
        id: dialogDisclosure.data.id,
        values,
      })
    } else {
      await createTaxMutation.mutateAsync(values)
    }
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<TaxRate>[] = useMemo(
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
        key: "name",
        header: "Rule Name",
        accessor: "name",
      },
      {
        key: "rate",
        header: "Tax Rate",
        render: (row) => `${row.rate}%`,
      },
      {
        key: "type",
        header: "Type",
        render: (row) => (
          <span className="capitalize">{row.type.toLowerCase()}</span>
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
      <TaxDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        onSubmit={handleSubmit}
        tax={dialogDisclosure.data}
        isSubmitting={createTaxMutation.isPending || updateTaxMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Tax Rule"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteTaxMutation.mutate(deleteDisclosure.data!.id)}
        isLoading={deleteTaxMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tax Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure different tax rules for your products and services.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 size-4" />
          Add Tax Rule
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
            placeholder="Search by rule name..."
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={taxesData?.data || []}
          rowKey="id"
          currentPage={filter.page || 1}
          lastPage={taxesData?.meta?.pages || 1}
          pageSize={filter.perPage || 10}
          totalRecords={taxesData?.meta?.total || 0}
          isLoading={isLoadingTaxes}
          onPageChange={(page) => handleFilterChange({ page })}
          onPageSizeChange={(perPage) =>
            handleFilterChange({ perPage, page: 1 })
          }
          emptyTitle="No tax rules found"
          emptyDescription="Create a tax rule to see it listed here."
        />
      </div>
    </div>
  )
}

export default TaxSettings
