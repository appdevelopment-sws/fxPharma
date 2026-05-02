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

import BrandApi, { type Brand } from "@/services/attributesApi"
import { queryKeys } from "@/lib/queryKeys"

import {
  INITIAL_BRAND_FILTERS,
  BRAND_COLUMNS,
} from "@/constants/page/super-admin/brands"
import BrandDrawer from "@/components/dialog/BrandsDialog"

const Brands = () => {
  const queryClient = useQueryClient()

  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()

  const { filter, handleFilter } = useSearchFilter(INITIAL_BRAND_FILTERS)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.brands.list(filter),
    queryFn: () => BrandApi.getBrands(filter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => BrandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
      deleteDisclosure.onClose()
      toast.success("Brand deleted successfully")
    },
  })

  const handleOpen = (
    brand: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      brand ? { ...brand, viewMode: mode === "view" } : null
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
        key: "brand_info",
        header: "Brand Info",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-muted">
              {row.logo ? (
                <img src={row.logo} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">IMG</span>
              )}
            </div>

            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.createdAt}</p>
            </div>
          </div>
        ),
      },

      {
        key: "description",
        header: "Description",
        accessor: "description",
      },

      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${row.status === "ACTIVE"
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
      <BrandDrawer
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        brand={drawerDisclosure.data}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Brand"
        description={`Delete "${deleteDisclosure.data?.name}"?`}
        onConfirm={() => deleteMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteMutation.isPending}
        confirmText="delete"
        variant="danger"
      />

      <SectionCard
        title="Brands"
        description="Manage pharmaceutical brands"
        action={
          <Button onClick={() => handleOpen()}>
            <Plus className="mr-2 size-4" />
            Add Brand
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
              placeholder="Search brands..."
              className="w-[300px]"
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={data?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={data?.meta?.page || 1}
            pageSize={filter.perPage || 10}
            totalRecords={data?.meta?.total || 0}
            isLoading={isLoading}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No brands found"
            emptyDescription="Add a new brand to get started."
          />
        </div>
      </SectionCard>
    </div>
  )
}

export default Brands
