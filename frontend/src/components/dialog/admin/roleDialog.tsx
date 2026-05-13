import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { FormField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { RoleApi } from "@/services/roleApi"

interface RoleDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  role?: any | null
}

const INITIAL_DATA = {
  name: "",
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
        </div>
      </form>
    </FormContainer>
  )
}
