import { useState, useMemo } from "react"
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Minus, Plus, CheckCircle2, X, Trash2 } from "lucide-react"
import { queryKeys } from "@/lib/queryKeys"
import ReturnApi from "@/services/returnApi"
import { FormContainer } from "@/components/formContainer"
import {
  FormField,
  FormSelectField,
  FormTextarea,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  RETURN_REASON_OPTIONS,
  REFUND_METHOD_OPTIONS,
} from "@/constants/page/admin/returns"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProcessReturnDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
}

export default function ProcessReturnDrawer({
  open,
  onClose,
}: ProcessReturnDrawerProps) {
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [isInvoiceFound, setIsInvoiceFound] = useState(false)
  const queryClient = useQueryClient()

  const { handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: {
      invoice_number: "",
      reason_for_return: "",
      refund_method: "upi",
      note: "",
      items: [
        {
          id: "1",
          selected: true,
          name: "Augmentin 625 Duo Tablet",
          batch: "B-102",
          expiry: "12/2025",
          unit_price: 150,
          purchased_qty: 2,
          return_qty: 1,
          reason: "wrong_item",
        },
        {
          id: "2",
          selected: false,
          name: "Dolo 650 Tablet (Strip of 15)",
          batch: "C-405",
          expiry: "Exp:",
          unit_price: 30,
          purchased_qty: 5,
          return_qty: 0,
          reason: "",
        },
      ],
      restocking_fee: 0,
    },
  })

  const { fields } = useFieldArray({
    control,
    name: "items",
  })

  const items = watch("items")
  const restockingFee = watch("restocking_fee")

  const summary = useMemo(() => {
    const selectedItems = items.filter((item) => item.selected)
    const subtotal = selectedItems.reduce(
      (acc, item) => acc + item.unit_price * item.return_qty,
      0
    )
    const tax = subtotal * 0.12 // Example tax
    const total = subtotal + tax - restockingFee

    return {
      count: selectedItems.length,
      subtotal,
      tax,
      total,
    }
  }, [items, restockingFee])

  const handleSearch = () => {
    if (invoiceSearch === "INV-2023-086") {
      setIsInvoiceFound(true)
      toast.success("Invoice Found")
    } else {
      toast.error("Invoice not found")
    }
  }

  const processMutation = useMutation({
    mutationFn: (data: any) => ReturnApi.processReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      toast.success("Return processed successfully")
      onClose(false)
      reset()
      setIsInvoiceFound(false)
      setInvoiceSearch("")
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    const selectedItems = data.items.filter((i: any) => i.selected)
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
      description="Create a sales return by searching for an original invoice."
      size="xl"
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Details */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Invoice Details
            </h3>
            {isInvoiceFound && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                <CheckCircle2 className="size-3.5" />
                INV-2023-086 FOUND
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Invoice ID (e.g. INV-2023-086)"
                className="pl-10"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {isInvoiceFound && (
          <>
            {/* Select Items */}
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
                    {fields.map((field, index) => (
                      <tr
                        key={field.id}
                        className={cn(
                          "transition-colors",
                          items[index].selected ? "bg-primary/5" : "opacity-60"
                        )}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={items[index].selected}
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
                                const val = watch(`items.${index}.return_qty`)
                                if (val > 0)
                                  setValue(`items.${index}.return_qty`, val - 1)
                              }}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {items[index].return_qty}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              onClick={() => {
                                const val = watch(`items.${index}.return_qty`)
                                if (val < field.purchased_qty)
                                  setValue(`items.${index}.return_qty`, val + 1)
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
                          ₹
                          {(
                            items[index].unit_price * items[index].return_qty
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Processing */}
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
                    <span className="font-medium">
                      ₹{summary.tax.toFixed(2)}
                    </span>
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
