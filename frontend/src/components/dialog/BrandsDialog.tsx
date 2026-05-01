import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormFileUpload,
} from "@/components/ui/form-fields"
import { queryKeys } from "@/lib/queryKeys"
import BrandApi from "@/services/attributesApi"
import sectionHeader from "../sectionHeader"

import { BRAND_FORM_INITIAL_DATA } from "@/constants/page/super-admin/brands"

interface BrandDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
  brand?: any | null
}

export default function BrandDrawer({
  open,
  onClose,
  brand,
}: BrandDrawerProps) {
  const isViewMode = !!brand?.viewMode
  const isEditMode = !!brand?.id
  const brandId = brand?.id

  const { handleSubmit, control, reset } = useForm({
    defaultValues: BRAND_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...BRAND_FORM_INITIAL_DATA,
          name: brand?.name || "",
          description: brand?.description || "",
          status: brand?.status || "ACTIVE",
          logo: brand?.logo || null,
        })
      } else {
        reset(BRAND_FORM_INITIAL_DATA)
      }
    }
  }, [open, brand, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode
        ? BrandApi.updateBrand(brandId, data)
        : BrandApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all,
      })
      reset()
      onClose(false)
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
      if (payload.logo && typeof payload.logo === "object") {
        // More robust check for File object
        const isFile = payload.logo instanceof File || (payload.logo.name && payload.logo.size)
        if (isFile) {
          payload.logo = await fileToBase64(payload.logo)
        }
      }
      mutation.mutate(payload)
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
        isViewMode ? "View Brand" : isEditMode ? "Edit Brand" : "Add Brand"
      }
      description={
        isViewMode
          ? "Viewing brand details."
          : isEditMode
            ? "Update brand details."
            : "Create a new brand."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={mutation.isPending}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button
              type="submit"
              form="brand-form"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update Brand"
                  : "Save Brand"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="brand-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Section 01: Basic Info */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sectionHeader("01", "Brand Information")}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="name"
              label="BRAND NAME"
              placeholder="e.g. Cipla, Sun Pharma"
              required
              readOnly={isViewMode}
            />

            <FormSelectField
              control={control}
              name="status"
              label="STATUS"
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
              readOnly={isViewMode}
            />

            <div className="sm:col-span-2">
              <FormField
                control={control}
                name="description"
                label="DESCRIPTION"
                placeholder="Enter brand description..."
                readOnly={isViewMode}
              />
            </div>

            <div className="sm:col-span-2">
              <FormFileUpload
                control={control}
                name="logo"
                label="BRAND LOGO"
                accept="image/*"
                maxSizeText="PNG, JPG up to 2MB"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
