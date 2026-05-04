import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import FeaturesApi, { type Feature } from "@/services/featuresApi"
import FeatureDialog from "./FeatureDialog"

const INITIAL_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

const FeatureManagementPage = () => {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()

  const { filter, handleFilter } = useSearchFilter(INITIAL_FILTERS)

  const { data: featureData, isLoading: isLoadingFeatures } = useQuery({
    queryKey: queryKeys.features.list(filter),
    queryFn: () => FeaturesApi.getFeatures(filter),
  })

  const createFeatureMutation = useMutation({
    mutationFn: (values: Partial<Feature>) => FeaturesApi.createFeature(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all })
      dialogDisclosure.onClose()
      toast.success("Feature created successfully")
    },
  })

  const updateFeatureMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: Partial<Feature>
    }) => FeaturesApi.updateFeature(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all })
      dialogDisclosure.onClose()
      toast.success("Feature updated successfully")
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: (id: string) => FeaturesApi.deleteFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all })
      deleteDisclosure.onClose()
      toast.success("Feature deleted successfully")
    },
  })

  const handleOpen = (feature: Feature | null = null) => {
    dialogDisclosure.onOpen(feature)
  }

  const handleSubmit = async (values: Partial<Feature>) => {
    if (dialogDisclosure.data?.id) {
      await updateFeatureMutation.mutateAsync({
        id: dialogDisclosure.data.id,
        values,
      })
    } else {
      await createFeatureMutation.mutateAsync(values)
    }
  }

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<Feature>[] = useMemo(
    () => [
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
        key: "key",
        header: "Feature Key",
        render: (row) => <span className="font-medium">{row.key}</span>,
      },
      {
        key: "name",
        header: "Name",
        render: (row) => row.name,
      },
      {
        key: "module",
        header: "Module",
        render: (row) => row.module,
      },
      {
        key: "description",
        header: "Description",
        render: (row) => row.description || <span className="text-muted-foreground italic">No description</span>,
      },
      {
        key: "createdAt",
        header: "Created At",
        render: (row) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>
              {format(new Date(row.createdAt || new Date()), "dd MMM yyyy")}
            </span>
          </div>
        ),
      },
      {
        key: "action",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row)}
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
    ],
    [filter.page, filter.perPage, deleteDisclosure]
  )

  return (
    <div className="space-y-6">
      <FeatureDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        onSubmit={handleSubmit}
        feature={dialogDisclosure.data}
        isSubmitting={
          createFeatureMutation.isPending || updateFeatureMutation.isPending
        }
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Feature"
        description="Are you sure you want to delete this feature? This action cannot be undone."
        onConfirm={() =>
          deleteFeatureMutation.mutate(deleteDisclosure.data!.id)
        }
        isLoading={deleteFeatureMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Features</h2>
          <p className="text-sm text-muted-foreground">
            Manage system features and modules.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 size-4" />
          Create Feature
        </Button>
      </div>

      <div className="space-y-4">
        <FilterBar
          values={{
            search: filter.search || "",
          }}
          onChange={handleFilterChange}
        >
          <FilterBar.Search
            name="search"
            placeholder="Search by key, name or module..."
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={featureData?.data || []}
          rowKey="id"
          currentPage={filter.page || 1}
          lastPage={featureData?.meta?.totalPages || 1}
          pageSize={filter.perPage || 10}
          totalRecords={featureData?.meta?.total || 0}
          isLoading={isLoadingFeatures}
          onPageChange={(page) => handleFilterChange({ page })}
          onPageSizeChange={(perPage) =>
            handleFilterChange({ perPage, page: 1 })
          }
          emptyTitle="No features found"
          emptyDescription="Create a new feature to see it listed here."
        />
      </div>
    </div>
  )
}

export default FeatureManagementPage

