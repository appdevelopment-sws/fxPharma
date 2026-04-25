import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SupplierDrawer from "@/components/dialog/SupplierDrawer"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import SupplierApi, { type Supplier } from "@/services/supplierApi"

import {
  INITIAL_SUPPLIER_FILTERS,
  SUPPLIER_COLUMNS,
} from "@/constants/page/admin/suppliers"
import { StatusBadge } from "@/components/ui/badge-status"

export default function Suppliers() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_SUPPLIER_FILTERS)

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: queryKeys.suppliers.list(filter),
    queryFn: () => SupplierApi.getSuppliers(filter),
  })

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => SupplierApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
      deleteDisclosure.onClose()
      toast.success("Supplier deleted successfully")
    },
  })

  const handleOpen = (
    supplier: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      supplier
        ? { ...supplier, id: supplier.id, viewMode: mode === "view" }
        : null
    )
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<Supplier>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: SUPPLIER_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "company_name",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "company_name")?.label ||
          "Company Name",
        accessor: "company_name",
      },
      {
        key: "gstin",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "gstin")?.label ||
          "GST Number",
        accessor: "gstin",
      },
      {
        key: "contact_person",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "contact_person")?.label ||
          "Contact Person",
        accessor: "contact_person",
      },
      {
        key: "phone",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "phone")?.label || "Phone",
        accessor: "phone",
      },
      {
        key: "is_preferred",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "is_preferred")?.label ||
          "Preferred",
        render: (row) => (
          <StatusBadge
            status={row.is_preferred ? "Yes" : "No"}
            variant={row.is_preferred ? "success" : "default"}
          />
        ),
      },
      {
        key: "action",
        header:
          SUPPLIER_COLUMNS.find((c) => c.key === "action")?.label || "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row, "view")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row, "edit")}
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
    ]
  }, [filter.page, filter.perPage, deleteDisclosure])

  return (
    <div className="space-y-6">
      <SupplierDrawer
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        supplier={drawerDisclosure.data}
      />
      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.company_name}"? This action cannot be undone.`}
        onConfirm={() =>
          deleteSupplierMutation.mutate(deleteDisclosure.data?.id)
        }
        isLoading={deleteSupplierMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Suppliers"
        description="Manage your product suppliers, contact details, and procurement preferences."
        action={
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" onClick={() => handleOpen(null, "create")}>
              <Plus className="mr-2 size-4" />
              Add Supplier
            </Button>
          </div>
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
              placeholder="Search by company, GST, or contact..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={suppliersData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              suppliersData?.meta?.pages ||
              Math.ceil(
                (suppliersData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={suppliersData?.meta?.total || 0}
            isLoading={isLoadingSuppliers}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No suppliers found"
            emptyDescription="Add a new supplier or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
