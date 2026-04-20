import * as React from "react"
import { useForm } from "react-hook-form"
import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { type TaxFormValues, type TaxRate } from "@/services/taxApi"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: TaxFormValues) => Promise<void> | void
  isSubmitting?: boolean
  tax?: TaxRate | null
}

const DEFAULT_VALUES: TaxFormValues = {
  name: "",
  rate: 0,
  type: "EXCLUSIVE",
}

export default function TaxDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  tax,
}: Props) {
  const { control, handleSubmit, reset } = useForm<TaxFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (open) {
      if (tax) {
        reset({
          name: tax.name,
          rate: tax.rate,
          type: tax.type,
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, tax, reset])

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
      <Button type="submit" form="tax-form" disabled={isSubmitting}>
        {tax ? "Update" : "Create"} Tax
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="sm"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={tax ? "Edit Tax Rule" : "Create Tax Rule"}
      description="Configure tax rates and types for your products."
      footer={footer}
    >
      <form
        id="tax-form"
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
          name="name"
          label="Rule Name"
          placeholder="GST 18%"
          required
        />
        <FormField
          control={control}
          name="rate"
          label="Tax Rate (%)"
          inputType="number"
          placeholder="18"
          required
          min="0"
          step="0.01"
        />
        <FormSelectField
          control={control}
          name="type"
          label="Tax Type"
          options={[
            { label: "Inclusive", value: "INCLUSIVE" },
            { label: "Exclusive", value: "EXCLUSIVE" },
          ]}
          required
        />
      </form>
    </FormContainer>
  )
}
