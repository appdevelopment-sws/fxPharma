import { useEffect, useMemo } from "react"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/context/authContext"
import { queryKeys } from "@/lib/queryKeys"
import { RoleApi } from "@/services/roleApi"
import { UserApi } from "@/services/userApi"
import { BranchApi } from "@/services/branchApi"

interface UserDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  user?: any | null
}

const INITIAL_DATA = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  branchId: "",
}

export default function UserDialog({
  open,
  onClose,
  user: editingUser,
}: UserDialogProps) {
  const isEditMode = !!editingUser?.id
  const userId = editingUser?.id

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: INITIAL_DATA,
  })

  const { activeOrganizationId } = useAuth()
  const queryClient = useQueryClient()

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", activeOrganizationId],
    queryFn: () => RoleApi.getRoles({ organizationId: activeOrganizationId }),
    enabled: open && Boolean(activeOrganizationId),
  })

  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches", activeOrganizationId],
    queryFn: () =>
      BranchApi.getBranches({
        organizationId: activeOrganizationId,
        perPage: 100,
      }),
    enabled: open && Boolean(activeOrganizationId),
  })

  const roles = rolesData?.data || []
  const branches = branchesData?.data || []

  const selectedRoleId = useWatch({ control, name: "roleId" })
  const selectedRole = useMemo(
    () => roles.find((role: any) => role.id === selectedRoleId),
    [roles, selectedRoleId]
  )

  useEffect(() => {
    if (!open) {
      reset(INITIAL_DATA)
      return
    }

    if (!editingUser) {
      reset(INITIAL_DATA)
      return
    }

    const primaryMembership = editingUser.organizations?.[0]
    const branchId =
      primaryMembership?.branches?.[0]?.branchId ??
      primaryMembership?.branches?.[0]?.branch?.id ??
      ""

    reset({
      name: editingUser.name ?? "",
      email: editingUser.email ?? "",
      password: "",
      roleId: primaryMembership?.role?.id ?? "",
      branchId,
    })
  }, [editingUser, open, reset])

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        organizationId: activeOrganizationId,
        branchId:
          selectedRole?.scope != "ORGANIZATION" ? data.branchId : undefined,
      }

      return isEditMode
        ? UserApi.updateUser(userId, payload)
        : UserApi.createUser(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      })
      toast.success(`User ${isEditMode ? "updated" : "created"} successfully`)
      reset()
      onClose(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong")
    },
  })

  const onSubmit: SubmitHandler<any> = async (data) => {
    handleMutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={isEditMode ? "Edit User" : "Add New User"}
      description={
        isEditMode
          ? "Update user details and branch assignments."
          : "Create a new user account and assign them to a branch."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={handleMutation.isPending || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-dialog-form"
            disabled={handleMutation.isPending || isSubmitting}
          >
            {handleMutation.isPending || isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update User"
                : "Create User"}
          </Button>
        </div>
      }
    >
      <form
        id="user-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            label="FULL NAME"
            placeholder="e.g. John Doe"
            required
          />
          <FormField
            control={control}
            name="email"
            label="EMAIL ADDRESS"
            placeholder="e.g. john@example.com"
            inputType="email"
            required
          />
          {!isEditMode && (
            <FormField
              control={control}
              name="password"
              label="PASSWORD"
              placeholder="Min 8 characters"
              inputType="password"
              required
            />
          )}
          <FormSelectField
            control={control}
            name="roleId"
            label="ROLE"
            options={roles.map((role: any) => ({
              label: `${role.name} (${role.scope})`,
              value: role.id,
            }))}
            placeholder={isLoadingRoles ? "Loading roles..." : "Select Role"}
            required
          />
          {selectedRole ? (
            <p className="text-sm text-muted-foreground">
              {selectedRole.scope === "BRANCH"
                ? "Branch roles are only valid for the selected branch."
                : selectedRole.scope === "ORGANIZATION"
                  ? "Organization roles apply across the entire organization."
                  : "Global roles apply across all organizations and branches."}
            </p>
          ) : null}

          {selectedRole?.scope != "ORGANIZATION" ? (
            <FormSelectField
              control={control}
              name="branchId"
              label="ASSIGN BRANCH"
              options={branches.map((b: any) => ({
                label: b.branch_name || b.name,
                value: b.id,
              }))}
              placeholder={
                isLoadingBranches ? "Loading branches..." : "Select Branch"
              }
              required
            />
          ) : null}
        </div>
      </form>
    </FormContainer>
  )
}
