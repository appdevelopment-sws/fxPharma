import React, { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

import { useAuth } from "@/context/authContext"
import StoreListApi, { type StoreFormValues } from "@/services/storelistApi"
import UploadApi from "@/services/uploadApi"
import {
  FormField,
  FormTextarea,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

const DEFAULT_TIMEZONES = [
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "UTC / GMT", value: "UTC" },
  { label: "US/Eastern (EST)", value: "America/New_York" },
  { label: "US/Pacific (PST)", value: "America/Los_Angeles" },
]

const DEFAULT_CURRENCIES = [
  { label: "Indian Rupee (INR - ₹)", value: "INR" },
  { label: "US Dollar (USD - $)", value: "USD" },
  { label: "Euro (EUR - €)", value: "EUR" },
  { label: "British Pound (GBP - £)", value: "GBP" },
]

export default function OrganizationSettings() {
  const { activeOrganizationId } = useAuth()
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<StoreFormValues>({
    defaultValues: {
      store_name: "",
      description: "",
      store_category: "",
      store_logo: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      login_email: "",
      gst_number: "",
      license_number: "",
      street_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      timezone: "Asia/Kolkata",
      currency: "INR",
      isActive: true,
      role_key: "ORG_ADMIN",
      permissions: [],
    },
  })

  // Fetch current store/organization details
  const { data: storeResponse, isLoading } = useQuery({
    queryKey: ["organization", activeOrganizationId],
    queryFn: () => StoreListApi.getStoreById(activeOrganizationId || ""),
    enabled: Boolean(activeOrganizationId),
  })

  // Invalidate cache and update state on query return
  useEffect(() => {
    if (storeResponse?.data) {
      const store = storeResponse.data
      reset({
        store_name: store.store_name || "",
        description: store.description || "",
        store_category: store.store_category || "",
        store_logo: store.store_logo || "",
        first_name: store.first_name || "",
        last_name: store.last_name || "",
        email: store.email || "",
        phone: store.phone || "",
        login_email: store.login_email || "",
        gst_number: store.gst_number || "",
        license_number: store.license_number || "",
        street_address: store.street_address || "",
        city: store.city || "",
        state: store.state || "",
        zip_code: store.zip_code || "",
        country: store.country || "",
        timezone: store.timezone || "Asia/Kolkata",
        currency: store.currency || "INR",
        isActive: store.isActive ?? true,
        role_key: store.role_key || "ORG_ADMIN",
        permissions: store.permissions || [],
      })
    }
  }, [storeResponse, reset])

  const updateMutation = useMutation({
    mutationFn: (values: StoreFormValues) =>
      StoreListApi.updateStore(activeOrganizationId || "", values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", activeOrganizationId],
      })
      toast.success("Organization settings updated successfully")
    },
    onError: (error: any) => {},
  })

  const onSubmit: SubmitHandler<StoreFormValues> = (data) => {
    if (!activeOrganizationId) {
      toast.error("No active organization found")
      return
    }
    updateMutation.mutate(data)
  }

  const uploadFile = async (file: File) => {
    const response = await UploadApi.uploadImage(file)
    return response.publicUrl
  }

  if (isLoading) {
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
        {/* Left Side: Core Settings Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              General Info
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  control={control}
                  name="store_name"
                  label="ORGANIZATION NAME"
                  placeholder="e.g. Dawa Dukaan Main Store"
                  required
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="store_category"
                  label="BUSINESS CATEGORY"
                  placeholder="e.g. Pharmacy / Healthcare"
                />
              </div>
              <div className="sm:col-span-2">
                <FormTextarea
                  control={control}
                  name="description"
                  label="DESCRIPTION"
                  placeholder="Brief description about your store or pharmacy..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Address Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  control={control}
                  name="street_address"
                  label="STREET ADDRESS"
                  placeholder="e.g. 123 Main St, Sector 4"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="city"
                  label="CITY"
                  placeholder="e.g. Indore"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="state"
                  label="STATE"
                  placeholder="e.g. Madhya Pradesh"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="zip_code"
                  label="ZIP / POSTAL CODE"
                  placeholder="e.g. 452001"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="country"
                  label="COUNTRY"
                  placeholder="e.g. India"
                />
              </div>
            </div>
          </div>

          {/* Tax & Legal */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Tax & License Settings
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={control}
                  name="gst_number"
                  label="GST NUMBER (GSTIN)"
                  placeholder="e.g. 23AAAAA0000A1Z1"
                />
              </div>
              <div>
                <FormField
                  control={control}
                  name="license_number"
                  label="LICENSE NUMBER"
                  placeholder="e.g. DL-12345/2026"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          {/* <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Regional Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timezone</label>
                <select
                  {...control.register("timezone")}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {DEFAULT_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currency</label>
                <select
                  {...control.register("currency")}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {DEFAULT_CURRENCIES.map((cur) => (
                    <option key={cur.value} value={cur.value}>
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Side: Logo & Owner details */}
        <div className="space-y-6">
          {/* Logo Upload Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Store Logo
            </h3>
            <FormFileUpload
              control={control}
              name="store_logo"
              accept="image/*"
              maxSizeText="Recommended size: 512x512px. Max 2MB."
              uploadFile={uploadFile}
            />
          </div>

          {/* Owner details */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Owner Details
            </h3>
            <div className="space-y-4">
              <FormField
                control={control}
                name="first_name"
                label="OWNER FIRST NAME"
                placeholder="e.g. John"
                required
              />
              <FormField
                control={control}
                name="last_name"
                label="OWNER LAST NAME"
                placeholder="e.g. Doe"
                required
              />
              <FormField
                control={control}
                name="email"
                label="OWNER EMAIL"
                placeholder="e.g. owner@dawadukaan.com"
                required
              />
              <FormField
                control={control}
                name="phone"
                label="OWNER PHONE"
                placeholder="e.g. 9876543210"
                required
              />
              <FormField
                control={control}
                name="login_email"
                label="LOGIN EMAIL"
                placeholder="e.g. admin@dawadukaan.com"
                required
              />
            </div>
          </div>

          {/* Save Action Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting || updateMutation.isPending || !isDirty}
            >
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
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
