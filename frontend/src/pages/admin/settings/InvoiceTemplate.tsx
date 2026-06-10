import React, { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { ArrowUpRight, Loader2, Save, ShieldAlert } from "lucide-react"

import { useAuth } from "@/context/authContext"
import SettingsApi from "@/services/settingsApi"
import InvoiceApi from "@/services/invoiceApi"
import { FormField, FormSwitch } from "@/components/ui/form-fields"
import { FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

interface InvoiceTemplatesFormValues {
  drug_license_20: string
  drug_license_21: string
  fssai_no: string
  expiry_alert_months: string
  low_stock_threshold: string
  require_prescription: boolean
  invoice_template_name: string
  inventory_additional_fields_enabled: boolean
}

const DEFAULT_PHARMACY_SETTINGS: InvoiceTemplatesFormValues = {
  drug_license_20: "",
  drug_license_21: "",
  fssai_no: "",
  expiry_alert_months: "3",
  low_stock_threshold: "10",
  require_prescription: false,
  invoice_template_name: "template1",
  inventory_additional_fields_enabled: false,
}

export default function InvoiceTemplates() {
  const { activeOrganizationId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [invoiceTemplates, setInvoiceTemplates] = useState<string[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<InvoiceTemplatesFormValues>({
    defaultValues: DEFAULT_PHARMACY_SETTINGS,
  })

  const selectedTemplate = watch("invoice_template_name")

  // Load settings from backend database settings API
  useEffect(() => {
    if (!activeOrganizationId) return

    setTemplatesLoading(true)
    InvoiceApi.getInvoiceTemplates()
      .then((res) => {
        setInvoiceTemplates(res.data.templates ?? [])
      })
      .catch((e) => {
        console.error("Failed to load invoice templates", e)
        toast.error("Failed to load invoice templates")
      })
      .finally(() => {
        setTemplatesLoading(false)
      })

    setLoading(true)
    SettingsApi.getSettings()
      .then((res) => {
        if (res.data) {
          reset({
            drug_license_20: res.data.drug_license_20 || "",
            drug_license_21: res.data.drug_license_21 || "",
            fssai_no: res.data.fssai_no || "",
            expiry_alert_months: res.data.expiry_alert_months || "3",
            low_stock_threshold: res.data.low_stock_threshold || "10",
            require_prescription: res.data.require_prescription === "true",
            invoice_template_name:
              res.data.invoice_template_name ||
              res.data.invoice_template ||
              DEFAULT_PHARMACY_SETTINGS.invoice_template_name,
            inventory_additional_fields_enabled:
              res.data.inventory_additional_fields_enabled === "true",
          })
        }
      })
      .catch((e) => {
        console.error("Failed to load pharmacy settings", e)
        toast.error("Failed to load pharmacy settings")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeOrganizationId, reset])

  const onSubmit: SubmitHandler<InvoiceTemplatesFormValues> = async (data) => {
    if (!activeOrganizationId) {
      toast.error("No active organization found")
      return
    }

    try {
      const payload = {
        drug_license_20: data.drug_license_20,
        drug_license_21: data.drug_license_21,
        fssai_no: data.fssai_no,
        expiry_alert_months: data.expiry_alert_months,
        low_stock_threshold: data.low_stock_threshold,
        require_prescription: String(data.require_prescription),
        invoice_template_name: data.invoice_template_name,
        inventory_additional_fields_enabled: String(
          data.inventory_additional_fields_enabled
        ),
      }

      await SettingsApi.updateSettings(payload)
      reset(data)
      toast.success("Pharmacy settings updated successfully")
      window.location.reload()
    } catch (e: any) {
      toast.error(e?.message || "Failed to update pharmacy settings")
    }
  }

  const handlePreviewTemplate = async () => {
    try {
      await InvoiceApi.openInvoiceTemplatePreview(selectedTemplate)
      toast.success(`Opened template preview for ${selectedTemplate}`)
    } catch {
      // toast.error("Could not open template preview.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading pharmacy settings...
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Columns: Settings Fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* Licenses & Regulations */}
          {/* <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Licenses & Regulations
              </h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure your Pharmacy Drug Licenses and Food Safety credentials.
              These details will print on your invoices automatically.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="drug_license_20"
                  label="DRUG LICENSE (FORM 20)"
                  placeholder="e.g. DL-20-123456"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="drug_license_21"
                  label="DRUG LICENSE (FORM 21)"
                  placeholder="e.g. DL-21-123456"
                />
              </div>
              <div className="sm:col-span-2">
                <FormField
                  control={control}
                  name="fssai_no"
                  label="FSSAI LICENSE NUMBER"
                  placeholder="e.g. 10020051000123"
                />
              </div>
            </div>
          </div> */}

          {/* Operations Thresholds */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Alerts & Warning Thresholds
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="expiry_alert_months"
                  label="EXPIRY ALERT PERIOD (MONTHS)"
                  placeholder="e.g. 3"
                  inputType="number"
                  required
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="low_stock_threshold"
                  label="LOW STOCK THRESHOLD"
                  placeholder="e.g. 10"
                  inputType="number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Invoice Template
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose the invoice template that will be used for PDF/HTML
              invoices.
            </p>
            <div className="space-y-4">
              <FormSelectField
                control={control}
                name="invoice_template_name"
                label="Invoice Template"
                placeholder={
                  templatesLoading ? "Loading templates…" : "Select a template"
                }
                options={
                  invoiceTemplates.length > 0
                    ? invoiceTemplates.map((template) => ({
                        label: template,
                        value: template,
                      }))
                    : [{ label: "template1", value: "template1" }]
                }
                disabled={templatesLoading}
              />
              <Button
                type="button"
                variant="outline"
                disabled={templatesLoading || !selectedTemplate}
                onClick={handlePreviewTemplate}
                className="w-full sm:w-auto"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Preview Template
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Regulations & Action */}
        <div className="space-y-6">
          {/* Rules & Compliance */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Compliance Toggles
            </h3>
            <div className="space-y-4">
              <FormSwitch
                control={control}
                name="require_prescription"
                label="Require Prescription"
                description="Prompt for prescription during checkout for Schedule H/H1/X drugs"
              />{" "}
              <FormSwitch
                control={control}
                name="inventory_additional_fields_enabled"
                label="Show Inventory Additional Fields"
                description="Enable inventory thresholds, discounts, and regulatory flags in product form"
              />
            </div>
          </div>

          {/* Save Card */}
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
                  Save Operations Settings
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
