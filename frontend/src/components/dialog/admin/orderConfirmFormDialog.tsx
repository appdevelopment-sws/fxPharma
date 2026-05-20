import { useEffect, useMemo } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Package,
  Plus,
  Trash2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ordersApi } from "@/services/ordersApi"
import { queryKeys } from "@/lib/queryKeys"
import { PACKAGING_TYPE_OPTIONS } from "@/constants/page/admin/inventory"

type OrderConfirmItem = {
  tempId: string
  inventoryId?: string
  unit: string
  name: string
  description?: string
  qty: number
  freeQty: number
  batchNo: string
  expiry: string
  purchaseRate: number
  mrp: number
  rate1: number
  rate2: number
  rate3: number

  cgst: number
  sgst: number
  freeUnit: string
}

type OrderConfirmFormValues = {
  supplierId: string
  status: string
  receivedAt: string
  invoiceNo: string
  notes: string
  items: OrderConfirmItem[]
}

interface OrderConfirmFormDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  order?: any | null
}

const createTempId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const toDateInputValue = (value?: string | Date) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString().slice(0, 10)
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildRowFromItem = (item: any): OrderConfirmItem => ({
  tempId: item.tempId || item.id || createTempId(),
  inventoryId: item.inventoryId || item.inventory?.id,
  unit: item.unit || "strips",
  name: item.inventory?.name || item.name || "",
  description: item.inventory?.saltComposition || item.description || "",
  qty: toNumber(item.qty || item.ordQty || 1),
  freeQty: toNumber(item.freeQty || item.free || 0),
  batchNo: item.batchNo || item.batch || "",
  expiry: item.inventory?.daysLimit || "",
  purchaseRate: toNumber(item.purchaseRate),
  mrp: toNumber(item.inventory?.mrp),
  rate1: toNumber(item.inventory?.rateA),
  rate2: toNumber(item.inventory?.rateB),
  rate3: toNumber(item.inventory?.rateC),
  cgst: toNumber(item.inventory?.cgst),
  sgst: toNumber(item.inventory?.sgst),
  freeUnit: item.freeUnit || item.freeUnit || "strips",
})

const buildBlankRow = (): OrderConfirmItem => ({
  tempId: createTempId(),
  inventoryId: "",
  unit: "strips",
  name: "",
  description: "",
  qty: 1,
  freeQty: 0,
  batchNo: "",
  expiry: "",
  purchaseRate: 0,
  mrp: 0,
  rate1: 0,
  rate2: 0,
  rate3: 0,
  cgst: 0,
  sgst: 0,
  freeUnit: "strips",
})

export default function OrderConfirmFormDialog({
  open,
  onClose,
  order,
}: OrderConfirmFormDialogProps) {
  const queryClient = useQueryClient()

  const { control, register, handleSubmit, reset, setValue } =
    useForm<OrderConfirmFormValues>({
      defaultValues: {
        supplierId: "",
        status: "DELIVERED",
        receivedAt: toDateInputValue(new Date()),
        invoiceNo: "",
        notes: "",
        items: [buildBlankRow()],
      },
    })

  const items =
    useWatch({
      control,
      name: "items",
    }) || []

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    if (!open) return
    // console.table(order?.items)
    const items =
      Array.isArray(order?.items) && order.items.length > 0
        ? order.items.map(buildRowFromItem)
        : [buildBlankRow()]
    console.table(items)
    reset({
      supplierId: order?.supplierId || order?.supplier?.id || "",
      status: order?.status || "DELIVERED",
      receivedAt: toDateInputValue(
        order?.receivedAt || order?.updatedAt || order?.createdAt || new Date()
      ),
      invoiceNo: order?.invoiceNo || "",
      notes: order?.notes || "",
      items,
    })
  }, [open, order, reset])

  const totals = useMemo(() => {
    const totalProducts = items.length
    const totalUnitsReceived = items.reduce(
      (sum, item) => sum + toNumber(item.qty) + toNumber(item.freeQty),
      0
    )
    const estimatedValue = items.reduce(
      (sum, item) => sum + toNumber(item.qty) * toNumber(item.purchaseRate),
      0
    )

    return {
      totalProducts,
      totalUnitsReceived,
      estimatedValue,
    }
  }, [items])

  const saveMutation = useMutation({
    mutationFn: async (values: OrderConfirmFormValues) => {
      if (!order?.id) {
        throw new Error("Order id is missing")
      }

      return ordersApi.update(order.id, {
        ...values,
        status: "COMPLETED",
        items: values.items,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.success("Order received and inventory updated")
      onClose(false)
    },
    onError: () => {
      toast.error("Failed to update received order")
    },
  })

  const onSubmit = (values: OrderConfirmFormValues) => {
    saveMutation.mutate(values)
  }
  const updateUnit = (index: number, unit: string) => {
    setValue(`items.${index}.unit`, unit, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const originalPoUrl =
    order?.originalPoUrl || order?.poUrl || order?.documentUrl

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Receive Order"
      description="Confirm the received stock, batches, expiry, and rates before updating inventory."
      size="extrafull"
      height="extrafull"
      footer={null}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1860px] space-y-6"
      >
        <div className="flex flex-col gap-4 rounded-3xl lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                {order?.supplier?.name ||
                  order?.supplier?.companyName ||
                  "Supplier not selected"}
              </span>
              <span className="hidden text-muted-foreground/40 sm:inline">
                |
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "No order date"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-border/60 bg-background px-5 font-semibold text-foreground shadow-sm"
              disabled={!originalPoUrl}
              onClick={() => {
                if (originalPoUrl) {
                  window.open(originalPoUrl, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <FileText className="mr-2 size-4" />
              Original PO
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-2xl px-6 font-semibold shadow-lg"
              disabled={saveMutation.isPending}
            >
              <CircleDollarSign className="mr-2 size-4" />
              {saveMutation.isPending ? "Saving..." : "Save & Update Inventory"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Total Products
                </p>
                <p className="text-3xl font-black text-card-foreground">
                  {totals.totalProducts} Items
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Total Units Received
                </p>
                <p className="text-3xl font-black text-card-foreground">
                  {totals.totalUnitsReceived}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CircleDollarSign className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Estimated Value
                </p>
                <p className="text-3xl font-black text-card-foreground">
                  ₹{totals.estimatedValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-border/60 bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/60 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black text-card-foreground">
                Received Items List
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review quantities, batches, expiry, and pricing before saving.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl border-border/60 bg-background px-4 font-semibold text-foreground hover:bg-muted"
              onClick={() => append(buildBlankRow())}
            >
              <Plus className="mr-2 size-4" />
              Add Item
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="w-max">
              <div className="grid grid-cols-14 gap-3 border-b border-border/60 px-6 py-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                <div className="col-span-1">Product Details</div>
                <div className="col-span-1 text-center">Ord Qty</div>
                <div className="col-span-1 text-center">Free</div>
                <div className="col-span-1">Batch No.</div>
                <div className="col-span-1">Expiry</div>
                <div className="col-span-1">Purchase</div>
                <div className="col-span-1">MRP/Sell</div>
                <div className="col-span-1">Rate 1</div>
                <div className="col-span-1">Rate 2</div>
                <div className="col-span-1">Rate 3</div>
                <div className="col-span-1">CGST</div>
                <div className="col-span-1">SGST</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="divide-y divide-border/60">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-14 items-center gap-3 px-6 py-4"
                  >
                    <div className="col-span-1">
                      <div className="space-y-2">
                        <Input
                          {...register(`items.${index}.name`)}
                          placeholder="Product name"
                          className="h-10 rounded-2xl border-border/60 bg-background font-semibold text-foreground"
                        />
                        {/* <Input
                          {...register(`items.${index}.description`)}
                          placeholder="description"
                          className="h-10 rounded-2xl border-border/60 bg-background text-muted-foreground"
                        /> */}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center overflow-hidden rounded-2xl border border-border/60 bg-background focus-within:ring-2 focus-within:ring-primary/20">
                        {/* Qty Input */}
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          {...register(`items.${index}.qty`, {
                            valueAsNumber: true,
                          })}
                          className="h-10 w-20 border-0 bg-transparent text-center font-semibold shadow-none focus-visible:ring-0"
                        />

                        {/* Divider */}
                        <div className="h-6 w-px bg-border/60" />
                        {/* Unit Select */}
                        <select
                          {...register(`items.${index}.unit`)}
                          className="flex-1 bg-transparent px-3 text-sm font-medium outline-none"
                        >
                          {PACKAGING_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center overflow-hidden rounded-2xl border border-border/60 bg-background focus-within:ring-2 focus-within:ring-primary/20">
                        {/* Qty Input */}
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          {...register(`items.${index}.freeQty`, {
                            valueAsNumber: true,
                          })}
                          className="h-10 w-20 border-0 bg-transparent text-center font-semibold shadow-none focus-visible:ring-0"
                        />

                        {/* Divider */}
                        <div className="h-6 w-px bg-border/60" />

                        {/* Unit Select */}
                        <select
                          {...register(`items.${index}.freeUnit`)}
                          className="flex-1 bg-transparent px-3 text-sm font-medium outline-none"
                        >
                          {PACKAGING_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Input
                        {...register(`items.${index}.batchNo`)}
                        placeholder="Batch"
                        className="h-10 rounded-2xl border-border/60 text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="text"
                        {...register(`items.${index}.expiry`)}
                        placeholder="MM/YY"
                        className="h-10 rounded-2xl border-border/60 text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.purchaseRate`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.mrp`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate1`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate2`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate3`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>{" "}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        {...register(`items.${index}.cgst`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        {...register(`items.${index}.sgst`, {
                          valueAsNumber: true,
                        })}
                        className="h-10 rounded-2xl border-border/60 text-right font-semibold text-foreground"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-10 w-10 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-sm">
            <h4 className="text-lg font-black text-card-foreground">
              Receiving Notes
            </h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Received Date
                </label>
                <Input
                  type="date"
                  {...register("receivedAt")}
                  className="h-11 rounded-2xl border-border/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Invoice No.
                </label>
                <Input
                  {...register("invoiceNo")}
                  placeholder="Invoice / GRN number"
                  className="h-11 rounded-2xl border-border/60"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Notes
              </label>
              <Input
                {...register("notes")}
                placeholder="Short note for receiving..."
                className="h-11 rounded-2xl border-border/60"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-card p-6 text-card-foreground shadow-sm">
            <h4 className="text-lg font-black">Quick Summary</h4>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-semibold">
                  {order?.supplier?.name ||
                    order?.supplier?.companyName ||
                    "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">Order Items</span>
                <span className="font-semibold">{totals.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">Units</span>
                <span className="font-semibold">
                  {totals.totalUnitsReceived}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 text-primary">
                <span className="font-semibold">Estimated Value</span>
                <span className="text-lg font-black">
                  ₹{totals.estimatedValue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </form>
    </FormContainer>
  )
}
