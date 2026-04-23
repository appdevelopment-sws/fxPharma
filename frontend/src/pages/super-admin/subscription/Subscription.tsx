import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2, Download, ShieldAlert, Layers, Network, Cpu, Boxes } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"

import {
  INITIAL_SUBSCRIPTION_FILTERS,
  MANAGE_SUBSCRIPTION_COLUMNS,
} from "@/constants/page/super-admin/manage-subscription"
import { StatCard } from "@/components/stat-card"
import ManageSubscriptionDialog from "@/components/products/ManageSubscriptionDialog"
import { Badge } from "@/components/ui/badge"
import ExportSubscriptionModal from "@/components/shared/exportSubscriptionData"


export default function ManageSubscriptionPage() {
  const queryClient = useQueryClient()
  const drawerDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const bulkDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_SUBSCRIPTION_FILTERS)

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
  const handleBulkOpen = () => {
    bulkDisclosure.onOpen(null)
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
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "serial")?.label ||
          "#",
        render: (_, index) => {
          const currentPage = filter.page || 1;
          const perPage = filter.perPage || 10;
          return (currentPage - 1) * perPage + index + 1;
        },
      },
      {
        key: "plan_details",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "plan_details")
            ?.label || "Plan Details",
        accessor: "plan_details",
      },
      {
        key: "pricing",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "pricing")?.label ||
          "Pricing",
        accessor: "pricing",
      },
      {
        key: "usage_limits",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "usage_limits")
            ?.label || "Usage Limits",
        accessor: "usage_limits",
      },
      {
        key: "subscribers",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "subscribers")
            ?.label || "Subscribers",
        accessor: "subscribers",
      },
      {
        key: "status",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "status")?.label ||
          "Status",
        render: (row) => (
          <Badge
            variant={row.status === "ACTIVE" ? "success" : "secondary"}
          >
            {row.status}
          </Badge>
        ),
      },
      {
        key: "action",
        header:
          MANAGE_SUBSCRIPTION_COLUMNS.find((c) => c.key === "action")?.label ||
          "Actions",
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
    ];
  }, [filter.page, filter.perPage, deleteDisclosure]);
  return (
    <div className="space-y-6">
      <ManageSubscriptionDialog
        open={drawerDisclosure.isOpen}
        onClose={drawerDisclosure.onClose}
        plan={drawerDisclosure.data}
      />
      <ExportSubscriptionModal
        open={bulkDisclosure.isOpen}
        onClose={bulkDisclosure.onClose}
        plan={bulkDisclosure.data}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
        <StatCard
          title="Total Shops"
          value={239999}
          helper="From active super admin role"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard
          title="Expired
Businesses"
          value={23345}
          helper="Available sidebar entries"
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          title="Plan Subscribes"
          value={4}
          helper="Platform boundaries"
          icon={<Network className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <StatCard
          title="Total Categories"
          value="24%"
          helper="Stable operational metrics"
          icon={<Cpu className="h-4 w-4" />}
        />

      </div>



      <SectionCard
        title="Manage Subscription"
        description="Manage subscriptions for the platform."
        action={
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" onClick={() => handleOpen(null, "create")}>
              <Plus className="mr-2 size-4" />
              Create New Plan
            </Button>

            <Button type="button" variant="outline" onClick={handleBulkOpen}>
              <Download className="mr-2 size-4" />
              Export Data
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
              placeholder="Search by plan name..."
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
            emptyTitle="No subscriptions found"
            emptyDescription="Create a subscription or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
