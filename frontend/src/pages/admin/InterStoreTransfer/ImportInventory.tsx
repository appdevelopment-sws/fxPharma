import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownToLine } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi from "@/services/masterProductApi"
import InventoryApi from "@/services/inventoryApi"

import {
  ACTIVE_MASTER_PRODUCT_STATUS,
  INITIAL_MASTER_PRODUCT_IMPORT_FILTERS,
  MEDICINE_IMPORT_COLUMNS,
} from "@/constants/page/admin/importinventory"
import { CATEGORY_TYPE_OPTIONS } from "@/constants/page/super-admin/master-products"
import AddMedicineDialog from "@/components/dialog/admin/AddMedicineDialog"

export default function ImportInventoryPage() {
  const {
    isOpen: isDrawerOpen,
    data: drawerData,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(
    INITIAL_MASTER_PRODUCT_IMPORT_FILTERS
  )

  const masterProductFilter = useMemo(
    () => ({
      ...filter,
      limit: filter.perPage || 10,
      status: ACTIVE_MASTER_PRODUCT_STATUS,
    }),
    [filter]
  )

  const { data: productData, isLoading: isLoadingProducts } = useQuery({
    queryKey: queryKeys.masterProducts.list(masterProductFilter),
    queryFn: () => ProductApi.getMasterProducts(masterProductFilter),
  })

  const { data: inventoryData } = useQuery({
    queryKey: queryKeys.inventory.list({ allForImport: true }),
    queryFn: async () => {
      let allData: any[] = []
      let page = 1
      let hasNextPage = true
      while (hasNextPage && page <= 10) {
        const res = await InventoryApi.getAll({ limit: 100, page })
        if (res?.data) {
          allData = [...allData, ...res.data]
        }
        hasNextPage = !!res?.meta?.hasNextPage
        page++
      }
      return { data: allData }
    },
  })

  const importedProductNames = useMemo(() => {
    if (!inventoryData?.data) return new Set<string>()
    return new Set<string>(
      inventoryData.data.map((item: any) => item.name?.trim().toLowerCase())
    )
  }, [inventoryData])

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({
        ...updates,
        page: 1,
        status: ACTIVE_MASTER_PRODUCT_STATUS,
      })
    },
    [handleFilter]
  )

  const handleImportOpen = useCallback(
    (product: any) => {
      openDrawer({
        ...product,
        viewMode: false,
      })
    },
    [openDrawer]
  )

  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = masterProductFilter.page || 1
          const perPage = masterProductFilter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "medicine_details",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "medicine_details")
            ?.label || "Medicine Details",
        render: (row) =>
          [row.name, row.salt || row.saltComposition]
            .filter(Boolean)
            .join(" / ") ||
          row.name ||
          "-",
      },
      {
        key: "manufacturer",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "manufacturer")
            ?.label || "Manufacturer",
        render: (row) =>
          row.manufacturer?.name ||
          row.manufacturer ||
          row.manufacturerName ||
          "-",
      },
      {
        key: "category",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "category")?.label ||
          "Category",
        render: (row) => row.categoryType || row.category_type || "-",
      },
      {
        key: "type",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "type")?.label ||
          "Type",
        render: (row) => row.categoryType || row.category_type || "-",
      },
      {
        key: "action",
        header:
          MEDICINE_IMPORT_COLUMNS.find((c) => c.key === "action")?.label ||
          "Import",
        render: (row) => {
          const isImported = importedProductNames.has(
            row.name?.trim().toLowerCase()
          )
          return isImported ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              className="border-emerald-200/50 bg-emerald-50/50 text-emerald-600 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400 opacity-90 cursor-not-allowed font-bold"
            >
              Imported
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => handleImportOpen(row)}
            >
              <ArrowDownToLine className="mr-2 size-4" />
              Import
            </Button>
          )
        },
      },
    ]
  }, [
    handleImportOpen,
    masterProductFilter.perPage,
    masterProductFilter.page,
    importedProductNames,
  ])

  return (
    <div className="space-y-6">
      <AddMedicineDialog
        open={isDrawerOpen}
        onClose={closeDrawer}
        product={drawerData}
        mode="create"
        includeGlobal={true}
      />

      <SectionCard
        title="Import Inventory"
        description="Search active master products, import one into the inventory drawer, then save it as stock."
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              categoryType: filter.categoryType || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-full md:w-[30%]"
              placeholder="Search active master products..."
            />
            <FilterBar.Select
              name="categoryType"
              placeholder="All Types"
              options={[

                ...CATEGORY_TYPE_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={productData?.data || []}
            rowKey="id"
            currentPage={masterProductFilter.page || 1}
            lastPage={
              productData?.meta?.totalPages ||
              Math.ceil(
                (productData?.meta?.total || 0) /
                (masterProductFilter.perPage || 10)
              ) ||
              1
            }
            pageSize={masterProductFilter.perPage || 10}
            totalRecords={productData?.meta?.total || 0}
            isLoading={isLoadingProducts}
            onPageChange={(page) =>
              handleFilterChange({ page, status: ACTIVE_MASTER_PRODUCT_STATUS })
            }
            onPageSizeChange={(perPage) =>
              handleFilterChange({
                perPage,
                page: 1,
                status: ACTIVE_MASTER_PRODUCT_STATUS,
              })
            }
            emptyTitle="No active master products found"
            emptyDescription="Try a different search term or create an active master product first."
          />
        </div>
      </SectionCard>
    </div>
  )
}
