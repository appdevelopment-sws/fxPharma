import * as React from "react"
import { type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import AppDrawer from "@/components/ui/app-drawer"
import { FormField } from "@/components/ui/form-fields"

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

type MasterProductDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  control: Control<MasterProductFormValues>
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  mode?: "create" | "edit" | "view"
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

const DRAWER_COPY = {
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

export default function MasterProductDrawer({
  open,
  onOpenChange,
  control,
  onSubmit,
  mode = "create",
  isSubmitting = false,
  isLoading = false,
}: MasterProductDrawerProps) {
  const isReadOnly = mode === "view"
  const drawerCopy = DRAWER_COPY[mode]

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerCopy.title}
      description={drawerCopy.description}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly ? (
            <Button
              type="submit"
              form="master-product-form"
              disabled={isSubmitting || isLoading}
            >
              {drawerCopy.submitLabel}
            </Button>
          ) : null}
        </div>
      }
    >
      <form id="master-product-form" onSubmit={onSubmit} className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-1">
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
            tooltip="Optional market-facing brand name."
            placeholder="Crocin"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="barcode"
            label="Barcode"
            tooltip="Optional barcode if available."
            placeholder="8901234567890"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="pack_size"
            label="Pack Size"
            tooltip="Packaging format like 10 tablets or 100 ml."
            placeholder="10 tablets"
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="strength"
            label="Strength"
            tooltip="Product strength like 500mg."
            placeholder="500mg"
            readOnly={isReadOnly}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={control}
            name="company_id"
            label="Company ID"
            tooltip="Numeric company reference from the backend."
            inputType="number"
            min="1"
            step="1"
            placeholder="1"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="product_type_id"
            label="Product Type ID"
            tooltip="Numeric product type reference from the backend."
            inputType="number"
            min="1"
            step="1"
            placeholder="1"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="hsnCodeId"
            label="HSN Code ID"
            tooltip="Numeric HSN code reference from the backend."
            inputType="number"
            min="1"
            step="1"
            placeholder="1"
            required
            readOnly={isReadOnly}
          />
        </section>
      </form>
    </AppDrawer>
  )
}
