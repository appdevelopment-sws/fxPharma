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
import ProductApi, { type MasterProduct } from "@/services/masterProductApi"

import {
    INITIAL_MEDICINE_STOCK_FILTERS,
    MEDICINE_STOCK_COLUMNS,
} from "@/constants/page/admin/inventory"
import { StatCard } from "@/components/stat-card"
import ManageSubscriptionDialog from "@/components/dialog/ManageSubscriptionDialog"
import { Badge } from "@/components/ui/badge"
import ExportSubscriptionModal from "@/components/shared/exportSubscriptionData"
import { INITIAL_SUBSCRIPTION_FILTERS } from "@/constants/page/super-admin/manage-subscription"
import AddMedicineDialog from "@/components/dialog/admin/AddMedicineDialog"
import NewCompoundDialog from "@/components/dialog/admin/NewCompoundDialog"
import InterStoreTransfer from "@/components/dialog/admin/InterStoreTransfer"

export default function AllInventoryPage() {
    const queryClient = useQueryClient()
    const drawerDisclosure = useDisclosure<any>()
    const deleteDisclosure = useDisclosure<any>()
    const interstoreTransferDisclosure = useDisclosure<any>()
    const compoundDisclosure = useDisclosure<any>()
    const { filter, handleFilter } = useSearchFilter(INITIAL_MEDICINE_STOCK_FILTERS)

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
    const handleCompoundOpen = () => {
        compoundDisclosure.onOpen(null)
    }

    const handleInterstoreTransferOpen = () => {
        interstoreTransferDisclosure.onOpen(null)
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
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "serial")?.label || "#",
                render: (_, index) => {
                    const currentPage = filter.page || 1
                    const perPage = filter.perPage || 10
                    return (currentPage - 1) * perPage + index + 1
                },
            },

            {
                key: "medicine_salt",
                header:
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "medicine_salt")?.label ||
                    "Medicine & Salt",
                accessor: "medicine_salt",
            },

            {
                key: "category",
                header:
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "category")?.label ||
                    "Category",
                accessor: "category",
            },

            {
                key: "total_stock",
                header:
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "total_stock")?.label ||
                    "Total Stock",
                accessor: "total_stock",
            },

            {
                key: "batches",
                header:
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "batches")?.label ||
                    "Batches",
                accessor: "batches",
            },

            {
                key: "action",
                header:
                    MEDICINE_STOCK_COLUMNS.find((c) => c.key === "action")?.label ||
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
        ]
    }, [filter.page, filter.perPage, deleteDisclosure])
    return (
        <div className="space-y-6">
            <AddMedicineDialog
                open={drawerDisclosure.isOpen}
                onClose={drawerDisclosure.onClose}
                product={drawerDisclosure.data}
            />
            <NewCompoundDialog
                open={compoundDisclosure.isOpen}
                onClose={compoundDisclosure.onClose}
                compound={compoundDisclosure.data}
            />

            <InterStoreTransfer
                open={interstoreTransferDisclosure.isOpen}
                onClose={interstoreTransferDisclosure.onClose}
                product={interstoreTransferDisclosure.data}
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
                title="All Inventory"
                description="Manage the inventory levels    ."
                action={
                    <div className="flex items-center justify-center gap-x-3">
                        <Button type="button" onClick={() => handleOpen(null, "create")}>
                            <Plus className="mr-2 size-4" />
                            Add Medicine
                        </Button>

                        <Button type="button" variant="outline" onClick={() => handleCompoundOpen()}>
                            <Plus className="mr-2 size-4" />
                            New Compound RX
                        </Button>

                        <Button type="button" variant="outline" onClick={handleInterstoreTransferOpen}>
                            <Plus className="mr-2 size-4" />
                            Inter Store Transfer
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
                            placeholder="Search medicine name, HSN code, batch or strip..."
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
