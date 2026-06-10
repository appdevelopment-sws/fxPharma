import { useCallback, useMemo } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Pencil, Plus, Trash, Trash2 } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import SectionCard from "@/components/SectionCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import UserDialog from "@/components/dialog/admin/userDialog"
import { useAuth } from "@/context/authContext"
import { FilterBar } from "@/components/filter-bar"
import { useDisclosure } from "@/hooks/useDisclosure"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import { UserApi } from "@/services/userApi"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/confirmDialog"
import { queryClient } from "@/services/customQueryClient"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  perPage: 10,
}

export default function AdminProfilePage() {
  const { user, activeOrganizationId } = useAuth()
  const userDialog = useDisclosure<any>()
  const { filter, handleFilter } = useSearchFilter(INITIAL_FILTERS)
  const deleteConfirm = useDisclosure<any>()
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => UserApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      deleteConfirm.onClose()
    },
  })
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: queryKeys.users.list({
      organizationId: activeOrganizationId,
      page: filter.page,
      limit: filter.perPage,
      search: filter.search,
    }),
    queryFn: () =>
      UserApi.getUsers({
        page: filter.page,
        limit: filter.perPage,
        search: filter.search,
      }),
    enabled: Boolean(user?.id && activeOrganizationId),
  })

  const users = usersResponse?.data || []
  const totalUsers = usersResponse?.meta?.total || 0
  const totalPages =
    usersResponse?.meta?.totalPages ||
    Math.ceil(totalUsers / (filter.perPage || 10)) ||
    1

  const handleOpen = useCallback(
    (selectedUser: any = null) => {
      userDialog.onOpen(selectedUser ? { ...selectedUser } : null)
    },
    [userDialog]
  )

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: updates.page ?? 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "serial",
        header: "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
        className: "w-16",
      },
      {
        key: "name",
        header: "Name",
        render: (row) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (row) => {
          const membership = row.organizations?.[0]
          return (
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {membership?.role?.name ?? membership?.role?.key ?? "Unassigned"}
            </Badge>
          )
        },
      },
      {
        key: "branches",
        header: "Assigned Branch",
        render: (row) => {
          const branchLinks = row.organizations?.[0]?.branches ?? []
          const branchNames = branchLinks
            .map((link: any) => link.branch?.name || link.branch?.branch_name)
            .filter(Boolean)

          if (!branchNames.length) {
            return (
              <span className="text-sm text-muted-foreground">No branch</span>
            )
          }

          return (
            <div className="flex flex-wrap gap-2">
              {branchNames.map((branchName: string) => (
                <Badge
                  key={branchName}
                  variant="outline"
                  className="rounded-full"
                >
                  {branchName}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        key: "status",
        header: "Status",
        render: (row) => {
          const status = row.organizations?.[0]?.status ?? row.status
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {status ?? "Unknown"}
            </span>
          )
        },
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
              onClick={() => deleteConfirm.onOpen(row)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [filter.page, filter.perPage, handleOpen]
  )

  return (
    <div className="space-y-6">
      <UserDialog
        open={userDialog.isOpen}
        onClose={userDialog.onClose}
        user={userDialog.data}
      />
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.onClose}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${deleteConfirm.data?.invoice_id}? This will also delete any associated returns and revert stock changes.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
        onConfirm={() => {
          if (deleteConfirm.data) {
            deleteUserMutation.mutate(deleteConfirm.data.id)
          }
        }}
      />
      <SectionCard
        title="Organization Users"
        description="Create, edit, and review every user in the active organization with their assigned branch access."
        action={
          <Button onClick={() => handleOpen(null)}>
            <Plus className="mr-2 size-4" />
            Add User
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
            }}
            onChange={(updates) =>
              handleFilterChange({
                ...updates,
                page: 1,
              })
            }
          >
            <FilterBar.Search
              name="search"
              className="w-full md:w-[320px]"
              placeholder="Search users by name, email, or phone..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={users}
            rowKey="id"
            isLoading={isLoading}
            currentPage={filter.page || 1}
            lastPage={totalPages}
            pageSize={filter.perPage || 10}
            totalRecords={totalUsers}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No users found"
            emptyDescription="Add a new user or adjust the search filter to find matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
