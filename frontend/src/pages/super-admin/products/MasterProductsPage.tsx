import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2, Download, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import MasterProductDialog from "@/components/dialog/MasterProductDrawer"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"
import BrandApi, { ManufacturerApi } from "@/services/attributesApi"

import {
  CATEGORY_TYPE_OPTIONS,
  INITIAL_PRODUCT_FILTERS,
  MASTER_PRODUCT_COLUMNS,
  PRODUCT_STATUS_OPTIONS,
} from "@/constants/page/super-admin/master-products"
import BulkUploadProductModal from "@/components/shared/bulkUploadProductModal"

export default function MasterProductsPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const bulkDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_PRODUCT_FILTERS)

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: queryKeys.masterProducts.list(filter),
    queryFn: () => ProductApi.getMasterProducts(filter),
  })

  const { data: brandsData } = useQuery({
    queryKey: queryKeys.brands.list({ limit: 1000 }),
    queryFn: () => BrandApi.getBrands({ limit: 1000 }),
  })

  const { data: manufacturersData } = useQuery({
    queryKey: queryKeys.manufacturers.list({ limit: 1000 }),
    queryFn: () => ManufacturerApi.getManufacturers({ limit: 1000 }),
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
  const handleBulkOpen = () => {
    bulkDisclosure.onOpen(null)
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


  const brandOptions = useMemo(
    () => [
      { label: "All Brands", value: "all" },
      ...(brandsData?.data || []).map((brand) => ({
        label: brand.name,
        value: String(brand.id),
      })),
    ],
    [brandsData]
  )

  const manufacturerOptions = useMemo(
    () => [
      { label: "All Companies", value: "all" },
      ...(manufacturersData?.data || []).map((manufacturer) => ({
        label: manufacturer.name,
        value: String(manufacturer.id),
      })),
    ],
    [manufacturersData]
  )

  const columns: DataTableColumn<MasterProduct>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.limit || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "name",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "name")?.label ||
          "Product",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
              {row.imageUrl ? (
                <img
                  src={getImageUrl(row.imageUrl)}
                  alt={row.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground/50" />
              )}
            </div>
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
      {
        key: "salt",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "salt")?.label ||
          "Salt Composition",
        render: (row) => row.salt || "-",
      },
      {
        key: "company",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "company")?.label ||
          "Manufacturer",
        render: (row) => row.manufacturer?.name || "-",
      },
      {
        key: "product_type",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "product_type")?.label ||
          "Type",
        accessor: "categoryType",
      },
      {
        key: "hsn",
        header:
          MASTER_PRODUCT_COLUMNS.find((c) => c.key === "hsn")?.label ||
          "HSN Code",
        render: (row) => row.hsn?.hsncode || "-",
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
  }, [filter.page, filter.limit, deleteDisclosure])

  return (
    <div className="space-y-6">
      <MasterProductDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        product={drawerDisclosure.data}
      />
      <BulkUploadProductModal
        open={bulkDisclosure.isOpen}
        onClose={bulkDisclosure.onClose}
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
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" onClick={() => handleOpen(null, "create")}>
              <Plus className="mr-2 size-4" />
              Add Product
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkOpen}>
              <Download className="mr-2 size-4" />
              Bulk Import
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              brandId: filter.brandId || "all",
              manufacturerId: filter.manufacturerId || "all",
              categoryType: filter.categoryType || "all",
              status: filter.status || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search by product, salt, company, brand..."
            />
            <FilterBar.Select
              name="manufacturerId"
              placeholder="All Companies"
              options={manufacturerOptions}
            />
            <FilterBar.Select
              name="brandId"
              placeholder="All Brands"
              options={brandOptions}
            />
            <FilterBar.Select
              name="categoryType"
              placeholder="All Types"
              options={[
                { label: "All Types", value: "all" },
                ...CATEGORY_TYPE_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[

                ...PRODUCT_STATUS_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={productsData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              productsData?.meta?.totalPages ||
              Math.ceil(
                (productsData?.meta?.total || 0) / (filter.limit || 10)
              ) ||
              1
            }
            pageSize={filter.limit || 10}
            totalRecords={productsData?.meta?.total || 0}
            isLoading={isLoadingProducts}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}

            emptyTitle="No master products found"
            emptyDescription="Create a master product or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
