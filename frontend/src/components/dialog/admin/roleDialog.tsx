import React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { PermissionMultiSelectField } from "@/components/ui/permission-multi-select"
import StoreListApi from "@/services/storelistApi"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { useAuth } from "@/context/authContext"
import { RoleApi } from "@/services/roleApi"

interface RoleDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  role?: any | null
}

const INITIAL_DATA = {
  name: "",
  key: "",
  scope: "ORGANIZATION",
  organizationId: "",
  permissions: [] as string[],
}

export default function RoleDialog({
  open,
  onClose,
  role: editingRole,
}: RoleDialogProps) {
  const isEditMode = !!editingRole?.id
  const roleId = editingRole?.id

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: editingRole || INITIAL_DATA,
  })

  const { user, activeOrganizationId, isSuperAdmin } = useAuth()

  const { data: metaData } = useQuery({
    queryKey: ["storelist", "meta"],
    queryFn: () => StoreListApi.getStoreFormMeta(),
    staleTime: 1000 * 60 * 5,
  })

  const { data: storesData } = useQuery({
    queryKey: ["stores", "list"],
    queryFn: () => StoreListApi.getStores({ perPage: 100 }),
    staleTime: 1000 * 60 * 5,
  })

  const allowedPermissionKeys = user?.permissions ?? []

  // Only show permissions that the current user already has
  const permissionOptions = (metaData?.data?.permissions || [])
    .filter((p: any) => allowedPermissionKeys.includes(p.key))
    .map((p: any) => ({
      value: p.key,
      label: p.name,
      description: p.description || undefined,
    }))

  // Limit organization options to active organization for regular users
  const allOrgs = (storesData?.data || []).map((s: any) => ({
    label: s.store_name || s.storeName || s.name,
    value: s.id,
  }))

  const organizationOptions = isSuperAdmin
    ? allOrgs
    : allOrgs.filter((o) => o.value === activeOrganizationId)

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      // Auto-generate key from name if not present
      const payload = {
        ...data,
        key: data.key || data.name.toUpperCase().replace(/\s+/g, "_"),
        scope: data.scope || "ORGANIZATION",
      }
      return isEditMode
        ? RoleApi.updateRole(roleId, payload)
        : RoleApi.createRole(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.all,
      })
      toast.success(`Role ${isEditMode ? "updated" : "created"} successfully`)
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

  // Ensure form defaults respect current user's allowed permissions and active org
  React.useEffect(() => {
    if (!metaData) return

    if (editingRole) {
      const sanitizedPermissions = (editingRole.permissions || []).filter(
        (p: string) => allowedPermissionKeys.includes(p)
      )

      reset({
        ...editingRole,
        permissions: sanitizedPermissions,
        organizationId:
          editingRole.organizationId || activeOrganizationId || "",
      })
    } else {
      reset({ ...INITIAL_DATA, organizationId: activeOrganizationId || "" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaData, user, open])

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={isEditMode ? "Edit Role" : "Add New Role"}
      description={
        isEditMode
          ? "Update role details."
          : "Create a new role for your organization."
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
            form="role-dialog-form"
            disabled={handleMutation.isPending || isSubmitting}
          >
            {handleMutation.isPending || isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Role"
                : "Create Role"}
          </Button>
        </div>
      }
    >
      <form
        id="role-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6">
          <FormField
            control={control}
            name="name"
            label="ROLE NAME"
            placeholder="e.g. Finance"
            required
          />
          {/* <FormField
            control={control}
            name="key"
            label="ROLE KEY"
            placeholder="e.g. FINANCE"
            readOnly={false}
          /> */}

          {/* <FormSelectField
            control={control}
            name="scope"
            label="SCOPE"
            options={[
              { label: "Organization", value: "ORGANIZATION" },
              { label: "Branch", value: "BRANCH" },
              { label: "Global", value: "GLOBAL" },
            ]}
          /> */}

          {/* Organization selector shown when scope is ORGANIZATION or BRANCH */}
          {/* <FormSelectField
            control={control}
            name="organizationId"
            label="Organization"
            options={organizationOptions}
            placeholder="Select organization"
          /> */}

          <PermissionMultiSelectField
            control={control}
            name="permissions"
            label="Permissions"
            description="Select permissions granted to this role"
            options={permissionOptions}
            selectAllLabel="Select all permissions"
          />
        </div>
      </form>
    </FormContainer>
  )
}
