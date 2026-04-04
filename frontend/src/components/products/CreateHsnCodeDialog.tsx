import * as React from "react"
import { useForm } from "react-hook-form"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-fields"

type CreateHsnCodeFormValues = {
  code: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateHsnCodeFormValues) => Promise<void> | void
  isSubmitting?: boolean
}

const DEFAULT_VALUES: CreateHsnCodeFormValues = {
  code: "",
}

export default function CreateHsnCodeDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const { control, handleSubmit, reset } = useForm<CreateHsnCodeFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" form="create-hsn-code-form" disabled={isSubmitting}>
        Save HSN
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="sm"
      open={open}
      onOpenChange={onOpenChange}
      title="Add HSN Code"
      description="Create a new HSN code and use it immediately in the master product form."
      footer={footer}
    >
      <form
        id="create-hsn-code-form"
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
          name="code"
          label="HSN Code"
          placeholder="30049099"
          required
        />
      </form>
    </FormContainer>
  )
}
