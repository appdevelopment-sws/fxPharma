import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormSwitch,
} from "@/components/ui/form-fields"

import sectionHeader from "@/components/sectionHeader"
import {
  CATEGORY_OPTIONS,
  MEDICINE_STOCK_FORM_INITIAL_DATA,
  NORMAL_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  TAX_OPTIONS,
  YES_NO_OPTIONS,
} from "@/constants/page/admin/inventory"

interface MedicineStockDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  product?: any | null
}

export default function MedicineStockDialog({
  open,
  onClose,
  product,
}: MedicineStockDialogProps) {
  const isViewMode = !!product?.viewMode
  const isEditMode = !!product?.id

  const { handleSubmit, control, reset } = useForm({
    defaultValues: MEDICINE_STOCK_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...MEDICINE_STOCK_FORM_INITIAL_DATA,
          ...product,
        })
      } else {
        reset(MEDICINE_STOCK_FORM_INITIAL_DATA)
      }
    }
  }, [open, product, reset])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (data: any) => data,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicine-stock"],
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    handleMutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={
        isViewMode
          ? "View Product"
          : isEditMode
            ? "Edit Product"
            : "Create Product"
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button
              type="submit"
              form="medicine-stock-form"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="medicine-stock-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Product Identification */}
        <div className="rounded-xl border p-6">
          {sectionHeader("01", "Product Identification")}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              control={control}
              name="product_name"
              label="Product Name"
              required
              readOnly={isViewMode}
            />

            <FormSelectField
              control={control}
              name="status"
              label="Status"
              options={PRODUCT_STATUS_OPTIONS}
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="company"
              label="Company / Manufacturer"
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="salt_composition"
              label="Salt Composition"
              readOnly={isViewMode}
            />

            <FormSelectField
              control={control}
              name="category"
              label="Category"
              options={CATEGORY_OPTIONS}
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* Classification */}
        <div className="rounded-xl border p-6">
          {sectionHeader("02", "Classification & Units")}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField control={control} name="packing" label="Packing" />
            <FormField control={control} name="unit_1st" label="Unit 1st" />
            <FormField control={control} name="unit_2nd" label="Unit 2nd" />
            <FormField control={control} name="hsn_code" label="HSN / SAC" />

            <FormSelectField
              control={control}
              name="item_type"
              label="Item Type"
              options={NORMAL_OPTIONS}
            />

            <FormSelectField
              control={control}
              name="color_type"
              label="Color Type"
              options={NORMAL_OPTIONS}
            />

            <FormSelectField
              control={control}
              name="decimal"
              label="Decimal"
              options={YES_NO_OPTIONS}
            />

            <FormSelectField
              control={control}
              name="type"
              label="Type"
              options={NORMAL_OPTIONS}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border p-6">
          {sectionHeader("03", "Pricing & Taxation")}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormSelectField
              control={control}
              name="local_tax"
              label="Local Tax"
              options={TAX_OPTIONS}
            />

            <FormSelectField
              control={control}
              name="central_tax"
              label="Central Tax"
              options={TAX_OPTIONS}
            />

            <FormField control={control} name="sgst" label="SGST %" />
            <FormField control={control} name="cgst" label="CGST %" />
            <FormField control={control} name="mrp" label="M.R.P." />
            <FormField
              control={control}
              name="purchase_rate"
              label="Purchase Rate"
            />
            <FormField control={control} name="cost_unit" label="Cost / Unit" />
            <FormField control={control} name="igst" label="IGST %" />
            <FormField control={control} name="rate_a" label="Rate - A" />
            <FormField control={control} name="rate_b" label="Rate - B" />
            <FormField control={control} name="rate_c" label="Rate - C" />
            <FormField control={control} name="cer" label="C.E.R." />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Inventory */}
          <div className="rounded-xl border p-6">
            {sectionHeader("04", "Inventory Thresholds")}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={control}
                name="minimum_qty"
                label="Minimum Qty"
              />
              <FormField
                control={control}
                name="maximum_qty"
                label="Maximum Qty"
              />
              <FormField
                control={control}
                name="reorder_qty"
                label="Reorder Qty"
              />
              <FormField
                control={control}
                name="days_limit"
                label="Days Limit"
              />
              <FormField
                control={control}
                name="conv_stri"
                label="Conv. Stri"
              />
              <FormField control={control} name="conv_cas" label="Conv. Cas" />
            </div>
          </div>

          {/* Discount */}
          <div className="rounded-xl border p-6">
            {sectionHeader("05", "Discounts & Margins")}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={control}
                name="volume_discount"
                label="Volume Discount"
              />
              <FormField
                control={control}
                name="item_discount"
                label="Item Discount"
              />
              <FormField
                control={control}
                name="maximum_discount"
                label="Maximum Discount"
              />
              <FormField
                control={control}
                name="minimum_margin"
                label="Minimum Margin"
              />
              <FormField
                control={control}
                name="special_discount"
                label="Special Disc."
              />
              <FormField
                control={control}
                name="purchase_discount"
                label="Purc. Disc."
              />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="rounded-xl border p-6">
          {sectionHeader("06", "Regulatory & Product Flags")}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <FormSwitch
              control={control}
              name="is_narcotic"
              label="Narcotic Drug"
              description="Requires special tracking"
            />

            <FormSwitch
              control={control}
              name="is_schedule_h"
              label="Schedule H"
              description="Prescription required"
            />

            <FormSwitch
              control={control}
              name="is_schedule_h1"
              label="Schedule H1"
              description="Strict audit logging"
            />

            <FormSwitch
              control={control}
              name="hide_product"
              label="Hide Product"
              description="Exclude from fast search"
            />

            <FormSwitch
              control={control}
              name="negative_stock"
              label="Negative Stock"
              description="Allow billing without stock"
            />

            <FormSwitch
              control={control}
              name="edit_rates"
              label="Edit Rates"
              description="Enable rate modification"
            />
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
