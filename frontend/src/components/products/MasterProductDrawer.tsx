import * as React from "react"
import { type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-fields"
import { FormContainer } from "../formContainer"

export type MasterProductFormValues = {
  name: string
  salt: string
  barcode: string
  brand_name: string
  pack_size: string
  strength: string
  hsnCodeId: string
  company_id: string
  product_type_id: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  control: Control<MasterProductFormValues>
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  mode?: "create" | "edit" | "view"
  variant?: "drawer" | "modal" // ⭐ NEW
  isSubmitting?: boolean
  isLoading?: boolean
}

export const PRODUCT_FORM_DEFAULT_VALUES: MasterProductFormValues = {
  name: "",
  salt: "",
  barcode: "",
  brand_name: "",
  pack_size: "",
  strength: "",
  hsnCodeId: "",
  company_id: "",
  product_type_id: "",
}

const COPY = {
  create: {
    title: "Add Master Product",
    description:
      "Create a reusable master product with company, product type, and HSN references.",
    submitLabel: "Save Product",
  },
  edit: {
    title: "Edit Master Product",
    description: "Update the master product metadata and reference mappings.",
    submitLabel: "Update Product",
  },
  view: {
    title: "Product Details",
    description:
      "Review the full master product information and linked references.",
    submitLabel: "",
  },
} as const

export default function MasterProductForm({
  open,
  onOpenChange,
  control,
  onSubmit,
  mode = "create",
  variant = "drawer",
  isSubmitting = false,
  isLoading = false,
}: Props) {
  const isReadOnly = mode === "view"
  const copy = COPY[mode]

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting || isLoading}
      >
        {isReadOnly ? "Close" : "Cancel"}
      </Button>

      {!isReadOnly && (
        <Button
          type="submit"
          form="master-product-form"
          disabled={isSubmitting || isLoading}
        >
          {copy.submitLabel}
        </Button>
      )}
    </div>
  )

  return (
    <FormContainer
      variant={"modal"}
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.description}
      footer={footer}
      size="lg"
    >
      <form id="master-product-form" onSubmit={onSubmit} className="space-y-5">
        <section className="grid gap-4">
          <FormField
            control={control}
            name="name"
            label="Product Name"
            tooltip="Primary master-product name."
            placeholder="Paracetamol"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="salt"
            label="Salt"
            tooltip="Generic salt or active composition."
            placeholder="Acetaminophen"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="brand_name"
            label="Brand Name"
            placeholder="Crocin"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="barcode"
            label="Barcode"
            placeholder="8901234567890"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="pack_size"
            label="Pack Size"
            placeholder="10 tablets"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="strength"
            label="Strength"
            placeholder="500mg"
            readOnly={isReadOnly}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={control}
            name="company_id"
            label="Company ID"
            inputType="number"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="product_type_id"
            label="Product Type ID"
            inputType="number"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="hsnCodeId"
            label="HSN Code ID"
            inputType="number"
            required
            readOnly={isReadOnly}
          />
        </section>
      </form>
    </FormContainer>
  )
}
