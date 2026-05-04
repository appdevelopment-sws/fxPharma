import * as React from "react"
import { useForm } from "react-hook-form"
import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-fields"
import type { Feature } from "@/services/featuresApi"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: Partial<Feature>) => Promise<void> | void
  isSubmitting?: boolean
  feature?: Feature | null
}

const DEFAULT_VALUES: Partial<Feature> = {
  key: "",
  name: "",
  description: "",
  module: "",
}

export default function FeatureDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  feature,
}: Props) {
  const { control, handleSubmit, reset } = useForm<Partial<Feature>>({
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (open) {
      if (feature) {
        reset({
          key: feature.key,
          name: feature.name,
          description: feature.description || "",
          module: feature.module,
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, feature, reset])

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
      <Button type="submit" form="feature-form" disabled={isSubmitting}>
        {feature ? "Update" : "Create"} Feature
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="sm"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={feature ? "Edit Feature" : "Create Feature"}
      description="Manage system features and their configurations."
      footer={footer}
    >
      <form
        id="feature-form"
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
          name="key"
          label="Feature Key"
          placeholder="e.g. USER_MANAGEMENT"
          required
        />
        <FormField
          control={control}
          name="name"
          label="Feature Name"
          placeholder="e.g. User Management"
          required
        />
        <FormField
          control={control}
          name="module"
          label="Module"
          placeholder="e.g. Users"
        />
        <FormField
          control={control}
          name="description"
          label="Description"
          placeholder="Describe the feature..."
          inputType="textarea"
        />
      </form>
    </FormContainer>
  )
}
