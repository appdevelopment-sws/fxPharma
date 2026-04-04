import * as React from "react"
import { type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import AppDrawer from "@/components/ui/app-drawer"
import {
  FormField,
  FormSelectField,
  FormTextarea,
} from "@/components/ui/form-fields"

export type MasterProductFormValues = {
  name: string
  genericName: string
  category: string
  manufacturer: string
  unit: string
  sku: string
  purchasePrice: string
  sellingPrice: string
  stock: string
  reorderLevel: string
  status: "active" | "inactive"
  description: string
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

export const PRODUCT_CATEGORY_OPTIONS = [
  { label: "Tablet", value: "Tablet" },
  { label: "Capsule", value: "Capsule" },
  { label: "Syrup", value: "Syrup" },
  { label: "Drops", value: "Drops" },
  { label: "Injection", value: "Injection" },
]

export const PRODUCT_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export const PRODUCT_FORM_DEFAULT_VALUES: MasterProductFormValues = {
  name: "",
  genericName: "",
  category: "Tablet",
  manufacturer: "",
  unit: "",
  sku: "",
  purchasePrice: "",
  sellingPrice: "",
  stock: "",
  reorderLevel: "",
  status: "active",
  description: "",
}

const DRAWER_COPY = {
  create: {
    title: "Add Master Product",
    description:
      "Create a reusable master product entry with pricing, stock thresholds, and manufacturer details.",
    submitLabel: "Save Product",
  },
  edit: {
    title: "Edit Master Product",
    description:
      "Update product details, pricing, and stock controls without leaving the listing page.",
    submitLabel: "Update Product",
  },
  view: {
    title: "Product Details",
    description:
      "Review the full master product information, including inventory settings and pricing data.",
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
        <section className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            label="Product Name"
            placeholder="Paracetamol 500mg"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="genericName"
            label="Generic Name"
            placeholder="Acetaminophen"
            readOnly={isReadOnly}
          />

          <FormSelectField
            control={control}
            name="category"
            label="Category"
            options={PRODUCT_CATEGORY_OPTIONS}
            disabled={isReadOnly}
          />

          <FormField
            control={control}
            name="manufacturer"
            label="Manufacturer"
            placeholder="MediCore Labs"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="unit"
            label="Unit"
            placeholder="Box of 10 tablets"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="sku"
            label="SKU"
            placeholder="PCM-500-TAB"
            required
            readOnly={isReadOnly}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="purchasePrice"
            label="Purchase Price"
            inputType="number"
            min="0"
            step="0.01"
            placeholder="2.25"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="sellingPrice"
            label="Selling Price"
            inputType="number"
            min="0"
            step="0.01"
            placeholder="3.75"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="stock"
            label="Opening Stock"
            inputType="number"
            min="0"
            step="1"
            placeholder="120"
            required
            readOnly={isReadOnly}
          />

          <FormField
            control={control}
            name="reorderLevel"
            label="Reorder Level"
            inputType="number"
            min="0"
            step="1"
            placeholder="25"
            required
            readOnly={isReadOnly}
          />

          <FormSelectField
            control={control}
            name="status"
            label="Status"
            options={PRODUCT_STATUS_OPTIONS}
            disabled={isReadOnly}
          />
        </section>

        <FormTextarea
          control={control}
          name="description"
          label="Description"
          placeholder="Add packaging notes, strengths, or storage instructions."
          readOnly={isReadOnly}
          rows={5}
        />
      </form>
    </AppDrawer>
  )
}
