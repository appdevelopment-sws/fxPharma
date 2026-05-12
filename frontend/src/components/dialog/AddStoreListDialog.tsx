import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { PermissionMultiSelectField } from "@/components/ui/permission-multi-select"

import sectionHeader from "../sectionHeader"
import {
  STORE_FORM_INITIAL_DATA,
  STORE_VISIBILITY_OPTIONS,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  STORE_CATEGORY_OPTIONS,
  STORE_SUBSCRIPTION_OPTIONS,
} from "@/constants/page/super-admin/store"

import StoreListApi from "@/services/storelistApi"
import SubscriptionApi from "@/services/subscriptionApi"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "sonner"

interface ManageStoreDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  store?: any | null
}

export default function ManageStoreDialog({
  open,
  onClose,
  store,
}: ManageStoreDialogProps) {
  const isViewMode = !!store?.viewMode
  const isEditMode = !!store?.id

  const { handleSubmit, control, reset, watch, setValue } = useForm({
    defaultValues: STORE_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  const selectedPlan = watch("subscription_plan_id")
  const selectedRoleKey = watch("role_key")

  const { data: formMetaResponse } = useQuery({
    queryKey: queryKeys.storeList.meta(),
    queryFn: () => StoreListApi.getStoreFormMeta(),
    enabled: open,
  })

  const roleOptions =
    formMetaResponse?.data.roles.map((role) => ({
      label: role.name,
      value: role.key,
    })) ?? []

  const permissionOptions =
    formMetaResponse?.data.permissions.map((permission) => ({
      label: permission.name,
      value: permission.key,
      description: permission.description ?? undefined,
    })) ?? []

  const defaultRoleKey =
    formMetaResponse?.data.defaultRoleKey || STORE_FORM_INITIAL_DATA.role_key

  const selectedRole =
    formMetaResponse?.data.roles.find((role) => role.key === selectedRoleKey) ??
    formMetaResponse?.data.roles.find((role) => role.key === defaultRoleKey)

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...STORE_FORM_INITIAL_DATA,
          ...store,
          store_visibility: store?.status || store?.store_visibility || "ACTIVE",
          subscription_plan_id: store?.subscription_plan_id || store?.plan?.id || "2",
          role_key: store?.role_key || store?.owner?.role?.key || defaultRoleKey,
          permissions:
            store?.permissions?.length
              ? store.permissions
              : store?.owner?.permissions
                  ?.filter((permission: any) => permission.granted)
                  .map((permission: any) => permission.permission?.key)
                  .filter(Boolean) ?? [],
        })
      } else {
        reset({
          ...STORE_FORM_INITIAL_DATA,
          role_key: defaultRoleKey,
          permissions:
            formMetaResponse?.data.roles
              .find((role) => role.key === defaultRoleKey)
              ?.permissions.map((permission) => permission.key) ?? [],
        })
      }
    }
  }, [
    open,
    store,
    reset,
    isEditMode,
    isViewMode,
    defaultRoleKey,
    formMetaResponse,
  ])

  useEffect(() => {
    if (!open || isViewMode) return

    const matchingRole = formMetaResponse?.data.roles.find(
      (role) => role.key === selectedRoleKey
    )

    if (!matchingRole) return

    setValue(
      "permissions",
      matchingRole.permissions.map((permission) => permission.key),
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    )
  }, [open, isViewMode, selectedRoleKey, formMetaResponse, setValue])

  const queryClient = useQueryClient()

  const { data: plansData } = useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: () => SubscriptionApi.getPlans(),
  })

  const plans = plansData?.data || []

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return StoreListApi.updateStore(store.id, data)
      }
      return StoreListApi.createStore(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeList.all,
      })
      toast.success(`Store ${isEditMode ? "updated" : "created"} successfully`)
      reset()
      onClose(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong")
    },
  })

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const payload = { ...data }
      if (payload.store_logo && typeof payload.store_logo === "object") {
        const isFile =
          payload.store_logo instanceof File ||
          (payload.store_logo.name && payload.store_logo.size)
        if (isFile) {
          payload.store_logo = await fileToBase64(payload.store_logo)
        }
      }
      handleMutation.mutate(payload)
    } catch (error) {
      console.error("Error converting file:", error)
    }
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={
        isViewMode ? "View Store" : isEditMode ? "Edit Store" : "Create Store"
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
              form="store-form"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update Store"
                  : "Create Store"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="store-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 xl:grid-cols-3"
      >
        {/* LEFT SIDE */}
        <div className="space-y-6 xl:col-span-2">
          {/* GENERAL */}
          <div className="rounded-xl border p-6">
            {sectionHeader("01", "General Information")}

            <div className="grid gap-5">
              <FormField
                control={control}
                name="store_name"
                label="Store Name"
                required={true}
                placeholder="e.g. Medicare Plus Pharmacy"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="description"
                label="Description"
                placeholder="Brief description of the store's services..."
                readOnly={isViewMode}
              />

              <FormSelectField
                control={control}
                name="store_category"
                label="Store Category"
                options={STORE_CATEGORY_OPTIONS}
                readOnly={isViewMode}
              />

              <FormFileUpload
                control={control}
                name="store_logo"
                label="Store Logo"
                accept="image/*"
                maxSizeText="SVG, PNG, JPG (Max 2MB)"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* OWNER */}
          <div className="rounded-xl border p-6">
            {sectionHeader("02", "Owner Details")}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={control}
                name="first_name"
                label="First Name"
                required={true}
                placeholder="First Name"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="last_name"
                label="Last Name"
                required={true}
                placeholder="Last Name"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="email"
                label="Email Address"
                required={true}
                placeholder="owner@example.com"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="phone"
                label="Phone Number"
                required={true}
                placeholder="+1 (555) 000-0000"
                readOnly={isViewMode}
              />
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className="rounded-xl border p-6">
            {sectionHeader("03", "Credentials & Licenses")}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={control}
                name="login_email"
                label="Login Email"
                required={true}
                placeholder="login@example.com"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="password"
                label="Password"
                required={!isEditMode}
                placeholder="********"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="gst_number"
                label="GST No."
                placeholder="Enter GST Number"
                readOnly={isViewMode}
              />

              <FormField
                control={control}
                name="license_number"
                label="License No."
                placeholder="Enter License Number"
                readOnly={isViewMode}
              />
            </div>
          </div>

          <div className="rounded-xl border p-6">
            {sectionHeader("04", "Role Assignment")}

            <div className="space-y-4">
              <FormSelectField
                control={control}
                name="role_key"
                label="Initial Role"
                options={roleOptions}
                readOnly={isViewMode || roleOptions.length === 0}
              />

              <p className="text-sm text-muted-foreground">
                {selectedRole
                  ? `${selectedRole.name} currently grants ${selectedRole.permissions.length} permissions.`
                  : "Select a role to auto-fill the permissions this store owner receives."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            {sectionHeader("05", "Owner Permissions")}

            <PermissionMultiSelectField
              control={control}
              name="permissions"
              label="Grant Permissions"
              description="Choose which actions the first store owner can access when they sign in."
              options={permissionOptions}
              selectAllLabel="Select all permissions"
              readOnly={isViewMode}
            />
          </div>

          {/* ADDRESS */}
          <div className="rounded-xl border p-6">
            {sectionHeader("06", "Address & Location")}

            <div className="grid gap-5">
              <FormField
                control={control}
                name="street_address"
                label="Street Address"
                required={true}
                placeholder="123 Main St, Suite 100"
                readOnly={isViewMode}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={control}
                  name="city"
                  label="City"
                  required={true}
                  placeholder="City"
                  readOnly={isViewMode}
                />

                <FormField
                  control={control}
                  name="state"
                  label="State / Province"
                  required={true}
                  placeholder="State"
                  readOnly={isViewMode}
                />

                <FormField
                  control={control}
                  name="zip_code"
                  label="ZIP / Postal Code"
                  required={true}
                  placeholder="ZIP Code"
                  readOnly={isViewMode}
                />

                <FormField
                  control={control}
                  name="country"
                  label="Country"
                  required={true}
                  placeholder="United States"
                  readOnly={isViewMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* STATUS */}
          <div className="rounded-xl border p-6">
            {sectionHeader("07", "Status")}

            <FormSelectField
              control={control}
              name="store_visibility"
              label="Store Visibility"
              options={STORE_VISIBILITY_OPTIONS}
              readOnly={isViewMode}
            />
          </div>

          {/* PLAN */}
          <div className="rounded-xl border p-6">
            {sectionHeader("08", "Subscription Plan")}

            <div className="space-y-3">
              {plans.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No subscription plans available.
                </p>
              ) : (
                plans.map((plan: any) => (
                  <div
                    key={plan.id}
                    onClick={() =>
                      !isViewMode && setValue("subscription_plan_id", plan.id)
                    }
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      selectedPlan === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {plan.max_staff_users} Staff Users
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.max_stores} Stores
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">₹{plan.price}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          /{plan.billing_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* REGIONAL */}
          <div className="rounded-xl border p-6">
            {sectionHeader("09", "Regional Settings")}

            <div className="space-y-5">
              <FormSelectField
                control={control}
                name="timezone"
                label="Timezone"
                options={TIMEZONE_OPTIONS}
                readOnly={isViewMode}
              />

              <FormSelectField
                control={control}
                name="currency"
                label="Currency"
                options={CURRENCY_OPTIONS}
                readOnly={isViewMode}
              />
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
