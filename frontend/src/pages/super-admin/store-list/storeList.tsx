import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  Download,
  ShieldAlert,
  Layers,
  Network,
  Cpu,
  Boxes,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import StoreListApi, { type Store } from "@/services/storelistApi"

import {
  INITIAL_STORE_FILTERS,
  STORE_COLUMNS,
} from "@/constants/page/super-admin/store"
import { Badge } from "@/components/ui/badge"
import AddStoreListDialog from "@/components/dialog/AddStoreListDialog"

export default function ManageSubscriptionPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<Store>()
  const deleteDisclosure = useDisclosure<Store>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_STORE_FILTERS)

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: queryKeys.storeList.list(filter),
    queryFn: () => StoreListApi.getStores(filter),
  })

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => StoreListApi.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeList.all })
      deleteDisclosure.onClose()
      toast.success("Store deleted successfully")
    },
  })

  const handleOpen = (
    store: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    drawerDisclosure.onOpen(
      store ? { ...store, id: store.id, viewMode: mode === "view" } : null
    )
  }
  const handleBulkOpen = () => {
    useDisclosure.onOpen(null)
  }
  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )
  console.log("harsh")
  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: STORE_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },

      {
        key: "store_name",
        header:
          STORE_COLUMNS.find((c) => c.key === "store_name")?.label ||
          "Store Name",
        accessor: "store_name",
      },

      {
        key: "owner",
        header: STORE_COLUMNS.find((c) => c.key === "owner")?.label || "Owner",
        accessor: "owner",
      },

      {
        key: "plan",
        header:
          STORE_COLUMNS.find((c) => c.key === "plan")?.label ||
          "Subscription Plan",
        accessor: "plan",
      },

      {
        key: "city",
        header: STORE_COLUMNS.find((c) => c.key === "city")?.label || "City",
        accessor: "city",
      },

      {
        key: "status",
        header:
          STORE_COLUMNS.find((c) => c.key === "status")?.label || "Status",
        render: (row) => (
          <Badge
            variant={
              row.status === "ACTIVE"
                ? "success"
                : row.status === "INACTIVE"
                  ? "secondary"
                  : "danger"
            }
          >
            {row.status}
          </Badge>
        ),
      },

      {
        key: "action",
        header:
          STORE_COLUMNS.find((c) => c.key === "action")?.label || "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
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
              onClick={() => deleteDisclosure.onOpen(row)}
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
      <AddStoreListDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        store={drawerDisclosure.data}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Store"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.store_name}"? This action cannot be undone.`}
        onConfirm={() =>
          deleteStoreMutation.mutate(deleteDisclosure.data?.id!)
        }
        isLoading={deleteStoreMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Store List"
        description="Manage store list for the platform."
        action={
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" onClick={() => handleOpen(null, "create")}>
              <Plus className="mr-2 size-4" />
              Create New Store
            </Button>
          </div>
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
              className="w-[30%]"
              placeholder="Search by store name or mobile number"
            />
            {/* Keeping these as simple text inputs to search by IDs as per simplified API limits */}
            {/* <FilterBar.Search name="companyId" placeholder="Company ID" />
            <FilterBar.Search
              name="productTypeId"
              placeholder="Product Type ID"
            />
            <FilterBar.Search name="hsnCodeId" placeholder="HSN ID" /> */}
          </FilterBar>

          <DataTable
            columns={columns}
            data={storesData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              storesData?.meta?.pages ||
              Math.ceil(
                (storesData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={storesData?.meta?.total || 0}
            isLoading={isLoadingStores}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No stores found"
            emptyDescription="Create a store or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
