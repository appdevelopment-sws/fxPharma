import { useEffect, useRef, useState } from "react"
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Upload, Camera, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi from "@/services/masterProductApi"
import { uploadApi } from "@/services/uploadApi"
import { useSearchSelect } from "@/hooks/useSearchSelect"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormSwitch,
  FormSearchSelect,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { HsnApi } from "@/services/taxApi"
import BrandApi, {
  CategoryApi,
  ManufacturerApi,
  UnitApi,
} from "@/services/attributesApi"
import {
  MASTER_PRODUCT_FORM_INITIAL_DATA,
  INDUSTRY_SEGMENT_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  COLOR_TYPE_OPTIONS,
} from "@/constants/page/super-admin/master-products"
import sectionHeader from "../sectionHeader"

interface MasterProductDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  product?: any | null
}

export default function MasterProductDialog({
  open,
  onClose,
  product,
}: MasterProductDialogProps) {
  const isViewMode = !!product?.viewMode
  const isEditMode = !!product?.id
  const productId = product?.id

  // Centralized search selects
  const hsn = useSearchSelect(
    queryKeys.hsnCodes.all,
    (search) => HsnApi.getHsnCodes({ search }),
    (data) =>
      (data?.data || []).map((hsn: any) => ({
        label: `${hsn.hsncode} - ${hsn.description || ""}`,
        value: String(hsn.id),
      })),
    open
  )

  const category = useSearchSelect(
    ["categories"],
    (search) => CategoryApi.getCategories({ search }),
    (data) =>
      (data?.data || []).map((cat: any) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    open
  )

  const brand = useSearchSelect(
    ["brands"],
    (search) => BrandApi.getBrands({ search }),
    (data) =>
      (data?.data || []).map((b: any) => ({
        label: b.name,
        value: String(b.id),
      })),
    open
  )

  const manufacturer = useSearchSelect(
    ["manufacturers"],
    (search) => ManufacturerApi.getManufacturers({ search }),
    (data) =>
      (data?.data || []).map((m: any) => ({
        label: m.name,
        value: String(m.id),
      })),
    open
  )

  const categoryType = useSearchSelect(
    ["units"],
    (search) => UnitApi.getUnits({ search }),
    (data) =>
      (data?.data || []).map((u: any) => ({
        label: u.name,
        value: u.shortName || u.name,
      })),
    open
  )

  const { handleSubmit, control, reset, watch, setValue } = useForm({
    defaultValues: MASTER_PRODUCT_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  const [isUploading, setIsUploading] = useState(false)

  const { fields, append, remove } = useFieldArray({
    control,
    name: "barcodes",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...MASTER_PRODUCT_FORM_INITIAL_DATA,
          name: product?.name || "",
          industry_segment: product?.industrySegment || product?.industry_segment || "1",
          category_id: product?.categoryId || product?.category_id || "",
          brand_id: product?.brandId || product?.brand_id || "",
          manufacturer_id: product?.manufacturerId || product?.manufacturer_id || "",
          salt: product?.salt || "",
          category_type: product?.categoryType || product?.category_type || "TAB",
          status: product?.status || "CONTINUE",
          hsn_code_id: String(product?.hsnId || product?.hsn_code_id || ""),
          color_type: product?.colorType || product?.color_type || "NORMAL",
          is_narcotic: !!(product?.isNarcotic ?? product?.is_narcotic),
          is_schedule_h: !!(product?.isScheduleH ?? product?.is_schedule_h),
          is_schedule_h1: !!(product?.isScheduleH1 ?? product?.is_schedule_h1),
          barcodes: product?.barcodes?.length 
            ? product.barcodes.map((b: any) => ({ value: b.value }))
            : [{ value: "" }],
          image_url: product?.imageUrl || product?.image_url || null,
        })
      } else {
        reset(MASTER_PRODUCT_FORM_INITIAL_DATA)
      }
    }
  }, [open, product, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: (submitData: any) =>
      isEditMode
        ? ProductApi.updateProduct(productId, submitData)
        : ProductApi.createProduct(submitData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterProducts.all,
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = async (data) => {
    let imageUrl = data.image_url

    if (imageUrl instanceof File) {
      try {
        setIsUploading(true)
        const uploadRes = await uploadApi.uploadImage(imageUrl)
        imageUrl = uploadRes.data?.url || uploadRes.url
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast.error("Failed to upload product image.")
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    handleMutation.mutate({
      ...data,
      image_url: imageUrl,
    })
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
            : "Add Product"
      }
      description={
        isViewMode
          ? "Viewing master product details."
          : isEditMode
            ? "Update master product details."
            : "Create a new generic master product."
      }
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={handleMutation.isPending || isUploading}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="master-product-dialog-form"
              disabled={handleMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : handleMutation.isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Update Product"
                    : "Save Product"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="master-product-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Section 01: General Information */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("01", "General Information")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="name"
              label="PRODUCT FULL NAME"
              placeholder="e.g. Crocin Advance 650mg"
              required
              readOnly={isViewMode}
            />
            <FormSelectField
              control={control}
              name="industry_segment"
              label="INDUSTRY SEGMENT"
              options={INDUSTRY_SEGMENT_OPTIONS}
              readOnly={isViewMode}
            />
            <FormSearchSelect
              control={control}
              name="category_id"
              label="MASTER CATEGORY"
              placeholder="Search Category..."
              options={category.options}
              onSearch={category.onSearch}
              loading={category.loading}
              readOnly={isViewMode}
            />
            <FormSearchSelect
              control={control}
              name="brand_id"
              label="PRODUCT BRAND"
              placeholder="Search Brand..."
              options={brand.options}
              onSearch={brand.onSearch}
              loading={brand.loading}
              readOnly={isViewMode}
            />
            <FormSearchSelect
              control={control}
              name="manufacturer_id"
              label="PARENT MANUFACTURER"
              placeholder="Search Manufacturer..."
              options={manufacturer.options}
              onSearch={manufacturer.onSearch}
              loading={manufacturer.loading}
              readOnly={isViewMode}
            />
            <FormField
              control={control}
              name="salt"
              label="SALT COMPOSITION"
              placeholder="e.g. Paracetamol 500mg"
              readOnly={isViewMode}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSearchSelect
                control={control}
                name="category_type"
                label="CATEGORY TYPE"
                placeholder="Search Type..."
                options={categoryType.options}
                onSearch={categoryType.onSearch}
                loading={categoryType.loading}
                readOnly={isViewMode}
              />
              <FormSelectField
                control={control}
                name="status"
                label="PRODUCT STATUS"
                options={PRODUCT_STATUS_OPTIONS}
                readOnly={isViewMode}
              />
            </div>

            <FormFileUpload
              control={control}
              name="image_url"
              label="PRODUCT IMAGE"
              accept="image/*"
              maxSizeText="PNG, JPG up to 5MB"
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Section 02: Classifications & Units */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("02", "Classifications & Units")}

          <div className="grid gap-6 sm:grid-cols-3">
            <FormSearchSelect
              control={control}
              name="hsn_code_id"
              label="HSN / SAC CODE"
              placeholder="Search HSN..."
              options={hsn.options}
              loading={hsn.loading}
              onSearch={hsn.onSearch}
              readOnly={isViewMode}
            />
            <FormSelectField
              control={control}
              name="color_type"
              label="COLOR TYPE"
              options={COLOR_TYPE_OPTIONS}
              readOnly={isViewMode}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  REGISTERED BARCODES (EAN/UPC)
                </label>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => append({ value: "" })}
                    className="flex items-center text-xs font-bold text-primary hover:underline"
                  >
                    <Plus className="mr-1 size-3" />
                    ADD SKU CODE
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="relative flex-1">
                      <FormField
                        control={control}
                        name={`barcodes.${index}.value`}
                        label=""
                        placeholder="SCAN PRODUCT BARCODE"
                        readOnly={isViewMode}
                      />
                      {/* <Camera className="absolute top-3 right-3 size-4 cursor-pointer text-muted-foreground" /> */}
                    </div>
                    {fields.length > 1 && !isViewMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 03: Regulatory & System Flags */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("03", "Regulatory & System Flags")}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormSwitch
              control={control}
              name="is_narcotic"
              label="Narcotic Drug"
              description="Requires special tracking and reporting"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="is_schedule_h"
              label="Schedule H"
              description="Prescription required for billing"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="is_schedule_h1"
              label="Schedule H1"
              description="Strict audit logging and separate register"
              disabled={isViewMode}
            />
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
