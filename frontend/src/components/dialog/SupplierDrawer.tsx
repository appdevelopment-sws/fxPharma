import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/queryKeys"
import SupplierApi, { type SupplierFormValues } from "@/services/supplierApi"
import { uploadApi } from "@/services/uploadApi"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSwitch,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { SUPPLIER_FORM_INITIAL_DATA } from "@/constants/page/admin/suppliers"
import sectionHeader from "../sectionHeader"

interface SupplierDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
  supplier?: any | null
}

export default function SupplierDrawer({
  open,
  onClose,
  supplier,
}: SupplierDrawerProps) {
  const isViewMode = !!supplier?.viewMode
  const isEditMode = !!supplier?.id
  const supplierId = supplier?.id
  const [isUploading, setIsUploading] = useState(false)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SupplierFormValues & { isActive?: boolean }>({
    defaultValues: { ...SUPPLIER_FORM_INITIAL_DATA, isActive: true },
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          companyName: supplier?.companyName || "",
          gstNumber: supplier?.gstNumber || "",
          officeAddress: supplier?.officeAddress || "",
          contactPersonName: supplier?.contactPersonName || "",
          email: supplier?.email || "",
          phone: supplier?.phone || "",
          whatsappNumber: supplier?.whatsappNumber || "",
          isPreferred: !!supplier?.isPreferred,
          autoGeneratePO: !!supplier?.autoGeneratePO,
          registrationDocuments: supplier?.registrationDocuments || null,
          isActive: supplier?.isActive ?? true,
        })
      } else {
        reset({ ...SUPPLIER_FORM_INITIAL_DATA, isActive: true })
      }
    }
  }, [open, supplier, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (submitData: SupplierFormValues & { isActive?: boolean }) =>
      isEditMode
        ? SupplierApi.updateSupplier(supplierId, submitData)
        : SupplierApi.createSupplier(submitData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.suppliers.all,
      })
      toast.success(
        `Supplier ${isEditMode ? "updated" : "created"} successfully`
      )
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<SupplierFormValues & { isActive?: boolean }> = async (data) => {
    handleMutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={
        isViewMode
          ? "View Supplier"
          : isEditMode
            ? "Edit Supplier"
            : "Add Supplier"
      }
      description={
        isViewMode
          ? "Viewing supplier details."
          : isEditMode
            ? "Update supplier details."
            : "Create a new supplier record."
      }
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={handleMutation.isPending || isSubmitting}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="supplier-dialog-form"
              disabled={handleMutation.isPending || isSubmitting || isUploading}
            >
              {handleMutation.isPending || isSubmitting || isUploading
                ? "Saving..."
                : isEditMode
                  ? "Update Supplier"
                  : "Save Supplier"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="supplier-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Section 01: Company Information */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("01", "Company Information")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="companyName"
              label="COMPANY NAME"
              placeholder="e.g. Sws"
              required
              readOnly={isViewMode}
              error={errors.companyName?.message}
            />
            <FormField
              control={control}
              name="gstNumber"
              label="GST NUMBER"
              placeholder="e.g. 27AAAAA0000A1Z5"
              required
              readOnly={isViewMode}
              error={errors.gstNumber?.message}
            />
            <div className="sm:col-span-2">
              <FormField
                control={control}
                name="officeAddress"
                label="OFFICE ADDRESS"
                placeholder="Full registered address..."
                required
                readOnly={isViewMode}
                error={errors.officeAddress?.message}
              />
            </div>
            <FormFileUpload
              control={control}
              name="registrationDocuments"
              label="REGISTRATION DOCUMENTS (OPTIONAL)"
              accept=".pdf,.jpg,.png"
              maxSizeText="PDF, PNG, JPG up to 5MB"
              disabled={isViewMode}
              error={errors.registrationDocuments?.message as string}
              uploadFile={async (file) =>
                (await uploadApi.uploadImage(file)).publicUrl
              }
              onUploadingChange={setIsUploading}
              onUploadError={() => {
                setIsUploading(false)
                toast.error("Failed to upload registration document.")
              }}
            />
          </div>
        </div>

        {/* Section 02: Contact Details */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("02", "Contact Details")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="contactPersonName"
              label="CONTACT PERSON NAME"
              placeholder="e.g. John Doe"
              required
              readOnly={isViewMode}
              error={errors.contactPersonName?.message}
            />
            <FormField
              control={control}
              name="email"
              label="EMAIL ADDRESS"
              placeholder="e.g. contact@company.com"
              required
              readOnly={isViewMode}
              error={errors.email?.message}
            />
            <FormField
              control={control}
              name="phone"
              label="PHONE NUMBER"
              placeholder="e.g. +91 1234567890"
              required
              readOnly={isViewMode}
              error={errors.phone?.message}
            />
            <FormField
              control={control}
              name="whatsappNumber"
              label="WHATSAPP NUMBER"
              placeholder="e.g. +91 1234567890"
              required
              readOnly={isViewMode}
              error={errors.whatsappNumber?.message}
            />
          </div>
        </div>

        {/* Section 03: Preferences & Automation */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("03", "Preferences & Automation")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSwitch
              control={control}
              name="isPreferred"
              label="Mark as Preferred Supplier"
              description="Prioritize this supplier for inventory restocking"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="autoGeneratePO"
              label="Auto Generate Purchase Order"
              description="Automatically create POs when stock is low"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="isActive"
              label="Status"
              description={isEditMode ? "Toggle supplier active/inactive status" : "Set initial status"}
              disabled={isViewMode}
            />
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
