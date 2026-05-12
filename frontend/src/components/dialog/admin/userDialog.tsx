import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { UserApi } from "@/services/userApi"
import { BranchApi } from "@/services/branchApi"
import { ROLES } from "@/lib/access"

interface UserDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  user?: any | null
}

const INITIAL_DATA = {
  name: "",
  email: "",
  password: "",
  // role: ROLES.STAFF,
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
    defaultValues: editingUser || INITIAL_DATA,
  })

  const queryClient = useQueryClient()

  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: queryKeys.branches.all,
    queryFn: () => BranchApi.getBranches(),
    enabled: open,
  })

  const branches = branchesData?.data || []

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      return isEditMode
        ? UserApi.updateUser(userId, data)
        : UserApi.createUser(data)
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
            name="role"
            label="ROLE"
            options={
              [
                // { label: "Staff", value: ROLES.STAFF },
                // { label: "Branch Admin", value: ROLES.BRANCH_ADMIN },
              ]
            }
            required
          />
          <FormSelectField
            control={control}
            name="branchId"
            label="ASSIGN BRANCH"
            options={branches.map((b: any) => ({
              label: b.branch_name,
              value: b.id,
            }))}
            placeholder={
              isLoadingBranches ? "Loading branches..." : "Select Branch"
            }
            required
          />
        </div>
      </form>
    </FormContainer>
  )
}
