import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { FormContainer } from "@/components/formContainer"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"

import { queryKeys } from "@/lib/queryKeys"
import { CategoryApi } from "@/services/attributesApi"
import { CATEGORY_FORM_INITIAL_DATA } from "@/constants/page/super-admin/category"

interface Props {
  open: boolean
  onClose: (open: boolean) => void
  category?: any | null
}

export default function CategoryDialog({ open, onClose, category }: Props) {
  const isViewMode = !!category?.viewMode
  const isEditMode = !!category?.id
  const categoryId = category?.id

  const { control, handleSubmit, reset } = useForm({
    defaultValues: CATEGORY_FORM_INITIAL_DATA,
  })

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => CategoryApi.getCategories({}),
    enabled: open,
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...CATEGORY_FORM_INITIAL_DATA,
          name: category?.name || "",
          parent_id: category?.parent_id || "",
          description: category?.description || "",
          status: category?.status || "ACTIVE",
        })
      } else {
        reset(CATEGORY_FORM_INITIAL_DATA)
      }
    }
  }, [open, category])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode
        ? CategoryApi.updateCategory(categoryId, data)
        : CategoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    mutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={onClose}
      title={
        isViewMode
          ? "View Category"
          : isEditMode
            ? "Edit Category"
            : "Add Category"
      }
      description="Manage category details"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button type="submit" form="category-form">
              {isEditMode ? "Update" : "Save"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={control}
          name="name"
          label="CATEGORY NAME"
          required
          readOnly={isViewMode}
        />

        <FormSelectField
          control={control}
          name="parent_id"
          label="PARENT CATEGORY"
          options={[
            { label: "None (Top Level)", value: "" },
            ...(categories?.data || []).map((c: any) => ({
              label: c.name,
              value: c.id,
            })),
          ]}
          readOnly={isViewMode}
        />

        <FormField
          control={control}
          name="description"
          label="DESCRIPTION"
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
      </form>
    </FormContainer>
  )
}
