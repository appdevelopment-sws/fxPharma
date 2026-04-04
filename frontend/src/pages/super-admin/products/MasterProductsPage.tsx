import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import MasterProductDrawer, {
  PRODUCT_FORM_DEFAULT_VALUES,
  type MasterProductFormValues,
} from "@/components/products/MasterProductDrawer"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"

type ProductFilters = {
  companyId: string
  productTypeId: string
  hsnCodeId: string
  search: string
  page: number
  limit: number
}

type DrawerState = {
  mode: "create" | "edit" | "view"
  product: MasterProduct | null
}

export default function SuperAdminProductsPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<DrawerState>()
  const deleteDisclosure = useDisclosure<MasterProduct>()
  const { filter, handleFilter } = useSearchFilter<ProductFilters>({
    companyId: "",
    productTypeId: "",
    hsnCodeId: "",
    search: "",
    page: 1,
    limit: 10,
  })

  const { control, handleSubmit, reset } = useForm<MasterProductFormValues>({
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  })

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: queryKeys.masterProducts.list(filter),
    queryFn: () => ProductApi.getMasterProducts(filter),
  })

  const createProductMutation = useMutation({
    mutationFn: (data: MasterProductFormValues) =>
      ProductApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProducts.all })
      drawerDisclosure.onClose()
      reset(PRODUCT_FORM_DEFAULT_VALUES)
    },
    onError: (error: any) => {},
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MasterProductFormValues }) =>
      ProductApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProducts.all })
      drawerDisclosure.onClose()
      reset(PRODUCT_FORM_DEFAULT_VALUES)
    },
    onError: () => {},
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => ProductApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProducts.all })
      deleteDisclosure.onClose()
    },
    onError: () => {},
  })

  const handleFilterChange = useCallback(
    (updates: Partial<ProductFilters>) => {
      handleFilter({
        ...updates,
        page: updates.page ?? 1,
      })
    },
    [handleFilter]
  )

  const openDrawer = useCallback(
    (mode: DrawerState["mode"], product?: MasterProduct) => {
      if (mode === "create") {
        reset(PRODUCT_FORM_DEFAULT_VALUES)
        drawerDisclosure.onOpen({ mode, product: null })
        return
      }

      if (!product) return

      reset({
        name: product.name,
        salt: product.salt,
        barcode: product.barcode ?? "",
        brand_name: product.brand_name ?? "",
        pack_size: product.pack_size ?? "",
        strength: product.strength ?? "",
        hsnCodeId: String(product.hsnCodeId),
        company_id: String(product.company_id),
        product_type_id: String(product.product_type_id),
      })

      drawerDisclosure.onOpen({ mode, product })
    },
    [drawerDisclosure, reset]
  )

  const handleDrawerChange = useCallback(
    (open: boolean) => {
      if (open) return

      drawerDisclosure.onClose()
      reset(PRODUCT_FORM_DEFAULT_VALUES)
    },
    [drawerDisclosure, reset]
  )

  const handleDrawerSubmit = useCallback(async () => {
    await handleSubmit(async (values) => {
      if (!drawerDisclosure.data) return

      if (drawerDisclosure.data.mode === "create") {
        await createProductMutation.mutateAsync(values)
        return
      }

      if (
        drawerDisclosure.data.mode === "edit" &&
        drawerDisclosure.data.product
      ) {
        await updateProductMutation.mutateAsync({
          id: drawerDisclosure.data.product.id,
          data: values,
        })
      }
    })()
  }, [
    createProductMutation,
    drawerDisclosure,
    handleSubmit,
    updateProductMutation,
  ])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteDisclosure.data) return
    deleteProductMutation.mutate(deleteDisclosure.data.id)
  }, [deleteDisclosure.data, deleteProductMutation])

  const productColumns = useMemo<DataTableColumn<MasterProduct>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        accessor: "id",
        cellClassName: "font-medium text-foreground",
      },
      {
        key: "name",
        header: "Product",
        render: (row) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.salt}</p>
          </div>
        ),
      },
      {
        key: "brand",
        header: "Brand / Strength",
        render: (row) => (
          <div className="space-y-1">
            <p>{row.brand_name || "-"}</p>
            <p className="text-xs text-muted-foreground">
              {row.strength || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "company",
        header: "Company",
        render: (row) => row.company?.name || `#${row.company_id}`,
      },
      {
        key: "productType",
        header: "Product Type",
        render: (row) => row.product_type?.name || `#${row.product_type_id}`,
      },
      {
        key: "hsn",
        header: "HSN",
        render: (row) => row.hsnCode?.code || `#${row.hsnCodeId}`,
      },
      {
        key: "barcode",
        header: "Barcode",
        render: (row) => row.barcode || "-",
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cellClassName: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openDrawer("view", row)}
            >
              <Eye className="size-3.5" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openDrawer("edit", row)}
            >
              <PencilLine className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => deleteDisclosure.onOpen(row)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteDisclosure, openDrawer]
  )

  const isSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending
  const totalRecords =
    productsData?.meta?.total ?? productsData?.data.length ?? 0
  const lastPage =
    productsData?.meta?.pages ??
    Math.max(1, Math.ceil(totalRecords / filter.limit))

  return (
    <div>
      {drawerDisclosure.data && (
        <MasterProductDrawer
          open={drawerDisclosure.isOpen}
          onOpenChange={handleDrawerChange}
          control={control}
          onSubmit={(event) => {
            event.preventDefault()
            handleDrawerSubmit()
          }}
          mode={drawerDisclosure.data.mode}
          isSubmitting={isSubmitting}
          isLoading={isSubmitting}
        />
      )}

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            deleteDisclosure.onClose()
          }
        }}
        title="Delete Master Product"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteProductMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Master Products"
        description="Manage reusable product metadata linked to company, product type, and HSN records."
        action={
          <Button
            type="button"
            onClick={() => openDrawer("create")}
            disabled={isLoadingProducts}
          >
            <Plus className="size-4" />
            Add Product
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              companyId: filter.companyId,
              productTypeId: filter.productTypeId,
              hsnCodeId: filter.hsnCodeId,
              search: filter.search,
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="companyId"
              placeholder="Filter by company ID"
              className="min-w-[180px] flex-1"
            />
            <FilterBar.Search
              name="productTypeId"
              placeholder="Filter by product type ID"
              className="min-w-[180px] flex-1"
            />
            <FilterBar.Search
              name="hsnCodeId"
              placeholder="Filter by HSN code ID"
              className="min-w-[180px] flex-1"
            />
            <FilterBar.Search
              name="search"
              placeholder="Search by name, salt, brand, or barcode"
            />
          </FilterBar>

          <DataTable
            columns={productColumns}
            data={productsData?.data ?? []}
            rowKey="id"
            currentPage={filter.page}
            lastPage={lastPage}
            pageSize={filter.limit}
            totalRecords={totalRecords}
            isLoading={isLoadingProducts}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(limit) => handleFilterChange({ limit, page: 1 })}
            emptyTitle="No master products found"
            emptyDescription="Create a master product or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
