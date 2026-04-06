import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi from "@/services/masterProductApi"
import { FormContainer } from "@/components/formContainer"
import Each from "@/components/Each"
import ControlledFormComponent from "@/components/shared/ControlledFormComponent"
import {
  MASTER_PRODUCT_DIALOG_FORM_LAYOUT,
  MASTER_PRODUCT_REFERENCE_FORM_LAYOUT,
  MASTER_PRODUCT_FORM_INITIAL_DATA,
} from "@/constants/page/super-admin/master-products"

interface MasterProductDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  product?: any | null // using any for rapid prototyping, optimally a MasterProduct type
}

export default function MasterProductDialog({
  open,
  onClose,
  product,
}: MasterProductDialogProps) {
  const isViewMode = !!product?.viewMode
  const isEditMode = !!product?.id
  const productId = product?.id

  const { handleSubmit, control, reset } = useForm({
    defaultValues: MASTER_PRODUCT_FORM_INITIAL_DATA,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          name: product?.name || "",
          salt: product?.salt || "",
          brand_name: product?.brand_name || "",
          barcode: product?.barcode || "",
          pack_size: product?.pack_size || "",
          strength: product?.strength || "",
          company_id: product?.company_id ? String(product.company_id) : "",
          product_type_id: product?.product_type_id
            ? String(product.product_type_id)
            : "",
          hsnCodeId: product?.hsnCodeId ? String(product.hsnCodeId) : "",
        })
      } else {
        reset(MASTER_PRODUCT_FORM_INITIAL_DATA)
      }
    }
  }, [open, product, reset, isEditMode, isViewMode])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: (submitData: any) =>
      isEditMode
        ? ProductApi.updateProduct(productId, submitData)
        : ProductApi.createProduct(submitData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterProducts.all,
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = async (data) => {
    handleMutation.mutate(data)
  }

  return (
    <FormContainer
      variant="drawer"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={
        isViewMode
          ? "View Product"
          : isEditMode
            ? "Edit Product"
            : "Add Product"
      }
      description={
        isViewMode
          ? "Viewing master product details."
          : isEditMode
            ? "Update master product details."
            : "Create a new generic master product."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-md border px-4 py-2"
            onClick={() => onClose(false)}
            disabled={handleMutation.isPending}
          >
            {isViewMode ? "Close" : "Cancel"}
          </button>
          {!isViewMode && (
            <button
              type="submit"
              form="master-product-dialog-form"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </button>
          )}
        </div>
      }
    >
      <form
        id="master-product-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <section className="grid gap-4">
          <Each
            of={MASTER_PRODUCT_DIALOG_FORM_LAYOUT}
            render={(form: any) => (
              <ControlledFormComponent
                control={control}
                {...form}
                readOnly={isViewMode}
              />
            )}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Each
            of={MASTER_PRODUCT_REFERENCE_FORM_LAYOUT}
            render={(form: any) => (
              <ControlledFormComponent
                control={control}
                {...form}
                readOnly={isViewMode}
              />
            )}
          />
        </section>
      </form>
    </FormContainer>
  )
}
