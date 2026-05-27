import React, { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Save, FileText } from "lucide-react"

import { useAuth } from "@/context/authContext"
import SettingsApi from "@/services/settingsApi"
import {
  FormField,
  FormTextarea,
  FormSwitch,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import uploadApi from "@/services/uploadApi"

interface InvoiceSettingsFormValues {
  invoice_prefix: string
  invoice_sequence: string
  invoice_phone: string
  invoice_email: string
  invoice_terms_conditions: string
  invoice_footer_message: string
  invoice_show_gst: boolean
  invoice_show_license: boolean

  // NEW
  invoice_header_image: string
  invoice_footer_image: string
  invoice_director_signature: string
  invoice_payment_qr_code: string
  invoice_show_payment_qr: boolean
}
const DEFAULT_INVOICE_SETTINGS: InvoiceSettingsFormValues = {
  invoice_prefix: "INV-",
  invoice_sequence: "1001",
  invoice_phone: "",
  invoice_email: "",
  invoice_terms_conditions:
    "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within due date.",
  invoice_footer_message: "Thank you for shopping with us! Get well soon.",
  invoice_show_gst: true,
  invoice_show_license: true,

  // NEW
  invoice_header_image: "",
  invoice_footer_image: "",
  invoice_director_signature: "",
  invoice_payment_qr_code: "",
  invoice_show_payment_qr: false,
}
export default function InvoiceSettings() {
  const { activeOrganizationId } = useAuth()
  const [loading, setLoading] = useState(true)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<InvoiceSettingsFormValues>({
    defaultValues: DEFAULT_INVOICE_SETTINGS,
  })

  // Load from Settings API on mount or organization change
  useEffect(() => {
    if (!activeOrganizationId) return

    setLoading(true)
    SettingsApi.getSettings()
      .then((res) => {
        if (res.data) {
          reset({
            invoice_prefix:
              res.data.invoice_prefix ??
              DEFAULT_INVOICE_SETTINGS.invoice_prefix,
            invoice_sequence:
              res.data.invoice_sequence ??
              DEFAULT_INVOICE_SETTINGS.invoice_sequence,
            invoice_phone:
              res.data.invoice_phone ?? DEFAULT_INVOICE_SETTINGS.invoice_phone,
            invoice_email:
              res.data.invoice_email ?? DEFAULT_INVOICE_SETTINGS.invoice_email,
            invoice_terms_conditions:
              res.data.invoice_terms_conditions ??
              DEFAULT_INVOICE_SETTINGS.invoice_terms_conditions,
            invoice_footer_message:
              res.data.invoice_footer_message ??
              DEFAULT_INVOICE_SETTINGS.invoice_footer_message,
            invoice_show_gst: res.data.invoice_show_gst !== "false",
            invoice_show_license: res.data.invoice_show_license !== "false",
            invoice_header_image:
              res.data.invoice_header_image ??
              DEFAULT_INVOICE_SETTINGS.invoice_header_image,

            invoice_footer_image:
              res.data.invoice_footer_image ??
              DEFAULT_INVOICE_SETTINGS.invoice_footer_image,

            invoice_director_signature:
              res.data.invoice_director_signature ??
              DEFAULT_INVOICE_SETTINGS.invoice_director_signature,

            invoice_payment_qr_code:
              res.data.invoice_payment_qr_code ??
              DEFAULT_INVOICE_SETTINGS.invoice_payment_qr_code,

            invoice_show_payment_qr: res.data.invoice_show_payment_qr !== "false",
          })
        }
      })
      .catch((e) => {
        console.error("Failed to fetch settings", e)
        toast.error("Failed to load invoice settings")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeOrganizationId, reset])

  const onSubmit: SubmitHandler<InvoiceSettingsFormValues> = async (data) => {
    if (!activeOrganizationId) {
      toast.error("No active organization found")
      return
    }

    try {
      const payload = {
        invoice_prefix: data.invoice_prefix,
        invoice_sequence: data.invoice_sequence,
        invoice_phone: data.invoice_phone,
        invoice_email: data.invoice_email,
        invoice_terms_conditions: data.invoice_terms_conditions,
        invoice_footer_message: data.invoice_footer_message,
        invoice_show_gst: String(data.invoice_show_gst),
        invoice_show_license: String(data.invoice_show_license),
        invoice_header_image: data.invoice_header_image,
        invoice_footer_image: data.invoice_footer_image,
        invoice_director_signature: data.invoice_director_signature,
        invoice_payment_qr_code: data.invoice_payment_qr_code,
        invoice_show_payment_qr: String(data.invoice_show_payment_qr),
      }

      await SettingsApi.updateSettings(payload)
      reset(data)
      toast.success("Invoice settings updated successfully")
    } catch (e: any) {
      toast.error(e?.message || "Failed to update invoice settings")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading settings...
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left/Main Column: Settings Fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* Format Settings */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Numbering & Sequencing
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="invoice_prefix"
                  label="INVOICE PREFIX"
                  placeholder="e.g. INV-"
                  required
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="invoice_sequence"
                  label="STARTING NUMBER SEQUENCE"
                  placeholder="e.g. 1001"
                  required
                />
              </div>
            </div>
          </div>
          {/* Branding & Signature */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Branding & Signature
            </h3>

            <div className="grid gap-6">
              <FormFileUpload
                control={control}
                name="invoice_header_image"
                label="HEADER IMAGE"
                accept="image/*"
                maxSizeText="Recommended: 1200x200 PNG/JPG"
                uploadFile={async (file) =>
                  (await uploadApi.uploadImage(file)).publicUrl
                }
              />

              <FormFileUpload
                control={control}
                name="invoice_footer_image"
                label="FOOTER IMAGE"
                accept="image/*"
                maxSizeText="Recommended: 1200x150 PNG/JPG"
                uploadFile={async (file) =>
                  (await uploadApi.uploadImage(file)).publicUrl
                }
              />
              <FormFileUpload
                control={control}
                name="invoice_director_signature"
                label="DIRECTOR SIGNATURE"
                accept="image/*"
                maxSizeText="Transparent PNG Recommended"
                uploadFile={async (file) =>
                  (await uploadApi.uploadImage(file)).publicUrl
                }
              />
            </div>
          </div>
          {/* Payment QR Code */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Payment QR Code
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add a QR code for payment methods. This can be displayed on
              invoices for easy payment processing.
            </p>

            <div className="grid gap-6">
              <FormFileUpload
                control={control}
                name="invoice_payment_qr_code"
                label="PAYMENT QR CODE"
                accept="image/*"
                maxSizeText="Recommended: 500x500 PNG/JPG"
                uploadFile={async (file) =>
                  (await uploadApi.uploadImage(file)).publicUrl
                }
              />
            </div>
          </div>
          {/* Contact Details Printed on Invoice */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Print Contact Details
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              These details will be printed on the invoice header. Leave blank
              to default to Organization contact details.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="invoice_phone"
                  label="CONTACT PHONE ON INVOICE"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="invoice_email"
                  label="CONTACT EMAIL ON INVOICE"
                  placeholder="e.g. billing@dawadukaan.com"
                />
              </div>
            </div>
          </div>

          {/* Footer & Terms */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Terms & Footer Message
            </h3>
            <div className="grid gap-4">
              <div>
                <FormTextarea
                  control={control}
                  name="invoice_terms_conditions"
                  label="TERMS & CONDITIONS"
                  placeholder="Terms and conditions displayed on the invoice..."
                  rows={4}
                />
              </div>
              <div>
                <FormTextarea
                  control={control}
                  name="invoice_footer_message"
                  label="FOOTER / THANKS MESSAGE"
                  placeholder="A short greeting or thank you note..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Switches & Status Info */}
        <div className="space-y-6">
          {/* Display Toggles */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Show / Hide Fields
            </h3>
            <div className="space-y-4">
              <FormSwitch
                control={control}
                name="invoice_show_gst"
                label="Show GSTIN"
                description="Print the organization GST number on invoices"
              />
              <FormSwitch
                control={control}
                name="invoice_show_license"
                label="Show Drug License"
                description="Print the organization Drug License number on invoices"
              />
              <FormSwitch
                control={control}
                name="invoice_show_payment_qr"
                label="Show Payment QR Code"
                description="Display the payment QR code on invoices"
              />
            </div>
          </div>

          {/* Action Box */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Invoice Settings
                </>
              )}
            </Button>
            {!isDirty && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                No unsaved changes
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
