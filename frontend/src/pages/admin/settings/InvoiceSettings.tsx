import React, { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Save, FileText } from "lucide-react"

import { useAuth } from "@/context/authContext"
import { FormField, FormTextarea, FormSwitch } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

interface InvoiceSettingsFormValues {
  invoice_prefix: string
  invoice_sequence: string
  phone: string
  email: string
  terms_conditions: string
  footer_message: string
  show_gst: boolean
  show_license: boolean
}

const DEFAULT_INVOICE_SETTINGS: InvoiceSettingsFormValues = {
  invoice_prefix: "INV-",
  invoice_sequence: "1001",
  phone: "",
  email: "",
  terms_conditions: "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within due date.",
  footer_message: "Thank you for shopping with us! Get well soon.",
  show_gst: true,
  show_license: true,
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

  // Load from LocalStorage on mount or organization change
  useEffect(() => {
    if (!activeOrganizationId) return

    setLoading(true)
    const storageKey = `${activeOrganizationId}_invoice_settings`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        reset({
          ...DEFAULT_INVOICE_SETTINGS,
          ...parsed,
        })
      } catch (e) {
        console.error("Failed to parse invoice settings from localStorage", e)
        reset(DEFAULT_INVOICE_SETTINGS)
      }
    } else {
      reset(DEFAULT_INVOICE_SETTINGS)
    }
    setLoading(false)
  }, [activeOrganizationId, reset])

  const onSubmit: SubmitHandler<InvoiceSettingsFormValues> = async (data) => {
    if (!activeOrganizationId) {
      toast.error("No active organization found")
      return
    }

    const storageKey = `${activeOrganizationId}_invoice_settings`
    localStorage.setItem(storageKey, JSON.stringify(data))
    
    // Simulate API delay for a polished UX feel
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    // Force form state to reset its isDirty based on the newly saved data
    reset(data)
    toast.success("Invoice settings updated successfully")
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
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
              <h3 className="text-lg font-semibold text-card-foreground">Numbering & Sequencing</h3>
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

          {/* Contact Details Printed on Invoice */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Print Contact Details</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              These details will be printed on the invoice header. Leave blank to default to Organization contact details.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="phone"
                  label="CONTACT PHONE ON INVOICE"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="email"
                  label="CONTACT EMAIL ON INVOICE"
                  placeholder="e.g. billing@dawadukaan.com"
                />
              </div>
            </div>
          </div>

          {/* Footer & Terms */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Terms & Footer Message</h3>
            <div className="grid gap-4">
              <div>
                <FormTextarea
                  control={control}
                  name="terms_conditions"
                  label="TERMS & CONDITIONS"
                  placeholder="Terms and conditions displayed on the invoice..."
                  rows={4}
                />
              </div>
              <div>
                <FormTextarea
                  control={control}
                  name="footer_message"
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
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Show / Hide Fields</h3>
            <div className="space-y-4">
              <FormSwitch
                control={control}
                name="show_gst"
                label="Show GSTIN"
                description="Print the organization GST number on invoices"
              />
              <FormSwitch
                control={control}
                name="show_license"
                label="Show Drug License"
                description="Print the organization Drug License number on invoices"
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
