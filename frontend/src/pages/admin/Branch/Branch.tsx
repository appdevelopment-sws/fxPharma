import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import BranchDialog from "@/components/dialog/admin/branchDialog"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import { StatusBadge } from "@/components/ui/badge-status"
import { BranchApi } from "@/services/branchApi"

import {
  INITIAL_BRANCHES_FILTERS,
  BRANCHES_COLUMNS,
} from "@/constants/page/admin/branch"

export default function Branch() {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_BRANCHES_FILTERS)

  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    // @ts-ignore
    queryKey: queryKeys.branches?.list(filter) || ["branches", filter],
    queryFn: () => BranchApi.getBranches(filter),
  })

  const deleteBranchMutation = useMutation({
    mutationFn: (id: string) => BranchApi.deleteBranch(id),
    onSuccess: () => {
      // @ts-ignore
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches?.all || ["branches"],
      })
      deleteDisclosure.onClose()
      toast.success("Branch deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete branch")
    },
  })

  const handleOpen = (
    branch: any = null,
    mode: "create" | "edit" | "view" = "create"
  ) => {
    dialogDisclosure.onOpen(
      branch ? { ...branch, id: branch.id, viewMode: mode === "view" } : null
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
        header: BRANCHES_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "branch_name",
        header:
          BRANCHES_COLUMNS.find((c) => c.key === "branch_name")?.label ||
          "Branch Name",
        accessor: "branch_name",
      },
      {
        key: "address",
        header:
          BRANCHES_COLUMNS.find((c) => c.key === "address")?.label || "Address",
        render: (row) => {
          if (!row.address) return ""
          try {
            const parsed = JSON.parse(row.address)
            if (parsed && typeof parsed === "object") {
              return [
                parsed.streetAddress,
                parsed.city,
                parsed.state,
                parsed.zipCode,
                parsed.country,
              ]
                .filter(Boolean)
                .join(", ")
            }
          } catch {
            // Not a JSON string
          }
          return row.address
        },
      },
      {
        key: "status",
        header:
          BRANCHES_COLUMNS.find((c) => c.key === "status")?.label || "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "action",
        header:
          BRANCHES_COLUMNS.find((c) => c.key === "action")?.label || "Actions",
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
      <BranchDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        branch={dialogDisclosure.data}
      />
      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deleteDisclosure.data?.branch_name}"? This action cannot be undone.`}
        onConfirm={() => deleteBranchMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteBranchMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Branches"
        description="Manage your store branches."
        action={
          <div className="flex items-center justify-center gap-x-3">
            <Button type="button" onClick={() => handleOpen(null, "create")}>
              <Plus className="mr-2 size-4" />
              Add Branch
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search by branch name..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={branchesData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              branchesData?.meta?.pages ||
              branchesData?.meta?.totalPages ||
              Math.ceil(
                (branchesData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={branchesData?.meta?.total || 0}
            isLoading={isLoadingBranches}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No Branches found"
            emptyDescription="Add a new Branch or adjust the filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
