import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { BRANCH_FORM_INITIAL_DATA } from "@/constants/page/admin/branch"
import { BranchApi } from "@/services/branchApi"

interface BranchDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  branch?: any | null
}

export default function BranchDialog({
  open,
  onClose,
  branch,
}: BranchDialogProps) {
  const isViewMode = !!branch?.viewMode
  const isEditMode = !!branch?.id
  const branchId = branch?.id

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: BRANCH_FORM_INITIAL_DATA,
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          branch_name: branch?.branch_name || branch?.name || "",
          code: branch?.code || "",
          address: branch?.address || "",
          phone: branch?.phone || "",
          email: branch?.email || "",
          status:
            branch?.status || (branch?.isActive === false ? "INACTIVE" : "ACTIVE"),
        })
      } else {
        reset(BRANCH_FORM_INITIAL_DATA)
      }
    }
  }, [open, branch, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      return isEditMode
        ? BranchApi.updateBranch(branchId, data)
        : BranchApi.createBranch(data)
    },
    onSuccess: () => {
      // @ts-ignore - queryKeys.branches might not be defined yet
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches?.all || ["branches"],
      })
      toast.success(
        `Branch ${isEditMode ? "updated" : "created"} successfully`
      )
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
      title={
        isViewMode
          ? "View Branch"
          : isEditMode
            ? "Edit Branch"
            : "Add Branch"
      }
      description={
        isViewMode
          ? "Viewing branch details."
          : isEditMode
            ? "Update branch details."
            : "Create a new branch record."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={handleMutation.isPending || isSubmitting}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="branch-dialog-form"
              disabled={handleMutation.isPending || isSubmitting}
            >
              {handleMutation.isPending || isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Branch"
                  : "Save Branch"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="branch-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6">
          <FormField
            control={control}
            name="branch_name"
            label="BRANCH NAME"
            placeholder="e.g. Downtown Pharmacy"
            required
            readOnly={isViewMode}
          />
          <FormField
            control={control}
            name="code"
            label="BRANCH CODE"
            placeholder="e.g. DT-001"
            readOnly={isViewMode}
          />
          <FormField
            control={control}
            name="address"
            label="ADDRESS"
            placeholder="e.g. 123 Main St, City"
            readOnly={isViewMode}
            required
          />
          <FormField
            control={control}
            name="phone"
            label="PHONE"
            placeholder="e.g. +91 98765 43210"
            readOnly={isViewMode}
          />
          <FormField
            control={control}
            name="email"
            label="EMAIL"
            placeholder="e.g. branch@example.com"
            inputType="email"
            readOnly={isViewMode}
          />
          <FormSelectField
            control={control}
            name="status"
            label="STATUS"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
            readOnly={isViewMode}
          />
        </div>
      </form>
    </FormContainer>
  )
}
