import * as React from "react"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import MasterProductDrawer, {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_FORM_DEFAULT_VALUES,
  type MasterProductFormValues,
} from "@/components/products/MasterProductDrawer"
import SectionCard from "@/components/SectionCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"
import { ConfirmDialog } from "@/components/confirmDialog"

// ============================================================================
// Type Definitions
// ============================================================================

interface ProductFilters {
  category: string
  status: string
  search: string
  page: number
  limit: number
}

interface DrawerState {
  mode: "create" | "edit" | "view"
  product: MasterProduct | null
}

// ============================================================================
// Component
// ============================================================================

export default function AdminProductsPage() {
  const queryClient = useQueryClient()

  // Dialog/Drawer State
  const drawerDisclosure = useDisclosure<DrawerState>()
  const deleteDisclosure = useDisclosure<MasterProduct>()

  // Filter State
  const [filters, setFilters] = React.useState<ProductFilters>({
    category: "",
    status: "",
    search: "",
    page: 1,
    limit: 10,
  })

  // Form Management
  const { control, handleSubmit, reset } = useForm<MasterProductFormValues>({
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  })

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => ProductApi.getProducts(filters),
  })

  // ============================================================================
  // Mutations
  // ============================================================================

  const createProductMutation = useMutation({
    mutationFn: (data: MasterProductFormValues) =>
      ProductApi.createProduct(data),
    onSuccess: () => {
      toast.success("Product created successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      drawerDisclosure.onClose()
      reset()
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create product"
      toast.error(message)
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MasterProductFormValues }) =>
      ProductApi.updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      drawerDisclosure.onClose()
      reset()
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update product"
      toast.error(message)
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => ProductApi.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      deleteDisclosure.onClose()
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete product"
      toast.error(message)
    },
  })

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleFilterChange = useCallback((updates: Partial<ProductFilters>) => {
    setFilters((current) => ({
      ...current,
      ...updates,
      page: updates.page || 1,
    }))
  }, [])

  const handleOpenDrawer = useCallback(
    (mode: "create" | "edit" | "view", product?: MasterProduct) => {
      if (mode === "create") {
        reset(PRODUCT_FORM_DEFAULT_VALUES)
        drawerDisclosure.onOpen({ mode, product: null })
      } else if (product) {
        const formValues: MasterProductFormValues = {
          name: product.name,
          genericName: product.genericName,
          category: product.category,
          manufacturer: product.manufacturer,
          unit: product.unit,
          sku: product.sku,
          purchasePrice: String(product.purchasePrice),
          sellingPrice: String(product.sellingPrice),
          stock: String(product.stock),
          reorderLevel: String(product.reorderLevel),
          status: product.status,
          description: product.description,
        }
        reset(formValues)
        drawerDisclosure.onOpen({ mode, product })
      }
    },
    [reset, drawerDisclosure]
  )

  const handleDrawerSubmit = useCallback(async () => {
    handleSubmit(async (data) => {
      if (!drawerDisclosure.data) return

      if (drawerDisclosure.data.mode === "create") {
        await createProductMutation.mutateAsync(data)
      } else if (
        drawerDisclosure.data.mode === "edit" &&
        drawerDisclosure.data.product
      ) {
        await updateProductMutation.mutateAsync({
          id: drawerDisclosure.data.product.id,
          data,
        })
      }
    })()
  }, [
    handleSubmit,
    drawerDisclosure,
    createProductMutation,
    updateProductMutation,
  ])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDisclosure.data) {
      deleteProductMutation.mutate(deleteDisclosure.data.id)
    }
  }, [deleteDisclosure, deleteProductMutation])

  // ============================================================================
  // Table Columns
  // ============================================================================

  const columns: DataTableColumn<MasterProduct>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Product ID",
        accessor: "id",
        cellClassName: "font-medium text-foreground",
      },
      {
        key: "name",
        header: "Product Name",
        render: (row) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.sku}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (row) => (
          <div className="space-y-1">
            <p>{row.category}</p>
            <p className="text-xs text-muted-foreground">{row.unit}</p>
          </div>
        ),
      },
      {
        key: "manufacturer",
        header: "Manufacturer",
        accessor: "manufacturer",
      },
      {
        key: "price",
        header: "Price",
        render: (row) => `₹${row.sellingPrice.toFixed(2)}`,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge variant={row.status === "active" ? "default" : "outline"}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "stock",
        header: "Stock",
        render: (row) => `${row.stock} units`,
        cellClassName: "text-right",
        className: "text-right",
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
              onClick={() => handleOpenDrawer("view", row)}
            >
              <Eye className="size-3.5" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenDrawer("edit", row)}
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
    []
  )

  // ============================================================================
  // Render
  // ============================================================================

  const isSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending
  const isDrawerLoading = isSubmitting

  return (
    <div>
      {/* Product Drawer */}
      {drawerDisclosure.data && (
        <MasterProductDrawer
          open={drawerDisclosure.isOpen}
          onOpenChange={drawerDisclosure.onClose}
          control={control}
          onSubmit={(e) => {
            e.preventDefault()
            handleDrawerSubmit()
          }}
          mode={drawerDisclosure.data.mode}
          isSubmitting={isSubmitting}
          isLoading={isDrawerLoading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteProductMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      {/* Main Content */}
      <SectionCard
        title="Master Products"
        description="Manage your product catalog with pricing, inventory levels, and categorization."
        action={
          <Button
            type="button"
            onClick={() => handleOpenDrawer("create")}
            disabled={isLoadingProducts}
          >
            <Plus className="size-4" />
            Add Product
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Filters */}
          <FilterBar
            values={{
              category: filters.category,
              status: filters.status,
              search: filters.search,
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Select
              name="category"
              options={PRODUCT_CATEGORY_OPTIONS}
              placeholder="All Categories"
            />
            <FilterBar.Select
              name="status"
              options={PRODUCT_STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <FilterBar.Search
              name="search"
              placeholder="Search by product name, SKU, or manufacturer"
            />
          </FilterBar>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={productsData?.data || []}
            rowKey="id"
            currentPage={filters.page}
            lastPage={
              productsData?.meta?.pages ||
              Math.ceil((productsData?.meta?.total || 0) / filters.limit)
            }
            pageSize={filters.limit}
            totalRecords={productsData?.meta?.total || 0}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(limit) => handleFilterChange({ limit, page: 1 })}
            isLoading={isLoadingProducts}
            emptyTitle="No products found"
            emptyDescription="Get started by creating your first master product. You can manage pricing, stock levels, and categories all in one place."
          />
        </div>
      </SectionCard>
    </div>
  )
}
