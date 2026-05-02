import * as React from "react"
import { useForm } from "react-hook-form"
import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormField, FormTextarea } from "@/components/ui/form-fields"
import { type HsnFormValues, type HsnCode } from "@/services/taxApi"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: HsnFormValues) => Promise<void> | void
  isSubmitting?: boolean
  hsn?: HsnCode | null
}

const DEFAULT_VALUES: HsnFormValues = {
  hsncode: "",
  description: "",
}

export default function HsnDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  hsn,
}: Props) {
  const { control, handleSubmit, reset } = useForm<HsnFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (open) {
      if (hsn) {
        reset({
          hsncode: hsn.hsncode,
          description: hsn.description || "",
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, hsn, reset])

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" form="hsn-form" disabled={isSubmitting}>
        {hsn ? "Update" : "Create"} HSN
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="sm"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={hsn ? "Edit HSN Code" : "Create HSN Code"}
      description="Add or update HSN codes for tax categorization."
      footer={footer}
    >
      <form
        id="hsn-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit(async (values) => {
            await onSubmit(values)
          })()
        }}
      >
        <FormField
          control={control}
          name="hsncode"
          label="HSN Code"
          placeholder="3004"
          required
        />
        <FormTextarea
          control={control}
          name="description"
          label="Description"
          placeholder="Medicaments consisting of mixed or unmixed products..."
          rows={3}
        />
      </form>
    </FormContainer>
  )
}
