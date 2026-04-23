import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { MANUFACTURER_FORM_INITIAL_DATA } from "@/constants/page/super-admin/manufracturer"

interface Props {
  open: boolean
  onClose: (open: boolean) => void
  manufacturer?: any | null
}

export default function ManufacturerDialog({
  open,
  onClose,
  manufacturer,
}: Props) {
  const isViewMode = !!manufacturer?.viewMode
  const isEditMode = !!manufacturer?.id
  const manufacturerId = manufacturer?.id

  const { control, handleSubmit, reset } = useForm({
    defaultValues: MANUFACTURER_FORM_INITIAL_DATA,
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...MANUFACTURER_FORM_INITIAL_DATA,
          name: manufacturer?.name || "",
          email: manufacturer?.email || "",
          phone: manufacturer?.phone || "",
          address: manufacturer?.address || "",
          status: manufacturer?.status || "ACTIVE",
        })
      } else {
        reset(MANUFACTURER_FORM_INITIAL_DATA)
      }
    }
  }, [open, manufacturer])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode
        ? ManufacturerApi.updateManufacturer(manufacturerId, data)
        : ManufacturerApi.createManufacturer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.manufacturers.all,
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
      title={
        isViewMode
          ? "View Manufacturer"
          : isEditMode
            ? "Edit Manufacturer"
            : "Add Manufacturer"
      }
      description="Manage manufacturer details"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button type="submit" form="manufacturer-form">
              {isEditMode ? "Update" : "Save"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="manufacturer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={control}
          name="name"
          label="MANUFACTURER NAME"
          required
          readOnly={isViewMode}
        />

        <FormField
          control={control}
          name="email"
          label="EMAIL ADDRESS"
          readOnly={isViewMode}
        />

        <FormField
          control={control}
          name="phone"
          label="PHONE NUMBER"
          readOnly={isViewMode}
        />

        <FormField
          control={control}
          name="address"
          label="ADDRESS"
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
