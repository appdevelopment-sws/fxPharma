import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { UNIT_FORM_INITIAL_DATA } from "@/constants/page/super-admin/unit"

interface Props {
  open: boolean
  onClose: (open: boolean) => void
  unit?: any | null
}

export default function UnitDialog({ open, onClose, unit }: Props) {
  const isViewMode = !!unit?.viewMode
  const isEditMode = !!unit?.id
  const unitId = unit?.id

  const { control, handleSubmit, reset } = useForm({
    defaultValues: UNIT_FORM_INITIAL_DATA,
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...UNIT_FORM_INITIAL_DATA,
          name: unit?.name || "",
          short_name: unit?.short_name || "",
          status: unit?.status || "ACTIVE",
        })
      } else {
        reset(UNIT_FORM_INITIAL_DATA)
      }
    }
  }, [open, unit])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode ? UnitApi.updateUnit(unitId, data) : UnitApi.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.all,
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    mutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={onClose}
      title={isViewMode ? "View Unit" : isEditMode ? "Edit Unit" : "Add Unit"}
      description="Manage unit details"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button type="submit" form="unit-form">
              {isEditMode ? "Update" : "Save"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="unit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={control}
          name="name"
          label="UNIT NAME"
          placeholder="e.g. Tablet, Strip"
          required
          readOnly={isViewMode}
        />

        <FormField
          control={control}
          name="short_name"
          label="SHORT NAME"
          placeholder="e.g. TAB, STR"
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
      </form>
    </FormContainer>
  )
}
