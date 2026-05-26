import { useEffect, useMemo } from "react"
import {
  useForm,
  type SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { queryKeys } from "@/lib/queryKeys"
import InvoiceApi from "@/services/invoiceApi"
import ReturnApi from "@/services/returnApi"
import { FormContainer } from "@/components/formContainer"
import {
  FormSelectField,
  FormTextarea,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import {
  RETURN_REASON_OPTIONS,
  REFUND_METHOD_OPTIONS,
} from "@/constants/page/admin/returns"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { buildReturnItems, type ReturnFormItem } from "./returnFormUtils"

interface ProcessReturnDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
  invoiceId?: string | null
}

type ReturnFormValues = {
  invoice_number: string
  reason_for_return: string
  refund_method: string
  note: string
  items: ReturnFormItem[]
  restocking_fee: number
}

const defaultValues: ReturnFormValues = {
  invoice_number: "",
  reason_for_return: "",
  refund_method: "upi",
  note: "",
  items: [],
  restocking_fee: 0,
}

export default function ProcessReturnDrawer({
  open,
  onClose,
  invoiceId,
}: ProcessReturnDrawerProps) {
  const queryClient = useQueryClient()

  const { handleSubmit, control, getValues, setValue, reset } =
    useForm<ReturnFormValues>({
      defaultValues,
    })

  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  })

  const {
    data: invoiceData,
    isLoading: isLoadingInvoice,
    isFetching: isFetchingInvoice,
    isError: isInvoiceError,
  } = useQuery({
    queryKey: invoiceId ? queryKeys.invoices.detail(invoiceId) : queryKeys.invoices.detail(""),
    queryFn: () => InvoiceApi.getInvoice(invoiceId as string),
    enabled: open && Boolean(invoiceId),
  })

  const invoice = invoiceData?.data
  const watchedItems = useWatch({ control, name: "items" })
  const items = useMemo(() => watchedItems ?? [], [watchedItems])
  const restockingFee = Number(useWatch({ control, name: "restocking_fee" })) || 0

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      replace([])
      return
    }

    if (invoice) {
      reset({
        ...defaultValues,
        invoice_number: invoice.invoice_id,
      })
      replace(buildReturnItems(invoice))
      return
    }

    if (!invoiceId) {
      reset(defaultValues)
      replace([])
    }
  }, [invoice, invoiceId, open, replace, reset])

  const summary = useMemo(() => {
    const selectedItems = items.filter((item) => item.selected)
    const subtotal = selectedItems.reduce(
      (acc, item) => acc + item.unit_price * item.return_qty,
      0
    )
    const tax = subtotal * 0.12
    const total = subtotal + tax - restockingFee

    return {
      count: selectedItems.length,
      subtotal,
      tax,
      total,
    }
  }, [items, restockingFee])

  const processMutation = useMutation({
    mutationFn: (data: ReturnFormValues) => ReturnApi.processReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      toast.success("Return processed successfully")
      onClose(false)
      reset(defaultValues)
      replace([])
    },
    onError: (error: unknown) => {
      const errMsg =
        (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message === "string" &&
          (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message) ||
        (error instanceof Error ? error.message : null) ||
        "Failed to process return"
      toast.error(errMsg)
    },
  })

  const onSubmit: SubmitHandler<ReturnFormValues> = (data) => {
    if (!invoiceId || !invoice) {
      toast.error("Please select an invoice first")
      return
    }

    const selectedItems = data.items.filter(
      (item) => item.selected && Number(item.return_qty) > 0
    )

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return")
      return
    }

    processMutation.mutate({ ...data, items: selectedItems })
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Process Return"
      description="Process a sales return for a selected invoice."
      size="xl"
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Invoice Details
            </h3>
            {invoice && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                <CheckCircle2 className="size-3.5" />
                {invoice.invoice_id} FOUND
              </div>
            )}
          </div>

          {isLoadingInvoice || isFetchingInvoice ? (
            <div className="py-4 text-sm text-muted-foreground">
              Loading invoice...
            </div>
          ) : invoice ? (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Invoice Number
                </p>
                <p className="font-semibold">{invoice.invoice_id}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Customer
                </p>
                <p className="font-semibold">
                  {invoice.customer_name || "Walk-in Customer"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="font-semibold">{invoice.customer_phone || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Date
                </p>
                <p className="font-semibold">{invoice.createdAt}</p>
              </div>
            </div>
          ) : isInvoiceError ? (
            <div className="py-4 text-sm text-destructive">
              Invoice could not be loaded.
            </div>
          ) : (
            <div className="py-4 text-sm text-muted-foreground">
              Open this dialog with an invoice ID to begin processing.
            </div>
          )}
        </div>

        {invoice && (
          <>
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 p-4">
                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Select Items to Return
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20 text-left font-medium text-muted-foreground">
                      <th className="w-12 p-4">
                        <Checkbox />
                      </th>
                      <th className="p-4">ITEM DETAILS</th>
                      <th className="p-4">UNIT PRICE</th>
                      <th className="p-4">PURCHASED</th>
                      <th className="p-4 text-center">RETURN QTY</th>
                      <th className="p-4">REASON</th>
                      <th className="p-4 text-right">REFUND AMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fields.map((field, index) => {
                      const item = items[index] ?? field

                      return (
                        <tr
                          key={field.id}
                          className={cn(
                            "transition-colors",
                            item.selected ? "bg-primary/5" : "opacity-60"
                          )}
                        >
                          <td className="p-4">
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                setValue(`items.${index}.selected`, !!checked)
                              }
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-foreground">
                              {field.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Batch: {field.batch} | Exp: {field.expiry}
                            </div>
                          </td>
                          <td className="p-4">₹{field.unit_price.toFixed(2)}</td>
                          <td className="p-4">{field.purchased_qty}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                onClick={() => {
                                  const val = getValues(
                                    `items.${index}.return_qty`
                                  )
                                  if (val > 0) {
                                    setValue(
                                      `items.${index}.return_qty`,
                                      val - 1
                                    )
                                  }
                                }}
                              >
                                <Minus className="size-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.return_qty}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                onClick={() => {
                                  const val = getValues(
                                    `items.${index}.return_qty`
                                  )
                                  if (val < field.purchased_qty) {
                                    setValue(
                                      `items.${index}.return_qty`,
                                      val + 1
                                    )
                                  }
                                }}
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-4">
                            <FormSelectField
                              control={control}
                              name={`items.${index}.reason`}
                              options={RETURN_REASON_OPTIONS}
                              placeholder="Select Reason"
                              className="w-40"
                            />
                          </td>
                          <td className="p-4 text-right font-semibold">
                            ₹{(item.unit_price * item.return_qty).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
                <h3 className="border-b pb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Refund Processing
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormSelectField
                    control={control}
                    name="reason_for_return"
                    label="Reason for Return"
                    options={RETURN_REASON_OPTIONS}
                    required
                  />
                  <FormSelectField
                    control={control}
                    name="refund_method"
                    label="Refund Method"
                    options={REFUND_METHOD_OPTIONS}
                    required
                  />
                </div>
                <FormTextarea
                  control={control}
                  name="note"
                  label="Add Note (Optional)"
                  placeholder="Add any details about the return condition, customer feedback, etc."
                />
              </div>

              <div className="flex flex-col space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({summary.count} item)
                    </span>
                    <span className="font-medium">
                      ₹{summary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span className="font-medium">₹{summary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Restocking Fee</span>
                    <span className="font-medium">
                      -₹{restockingFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-lg font-bold">Total Refund</span>
                    <span className="text-lg font-bold text-primary">
                      ₹{summary.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full py-6 text-base font-bold shadow-lg"
                    disabled={processMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 size-5" />
                    Process Return
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 text-base"
                    onClick={() => onClose(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </FormContainer>
  )
}
