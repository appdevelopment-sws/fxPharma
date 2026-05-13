import { useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirmDialog"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import RoleDialog from "@/components/dialog/admin/roleDialog"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import { RoleApi } from "@/services/roleApi"
import { Badge } from "@/components/ui/badge"

import {
  INITIAL_ROLE_FILTERS,
  ROLE_COLUMNS,
} from "@/constants/page/admin/role"

export default function AdminRolePage() {
  const queryClient = useQueryClient()
  const dialogDisclosure = useDisclosure<any>()
  const deleteDisclosure = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_ROLE_FILTERS)

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: queryKeys.roles.list(filter),
    queryFn: () => RoleApi.getRoles(filter),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => RoleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.all,
      })
      deleteDisclosure.onClose()
      toast.success("Role deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete role")
    },
  })

  const handleOpen = (
    role: any = null,
    mode: "create" | "edit" = "create"
  ) => {
    dialogDisclosure.onOpen(role ? { ...role, id: role.id } : null)
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
        header: ROLE_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "name",
        header: ROLE_COLUMNS.find((c) => c.key === "name")?.label || "Role Name",
        accessor: "name",
        render: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        key: "action",
        header: ROLE_COLUMNS.find((c) => c.key === "action")?.label || "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleOpen(row, "edit")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
            {!row.isSystem && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => deleteDisclosure.onOpen(row)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ]
  }, [filter.page, filter.perPage, deleteDisclosure])

  return (
    <div className="space-y-6">
      <RoleDialog
        open={dialogDisclosure.isOpen}
        onClose={dialogDisclosure.onClose}
        role={dialogDisclosure.data}
      />
      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onClose}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${deleteDisclosure.data?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteRoleMutation.mutate(deleteDisclosure.data?.id)}
        isLoading={deleteRoleMutation.isPending}
        confirmText="delete"
        variant="danger"
        confirmationKeyword="DELETE"
      />

      <SectionCard
        title="Role Management"
        description="Manage workspace roles and their access levels."
        action={
          <Button onClick={() => handleOpen(null, "create")}>
            <Plus className="mr-2 size-4" />
            Add Role
          </Button>
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
              placeholder="Search by role name..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rolesData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              rolesData?.meta?.pages ||
              Math.ceil(
                (rolesData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={rolesData?.meta?.total || 0}
            isLoading={isLoadingRoles}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No Roles found"
            emptyDescription="Add a new Role or adjust the filters to see matching records."
            emptyIcon={<Users className="size-10" />}
          />
        </div>
      </SectionCard>
    </div>
  )
}
