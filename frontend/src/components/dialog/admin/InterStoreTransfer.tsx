import { useEffect } from "react"
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Calendar, Minus, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormTextarea,
} from "@/components/ui/form-fields"

import sectionHeader from "@/components/sectionHeader"

import {
  STORE_OPTIONS,
  BATCH_OPTIONS,
  STOCK_TRANSFER_FORM_INITIAL_DATA,
} from "@/constants/page/admin/interstoretransfer"

export default function InterStoreTransferDialog({
  open,
  onClose,
  transfer,
}: InterStoreTransferDialogProps) {
  const isViewMode = !!transfer?.viewMode
  const isEditMode = !!transfer?.id

  const { handleSubmit, control, reset, watch, setValue } = useForm({
    mode: "onChange",
  })

  const { fields, remove } = useFieldArray({
    control,
    name: "items",
  })

  const items = watch("items")

  useEffect(() => {
    if (open) {
      if (isEditMode || isViewMode) {
        reset({
          ...STOCK_TRANSFER_FORM_INITIAL_DATA,
          ...transfer,
        })
      } else {
        reset(STOCK_TRANSFER_FORM_INITIAL_DATA)
      }
    }
  }, [open, transfer, reset])

  const queryClient = useQueryClient()

  const handleMutation = useMutation({
    mutationFn: async (data: any) => data,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stock-transfer"],
      })
      reset()
      onClose(false)
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    handleMutation.mutate(data)
  }

  const totalItems = items?.length || 0
  const totalQty =
    items?.reduce(
      (sum: number, item: any) => sum + Number(item.transfer_qty || 0),
      0
    ) || 0

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={
        isViewMode
          ? "View Stock Transfer"
          : isEditMode
            ? "Edit Stock Transfer"
            : "Create Stock Transfer"
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
              form="stock-transfer-form"
              disabled={handleMutation.isPending}
            >
              {handleMutation.isPending ? "Saving..." : "Save Transfer"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="stock-transfer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Header */}
        <div className="rounded-xl border p-6">
          <div className="grid gap-5 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <FormSelectField
                control={control}
                name="from_store"
                label="FROM STORE"
                options={STORE_OPTIONS}
                readOnly={isViewMode}
              />
            </div>

            <div className="flex items-end justify-center pb-2">
              <ArrowRight className="size-5 text-muted-foreground" />
            </div>

            <div className="xl:col-span-4">
              <FormSelectField
                control={control}
                name="to_store"
                label="TO STORE"
                options={STORE_OPTIONS}
                readOnly={isViewMode}
              />
            </div>

            <div className="xl:col-span-2">
              <FormField
                control={control}
                name="transfer_date"
                label="TRANSFER DATE"
                icon={<Calendar className="size-4" />}
                readOnly={isViewMode}
              />
            </div>

            <div className="xl:col-span-2">
              <FormField
                control={control}
                name="reference_no"
                label="REFERENCE NO."
                readOnly={isViewMode}
              />
            </div>
          </div>

          <div className="mt-5">
            <FormTextarea
              control={control}
              name="notes"
              label="NOTES / REASON (OPTIONAL)"
              rows={3}
              placeholder="Enter any relevant notes for the receiving store..."
              readOnly={isViewMode}
            />
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between border-b p-6">
            {sectionHeader("01", "Transfer Items")}

            <div className="w-[320px]">
              <FormField
                control={control}
                name="medicine_search"
                placeholder="Search and add medicine..."
                icon={<Search className="size-4" />}
                readOnly={isViewMode}
              />
            </div>
          </div>

          {/* Table Head */}
          <div className="grid grid-cols-12 border-b bg-muted/30 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-4">Medicine</div>
            <div className="col-span-2">Batch</div>
            <div className="col-span-2">Expiry</div>
            <div className="col-span-2">Available</div>
            <div className="col-span-2 text-right">Transfer Qty</div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {fields.map((field, index) => {
              const qty = Number(items?.[index]?.transfer_qty || 0)

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 items-center gap-4 px-6 py-5"
                >
                  <div className="col-span-4">
                    <p className="font-medium">{items[index]?.medicine}</p>
                    <p className="text-sm text-muted-foreground">
                      {items[index]?.category}
                    </p>
                  </div>

                  <div className="col-span-2">
                    {items[index]?.batch ? (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        {items[index]?.batch}
                      </span>
                    ) : (
                      <FormSelectField
                        control={control}
                        name={`items.${index}.batch`}
                        options={BATCH_OPTIONS}
                        placeholder={"select batch"}
                        label={"control"}
                      />
                    )}
                  </div>

                  <div className="col-span-2 text-red-500">
                    {items[index]?.expiry}
                  </div>

                  <div className="col-span-2">
                    {items[index]?.available || "-"}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {!isViewMode && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            setValue(
                              `items.${index}.transfer_qty`,
                              Math.max(qty - 1, 0)
                            )
                          }
                        >
                          <Minus className="size-4" />
                        </Button>

                        <div className="w-12 text-center font-medium">
                          {qty}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            setValue(`items.${index}.transfer_qty`, qty + 1)
                          }
                        >
                          <Plus className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </>
                    )}

                    {isViewMode && <div className="font-medium">{qty}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
            <p>
              Total Items:{" "}
              <span className="font-medium text-foreground">{totalItems}</span>
            </p>

            <p>
              Total Quantity:{" "}
              <span className="font-medium text-foreground">{totalQty}</span>
            </p>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
