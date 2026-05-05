import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
import { queryKeys } from "@/lib/queryKeys"
import InventoryApi from "@/services/inventoryApi"

interface MedicineStockDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  product?: any | null
}

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const toNullableString = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null
  return String(value)
}

const toFormValues = (product: any) => ({
  ...MEDICINE_STOCK_FORM_INITIAL_DATA,
  id: product?.id || "",
  product_name: product?.name || product?.product_name || "",
  status: product?.status || "CONTINUE",
  company: product?.manufacturer || product?.company || "",
  salt_composition: product?.saltComposition || product?.salt_composition || "",
  category: product?.category || "TAB",
  packing: product?.packing || "",
  unit_1st: product?.unit1st || product?.unit_1st || "",
  unit_2nd: product?.unit2nd || product?.unit_2nd || "",
  hsn_code: product?.hsnCode || product?.hsn_code || "",
  item_type: product?.itemType || product?.item_type || "NORMAL",
  color_type: product?.colorType || product?.color_type || "NORMAL",
  decimal: product?.decimal || "NO",
  type: product?.type || "NORMAL",
  local_tax: product?.localTax || product?.local_tax || "Taxable",
  central_tax: product?.centralTax || product?.central_tax || "Taxable",
  sgst: product?.sgst ?? "",
  cgst: product?.cgst ?? "",
  mrp: product?.mrp ?? "",
  purchase_rate: product?.purchaseRate || product?.purchase_rate || "",
  cost_unit: product?.costPerUnit || product?.cost_unit || "",
  igst: product?.igst ?? "",
  rate_a: product?.rateA || product?.rate_a || "",
  rate_b: product?.rateB || product?.rate_b || "",
  rate_c: product?.rateC || product?.rate_c || "",
  cer: product?.cer ?? "",
  minimum_qty: product?.minQty ?? product?.minimum_qty ?? "0",
  maximum_qty: product?.maxQty ?? product?.maximum_qty ?? "0",
  reorder_qty: product?.reorderQty ?? product?.reorder_qty ?? "0",
  days_limit: product?.daysLimit ?? product?.days_limit ?? "0",
  conv_stri: product?.convStri ?? product?.conv_stri ?? "",
  conv_cas: product?.convCas ?? product?.conv_cas ?? "",
  volume_discount: product?.volumeDiscount ?? product?.volume_discount ?? "",
  item_discount: product?.itemDiscount ?? product?.item_discount ?? "",
  maximum_discount: product?.maxDiscount ?? product?.maximum_discount ?? "",
  minimum_margin: product?.minMargin ?? product?.minimum_margin ?? "",
  special_discount: product?.specialDiscount ?? product?.special_discount ?? "",
  purchase_discount: product?.purchaseDiscount ?? product?.purchase_discount ?? "",
  is_narcotic: !!(product?.isNarcotic ?? product?.is_narcotic),
  is_schedule_h: !!(product?.isScheduleH ?? product?.is_schedule_h),
  is_schedule_h1: !!(product?.isScheduleH1 ?? product?.is_schedule_h1),
  hide_product: !!(product?.hideProduct ?? product?.hide_product),
  negative_stock: !!(product?.negativeStock ?? product?.negative_stock),
  edit_rates: !!(product?.editRates ?? product?.edit_rates ?? true),
})

const toApiPayload = (data: any) => ({
  name: data.product_name?.trim(),
  status: data.status || "CONTINUE",
  manufacturer: toNullableString(data.company),
  saltComposition: toNullableString(data.salt_composition),
  category: toNullableString(data.category),
  packing: toNullableString(data.packing),
  unit1st: toNullableString(data.unit_1st),
  unit2nd: toNullableString(data.unit_2nd),
  hsnCode: toNullableString(data.hsn_code),
  itemType: toNullableString(data.item_type),
  colorType: toNullableString(data.color_type),
  decimal: toNullableString(data.decimal),
  type: toNullableString(data.type),
  localTax: toNullableString(data.local_tax),
  centralTax: toNullableString(data.central_tax),
  sgst: toNumber(data.sgst),
  cgst: toNumber(data.cgst),
  igst: toNumber(data.igst),
  mrp: toNumber(data.mrp),
  purchaseRate: toNumber(data.purchase_rate),
  costPerUnit: toNumber(data.cost_unit),
  rateA: toNumber(data.rate_a),
  rateB: toNumber(data.rate_b),
  rateC: toNumber(data.rate_c),
  cer: toNumber(data.cer),
  minQty: toNumber(data.minimum_qty),
  maxQty: toNumber(data.maximum_qty),
  reorderQty: toNumber(data.reorder_qty),
  daysLimit: toNumber(data.days_limit),
  convStri: toNumber(data.conv_stri),
  convCas: toNumber(data.conv_cas),
  volumeDiscount: toNumber(data.volume_discount),
  itemDiscount: toNumber(data.item_discount),
  maxDiscount: toNumber(data.maximum_discount),
  minMargin: toNumber(data.minimum_margin),
  specialDiscount: toNumber(data.special_discount),
  purchaseDiscount: toNumber(data.purchase_discount),
  isNarcotic: !!data.is_narcotic,
  isScheduleH: !!data.is_schedule_h,
  isScheduleH1: !!data.is_schedule_h1,
  hideProduct: !!data.hide_product,
  negativeStock: !!data.negative_stock,
  editRates: !!data.edit_rates,
})

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
        reset(toFormValues(product))
      } else {
        reset(MEDICINE_STOCK_FORM_INITIAL_DATA)
      }
    }
  }, [open, product, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode
        ? InventoryApi.update(product?.id, toApiPayload(data))
        : InventoryApi.create(toApiPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all,
      })
      toast.success(
        isEditMode ? "Inventory item updated" : "Inventory item created"
      )
      reset()
      onClose(false)
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save inventory item"
      )
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
              {handleMutation.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update Medicine"
                  : "Save Medicine"}
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

            <FormField
              control={control}
              name="sgst"
              label="SGST %"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="cgst"
              label="CGST %"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="mrp"
              label="M.R.P."
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="purchase_rate"
              label="Purchase Rate"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="cost_unit"
              label="Cost / Unit"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="igst"
              label="IGST %"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="rate_a"
              label="Rate - A"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="rate_b"
              label="Rate - B"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="rate_c"
              label="Rate - C"
              inputType="number"
              step="0.01"
            />
            <FormField
              control={control}
              name="cer"
              label="C.E.R."
              inputType="number"
              step="0.01"
            />
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
                inputType="number"
              />
              <FormField
                control={control}
                name="maximum_qty"
                label="Maximum Qty"
                inputType="number"
              />
              <FormField
                control={control}
                name="reorder_qty"
                label="Reorder Qty"
                inputType="number"
              />
              <FormField
                control={control}
                name="days_limit"
                label="Days Limit"
                inputType="number"
              />
              <FormField
                control={control}
                name="conv_stri"
                label="Conv. Stri"
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="conv_cas"
                label="Conv. Cas"
                inputType="number"
                step="0.01"
              />
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
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="item_discount"
                label="Item Discount"
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="maximum_discount"
                label="Maximum Discount"
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="minimum_margin"
                label="Minimum Margin"
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="special_discount"
                label="Special Disc."
                inputType="number"
                step="0.01"
              />
              <FormField
                control={control}
                name="purchase_discount"
                label="Purc. Disc."
                inputType="number"
                step="0.01"
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
