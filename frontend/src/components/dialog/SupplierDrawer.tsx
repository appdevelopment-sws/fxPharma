import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import SupplierApi, { type SupplierFormValues } from "@/services/supplierApi"
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

  const { handleSubmit, control, reset } = useForm<SupplierFormValues>({
    defaultValues: SUPPLIER_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          company_name: supplier?.company_name || "",
          gstin: supplier?.gstin || "",
          address: supplier?.address || "",
          contact_person: supplier?.contact_person || "",
          email: supplier?.email || "",
          phone: supplier?.phone || "",
          whatsapp: supplier?.whatsapp || "",
          is_preferred: !!supplier?.is_preferred,
          auto_generate_po: !!supplier?.auto_generate_po,
          registration_docs: supplier?.registration_docs || null,
        })
      } else {
        reset(SUPPLIER_FORM_INITIAL_DATA)
      }
    }
  }, [open, supplier, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: (submitData: SupplierFormValues) =>
      isEditMode
        ? SupplierApi.updateSupplier(supplierId, submitData)
        : SupplierApi.createSupplier(submitData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.suppliers.all,
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<SupplierFormValues> = async (data) => {
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
            disabled={handleMutation.isPending}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="supplier-dialog-form"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending
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
              name="company_name"
              label="COMPANY NAME"
              placeholder="e.g. Sws"
              required
              readOnly={isViewMode}
            />
            <FormField
              control={control}
              name="gstin"
              label="GST NUMBER"
              placeholder="e.g. 27AAAAA0000A1Z5"
              required
              readOnly={isViewMode}
            />
            <div className="sm:col-span-2">
              <FormField
                control={control}
                name="address"
                label="OFFICE ADDRESS"
                placeholder="Full registered address..."
                required
                readOnly={isViewMode}
              />
            </div>
            <FormFileUpload
              control={control}
              name="registration_docs"
              label="REGISTRATION DOCUMENTS (OPTIONAL)"
              accept=".pdf,.jpg,.png"
              maxSizeText="PDF, PNG, JPG up to 5MB"
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Section 02: Contact Details */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("02", "Contact Details")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="contact_person"
              label="CONTACT PERSON NAME"
              placeholder="e.g. John Doe"
              required
              readOnly={isViewMode}
            />
            <FormField
              control={control}
              name="email"
              label="EMAIL ADDRESS"
              placeholder="e.g. contact@company.com"
              required
              readOnly={isViewMode}
            />
            <FormField
              control={control}
              name="phone"
              label="PHONE NUMBER"
              placeholder="e.g. +91 1234567890"
              required
              readOnly={isViewMode}
            />
            <FormField
              control={control}
              name="whatsapp"
              label="WHATSAPP NUMBER"
              placeholder="e.g. +91 1234567890"
              required
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* Section 03: Preferences & Automation */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("03", "Preferences & Automation")}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSwitch
              control={control}
              name="is_preferred"
              label="Mark as Preferred Supplier"
              description="Prioritize this supplier for inventory restocking"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="auto_generate_po"
              label="Auto Generate Purchase Order"
              description="Automatically create POs when stock is low"
              disabled={isViewMode}
            />
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
