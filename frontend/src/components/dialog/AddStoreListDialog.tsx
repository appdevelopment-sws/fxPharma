import { useEffect, useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
} from "@/constants/page/super-admin/store"

import StoreListApi from "@/services/storelistApi"
import SubscriptionApi from "@/services/subscriptionApi"
import { uploadApi } from "@/services/uploadApi"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "sonner"
import { createStoreFormSchema } from "@/validations/super-admin/storeValidation"

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
  const storeFormSchema = useMemo(() => createStoreFormSchema(), [])
  const [isvisiblePassword, setIsVisiblePassword] = useState(false)
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: STORE_FORM_INITIAL_DATA,
    resolver: zodResolver(storeFormSchema),
    mode: "onChange",
  })

  const getError = (name: string) => {
    const error = errors[name as keyof typeof errors]
    return typeof error?.message === "string" ? error.message : undefined
  }

  const selectedPlan = watch("subscription_plan_id")
  const selectedRoleKey = watch("role_key")

  const { data: formMetaResponse } = useQuery({
    queryKey: queryKeys.storeList.meta(),
    queryFn: () => StoreListApi.getStoreFormMeta(),
    enabled: open,
  })
  console.table(formMetaResponse?.data)
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...STORE_FORM_INITIAL_DATA,
          ...store,
          store_category:
            store?.store_category || STORE_FORM_INITIAL_DATA.store_category,
          store_visibility:
            store?.status || store?.store_visibility || "ACTIVE",
          subscription_plan_id:
            store?.subscription_plan_id || store?.plan?.id || "2",
          role_key:
            store?.role_key || store?.owner?.role?.key || defaultRoleKey,
          password: store?.password ?? "",
          permissions: store?.permissions?.length
            ? store.permissions
            : (store?.owner?.permissions
                ?.filter((permission: any) => permission.granted)
                .map((permission: any) => permission.permission?.key)
                .filter(Boolean) ?? []),
        })
      } else {
        reset({
          ...STORE_FORM_INITIAL_DATA,
          role_key: defaultRoleKey,
          password: "",
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

  const onSubmit: SubmitHandler<any> = (data) => {
    if (!isEditMode && !data.password) {
      setError("password", {
        type: "manual",
        message: "Password is required",
      })
      return
    }

    const payload = { ...data }

    if (isEditMode && !payload.password) {
      delete payload.password
    }

    handleMutation.mutate(payload)
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
              disabled={handleMutation.isPending || isUploadingLogo}
            >
              {handleMutation.isPending || isUploadingLogo
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
                error={getError("store_name")}
              />

              <FormField
                control={control}
                name="description"
                label="Description"
                placeholder="Brief description of the store's services..."
                readOnly={isViewMode}
                error={getError("description")}
              />

              <FormSelectField
                control={control}
                name="store_category"
                label="Store Category"
                options={STORE_CATEGORY_OPTIONS}
                readOnly={isViewMode}
                error={getError("store_category")}
                required
              />

              <FormFileUpload
                control={control}
                name="store_logo"
                label="Store Logo"
                accept="image/*"
                maxSizeText="SVG, PNG, JPG (Max 2MB)"
                disabled={isViewMode}
                error={getError("store_logo")}
                uploadFile={async (file) =>
                  (await uploadApi.uploadImage(file)).publicUrl
                }
                onUploadingChange={setIsUploadingLogo}
                onUploadError={() => {
                  setIsUploadingLogo(false)
                  toast.error("Failed to upload store logo.")
                }}
                required={false}
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
                error={getError("first_name")}
              />

              <FormField
                control={control}
                name="last_name"
                label="Last Name"
                required={true}
                placeholder="Last Name"
                readOnly={isViewMode}
                error={getError("last_name")}
              />

              <FormField
                control={control}
                name="email"
                label="Email Address"
                required={true}
                placeholder="owner@example.com"
                readOnly={isViewMode}
                error={getError("email")}
              />

              <FormField
                control={control}
                name="phone"
                label="Phone Number"
                required={true}
                placeholder="+1 (555) 000-0000"
                readOnly={isViewMode}
                error={getError("phone")}
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
                error={getError("login_email")}
              />

              <FormField
                control={control}
                name="password"
                label="Password"
                required={!isEditMode}
                placeholder={
                  isEditMode
                    ? "Leave blank to keep the current password"
                    : "Min 8 characters"
                }
                inputType={isvisiblePassword ? "text" : "password"}
                readOnly={isViewMode}
                error={getError("password")}
              />
              {isEditMode ? (
                <p className="text-sm text-muted-foreground">
                  Leave the password empty if you do not want to change it.
                </p>
              ) : null}

              <FormField
                control={control}
                name="gst_number"
                label="GST No."
                placeholder="Enter GST Number"
                readOnly={isViewMode}
                error={getError("gst_number")}
              />

              <FormField
                control={control}
                name="license_number"
                label="License No."
                placeholder="Enter License Number"
                readOnly={isViewMode}
                error={getError("license_number")}
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
                error={getError("street_address")}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={control}
                  name="city"
                  label="City"
                  required={true}
                  placeholder="City"
                  readOnly={isViewMode}
                  error={getError("city")}
                />

                <FormField
                  control={control}
                  name="state"
                  label="State / Province"
                  required={true}
                  placeholder="State"
                  readOnly={isViewMode}
                  error={getError("state")}
                />

                <FormField
                  control={control}
                  name="zip_code"
                  label="ZIP / Postal Code"
                  required={true}
                  placeholder="ZIP Code"
                  readOnly={isViewMode}
                  error={getError("zip_code")}
                />

                <FormField
                  control={control}
                  name="country"
                  label="Country"
                  required={true}
                  placeholder="United States"
                  readOnly={isViewMode}
                  error={getError("country")}
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
              error={getError("store_visibility")}
              required
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
                      !isViewMode &&
                      setValue("subscription_plan_id", plan.id, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
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
              {getError("subscription_plan_id") ? (
                <p className="text-xs text-destructive">
                  {getError("subscription_plan_id")}
                </p>
              ) : null}
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
                error={getError("timezone")}
                required
              />

              <FormSelectField
                control={control}
                name="currency"
                label="Currency"
                options={CURRENCY_OPTIONS}
                readOnly={isViewMode}
                error={getError("currency")}
                required
              />
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
