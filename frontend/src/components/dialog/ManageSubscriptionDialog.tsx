import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormSwitch,
} from "@/components/ui/form-fields"
import sectionHeader from "../sectionHeader"
import {
  MANAGE_SUBSCRIPTION_FORM_INITIAL_DATA,
  BILLING_TYPE_OPTIONS,
  STATUS_OPTIONS,
  BADGE_OPTIONS,
} from "@/constants/page/super-admin/manage-subscription"

import SubscriptionApi from "@/services/subscriptionApi"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "sonner"

interface ManageSubscriptionDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  plan?: any | null
}

export default function ManageSubscriptionDialog({
  open,
  onClose,
  plan,
}: ManageSubscriptionDialogProps) {
  const isViewMode = !!plan?.viewMode
  const isEditMode = !!plan?.id

  const { handleSubmit, control, reset } = useForm({
    defaultValues: MANAGE_SUBSCRIPTION_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...MANAGE_SUBSCRIPTION_FORM_INITIAL_DATA,
          ...plan,
        })
      } else {
        reset(MANAGE_SUBSCRIPTION_FORM_INITIAL_DATA)
      }
    }
  }, [open, plan, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return SubscriptionApi.updatePlan(plan.id, data)
      }
      return SubscriptionApi.createPlan(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.plans.all,
      })
      toast.success(`Plan ${isEditMode ? "updated" : "created"} successfully`)
      onClose(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong")
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
        isViewMode ? "View Plan" : isEditMode ? "Edit Plan" : "Create New Plan"
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            {isViewMode ? "Close" : "Discard Changes"}
          </Button>

          {!isViewMode && (
            <Button
              type="submit"
              form="subscription-form"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending
                ? "Saving..."
                : "Save Plan Configuration"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="subscription-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* GENERAL DETAILS */}
        <div className="rounded-xl border p-6">
          {sectionHeader("01", "GENERAL DETAILS")}

          <div className="grid gap-5">
            <FormField
              control={control}
              name="name"
              label="Plan Name"
              required={true}
              placeholder="e.g. Standard Monthly"
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="short_description"
              label="Short Description"
              placeholder="Perfect for growing pharmacies..."
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* PRICING */}
        <div className="rounded-xl border p-6">
          {sectionHeader("02", "PRICING & BILLING")}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={control}
              name="price"
              label="Price"
              required={true}
              placeholder="₹1299"
              readOnly={isViewMode}
            />

            <FormSelectField
              control={control}
              name="billing_type"
              label="Billing Cycle"
              required={true}
              options={BILLING_TYPE_OPTIONS}
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="trial_period_days"
              label="Trial Period (Days)"
              placeholder="14"
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="setup_fee"
              label="Setup Fee"
              placeholder="0"
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* LIMITS */}
        <div className="rounded-xl border p-6">
          {sectionHeader("03", "USAGE LIMITS")}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={control}
              name="max_staff_users"
              label="Max Users (Staff)"
              required={true}
              placeholder="5"
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="max_stores"
              label="Max Stores / Locations"
              required={true}
              placeholder="2"
              readOnly={isViewMode}
            />

            <FormField
              control={control}
              name="storage_limit_gb"
              label="Storage Limit (GB)"
              placeholder="10"
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* ADVANCED */}
        <div className="rounded-xl border p-6">
          {sectionHeader("04", "ADVANCED FEATURES")}

          <div className="space-y-4">
            <FormSwitch
              control={control}
              name="api_access"
              label="API Access"
              description="Allow third-party integrations"
              disabled={isViewMode}
            />

            <FormSwitch
              control={control}
              name="white_labeling"
              label="White-labeling"
              description="Remove Super Admin branding"
              disabled={isViewMode}
            />

            <FormSwitch
              control={control}
              name="priority_support"
              label="Priority Support"
              description="24/7 dedicated support line"
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* CORE MODULES */}
        <div className="rounded-xl border p-6">
          {sectionHeader("05", "CORE MODULES")}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSwitch
              control={control}
              name="inventory"
              label="Inventory"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="billing_pos"
              label="Billing & POS"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="staff_management"
              label="Staff Mgt"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="suppliers"
              label="Suppliers"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="analytics"
              label="Analytics"
              disabled={isViewMode}
            />
            <FormSwitch
              control={control}
              name="prescriptions"
              label="Prescriptions"
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="rounded-xl border p-6">
          {sectionHeader("06", "DISPLAY & STATUS")}

          <div className="space-y-4">
            <FormSwitch
              control={control}
              name="is_popular"
              label="Mark as Popular"
              description="Highlights this plan on frontend"
              disabled={isViewMode}
            />

            <FormSelectField
              control={control}
              name="badge_text"
              label="Badge Text"
              options={BADGE_OPTIONS}
              readOnly={isViewMode}
            />

            <FormSelectField
              control={control}
              name="status"
              label="Plan Status"
              options={STATUS_OPTIONS}
              readOnly={isViewMode}
            />
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
