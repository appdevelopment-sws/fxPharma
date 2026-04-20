import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import MasterProductDialog from "@/components/products/MasterProductDrawer"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"

import {
  INITIAL_PRODUCT_FILTERS,
  MASTER_PRODUCT_COLUMNS,
} from "@/constants/page/super-admin/master-products"

export default function MasterProductsPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_PRODUCT_FILTERS)

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: queryKeys.masterProducts.list(filter),
    queryFn: () => ProductApi.getMasterProducts(filter),
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => ProductApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProducts.all })
      deleteDisclosure.onClose()
      toast.success("Master product deleted successfully")
    },
  })

  const handleOpen = (
    product: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      product ? { ...product, id: product.id, viewMode: mode === "view" } : null
    )
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<MasterProduct>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "name",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "name")?.label ||
          "Product",
        accessor: "name",
      },
      {
        key: "salt",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "salt")?.label ||
          "Salt Composition",
        accessor: "salt",
      },
      {
        key: "company",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "company")?.label ||
          "Company Id",
        accessor: "company_id", // Just primitive rendering since references are removed
      },
      {
        key: "product_type",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "product_type")?.label ||
          "Type Id",
        accessor: "product_type_id",
      },
      {
        key: "hsn",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "hsn")?.label ||
          "HSN Code Id",
        accessor: "hsnCodeId",
      },
      {
        key: "action",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "action")?.label ||
          "Actions",
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
      <MasterProductDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        product={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Master Product"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.name}"? This action cannot be undone.`}
        onConfirm={() =>
          deleteProductMutation.mutate(deleteDisclosure.data?.id)
        }
        isLoading={deleteProductMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Master Products"
        description="Manage reusable product metadata linked to company, product type, and HSN records."
        action={
          <Button type="button" onClick={() => handleOpen(null, "create")}>
            <Plus className="mr-2 size-4" />
            Add Product
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              companyId: filter.companyId || "",
              productTypeId: filter.productTypeId || "",
              hsnCodeId: filter.hsnCodeId || "",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              placeholder="Search by product name, generic, or brand..."
            />
            {/* Keeping these as simple text inputs to search by IDs as per simplified API limits */}
            <FilterBar.Search name="companyId" placeholder="Company ID" />
            <FilterBar.Search
              name="productTypeId"
              placeholder="Product Type ID"
            />
            <FilterBar.Search name="hsnCodeId" placeholder="HSN ID" />
          </FilterBar>

          <DataTable
            columns={columns}
            data={productsData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              productsData?.meta?.pages ||
              Math.ceil(
                (productsData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={productsData?.meta?.total || 0}
            isLoading={isLoadingProducts}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No master products found"
            emptyDescription="Create a master product or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
