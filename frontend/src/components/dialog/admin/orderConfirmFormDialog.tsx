import { useEffect, useMemo, useRef } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Clock3,
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
import { DISCOUNT_TYPE_OPTIONS } from "@/constants/shared/discountTypes"

const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Debit", value: "debit" },
  { label: "UPI", value: "upi" },
]

type OrderConfirmItem = {
  tempId: string
  inventoryId?: string
  unit: string
  name: string
  description?: string
  qty: number
  freeQty: number
  freeQtyInput?: string
  unitRate?: number
  batchNo: string
  expiry: string
  purchaseRate: number
  mrp: number
  rate1: number
  rate2: number
  rate3: number
  discount: number
  discount_type: string
  cgst: number
  sgst: number
  freeUnit: string
}

type OrderPaymentHistoryItem = {
  id?: string
  amount: number
  paymentMode?: string | null
  paymentDetails?: string | null
  isUdhar?: boolean
  notes?: string | null
  paidAt?: string
  createdAt?: string
}

type OrderConfirmFormValues = {
  supplierId: string
  status: string
  receivedAt: string
  invoiceNo: string
  notes: string
  paymentMode: string
  paymentDetails: string
  isUdhar: string
  paidAmount: number
  items: OrderConfirmItem[]
  paymentHistory?: OrderPaymentHistoryItem[]
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

const EXPIRY_INPUT_PATTERN = /^(0[1-9]|1[0-2])\/(\d{2})$/

const toDateInputValue = (value?: string | Date) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString().slice(0, 10)
}

const formatExpiryTyping = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const toExpiryInputValue = (value?: string | Date) => {
  if (!value) return ""

  if (typeof value === "string") {
    const trimmed = value.trim()
    const monthYearMatch = trimmed.match(/^(\d{1,2})\/(\d{2}|\d{4})$/)
    if (monthYearMatch) {
      const month = String(Number(monthYearMatch[1])).padStart(2, "0")
      const year = monthYearMatch[2].slice(-2)
      return `${month}/${year}`
    }

    if (EXPIRY_INPUT_PATTERN.test(trimmed)) {
      return trimmed
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getFullYear()
  ).slice(-2)}`
}

const normalizeExpiryForStorage = (value?: string) => {
  if (!value) return ""

  const normalized = toExpiryInputValue(value)
  return EXPIRY_INPUT_PATTERN.test(normalized) ? normalized : ""
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const normUnit = (u?: string) => {
  if (!u) return "strip"
  const l = u.trim().toLowerCase()
  if (l === "strips") return "strip"
  return l
}

const buildRowFromItem = (item: any): OrderConfirmItem => {
  const qty = toNumber(item.qty || item.ordQty || 1)
  const freeQty = toNumber(item.freeQty || item.free || 0)
  const dbPurchaseRate = toNumber(item.purchaseRate)
  const purchaseRate = dbPurchaseRate * (qty + freeQty)
  const unitRate = qty > 0 ? purchaseRate / qty : dbPurchaseRate

  return {
    tempId: item.tempId || item.id || createTempId(),
    inventoryId: item.inventoryId || item.inventory?.id,
    unit: normUnit(item.unit),
    name: item.inventory?.name || item.name || "",
    description: item.inventory?.saltComposition || item.description || "",
    qty,
    freeQty,
    freeQtyInput: String(freeQty),
    unitRate: Math.round(unitRate * 100) / 100,
    batchNo: item.batchNo || item.batch || "",
    expiry: toExpiryInputValue(item.expiry || item.inventory?.daysLimit),
    purchaseRate: Math.round(purchaseRate * 100) / 100,
    mrp: toNumber(item.inventory?.mrp),
    rate1: toNumber(item.inventory?.rateA),
    rate2: toNumber(item.inventory?.rateB),
    rate3: toNumber(item.inventory?.rateC),
    cgst: toNumber(item.inventory?.cgst),
    sgst: toNumber(item.inventory?.sgst),
    freeUnit: normUnit(item.freeUnit),
    discount: toNumber(item.discount || 0),
    discount_type: item.discount_type || item.discountType || "flat",
  }
}

const buildBlankRow = (): OrderConfirmItem => ({
  tempId: createTempId(),
  inventoryId: "",
  unit: "strip",
  name: "",
  description: "",
  qty: 1,
  freeQty: 0,
  freeQtyInput: "0",
  unitRate: 0,
  batchNo: "",
  expiry: "",
  purchaseRate: 0,
  mrp: 0,
  rate1: 0,
  rate2: 0,
  rate3: 0,
  cgst: 0,
  sgst: 0,
  freeUnit: "strip",
  discount: 0,
  discount_type: "flat",
})

const formatDateTime = (value?: string) => {
  if (!value) return "Unknown date"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString()
}

const normalizePaymentHistory = (
  order: any,
  fallbackPaidAmount: number
): OrderPaymentHistoryItem[] => {
  const history = Array.isArray(order?.paymentHistory)
    ? order.paymentHistory
    : []

  if (history.length > 0) {
    return history
      .map((entry: any) => ({
        id: entry.id,
        amount: toNumber(entry.amount),
        paymentMode: entry.paymentMode || null,
        paymentDetails: entry.paymentDetails || null,
        isUdhar: Boolean(entry.isUdhar),
        notes: entry.notes || null,
        paidAt: entry.paidAt || entry.createdAt,
        createdAt: entry.createdAt,
      }))
      .sort((a, b) => {
        const aTime = new Date(a.paidAt || a.createdAt || 0).getTime()
        const bTime = new Date(b.paidAt || b.createdAt || 0).getTime()
        return bTime - aTime
      })
  }

  if (fallbackPaidAmount <= 0) {
    return []
  }

  return [
    {
      id: "legacy-paid-amount",
      amount: fallbackPaidAmount,
      paymentMode: order?.paymentMode || null,
      paymentDetails: order?.paymentDetails || null,
      isUdhar:
        order?.isUdhar === true ||
        order?.isUdhar === "YES" ||
        order?.isUdhar === "yes",
      notes: order?.notes || null,
      paidAt: order?.updatedAt || order?.createdAt,
      createdAt: order?.createdAt,
    },
  ]
}

export default function OrderConfirmFormDialog({
  open,
  onClose,
  order,
}: OrderConfirmFormDialogProps) {
  const queryClient = useQueryClient()

  const { control, register, handleSubmit, reset, setValue, getValues } =
    useForm<OrderConfirmFormValues>({
      defaultValues: {
        supplierId: "",
        status: "DELIVERED",
        receivedAt: toDateInputValue(new Date()),
        invoiceNo: "",
        notes: "",
        paymentMode: "cash",
        paymentDetails: "",
        isUdhar: "NO",
        paidAmount: 0,
        items: [buildBlankRow()],
      },
    })

  const items =
    useWatch({
      control,
      name: "items",
    }) || []
  const paidAmount = useWatch({
    control,
    name: "paidAmount",
  })
  const isUdhar = useWatch({
    control,
    name: "isUdhar",
  })

  const savedPaidAmount = toNumber(order?.paidAmount)
  const paymentHistory = useMemo(
    () => normalizePaymentHistory(order, savedPaidAmount),
    [order, savedPaidAmount]
  )
  const totalPaidSoFar = useMemo(
    () =>
      paymentHistory.reduce((sum, entry) => sum + toNumber(entry.amount), 0),
    [paymentHistory]
  )

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const handleRowCalculation = (index: number) => {
    const item = getValues(`items.${index}`)
    if (!item) return

    const qty = toNumber(item.qty)
    const freeQtyInput = String(item.freeQtyInput || "")
    const unitRate = toNumber(item.unitRate)

    const trimmed = freeQtyInput.trim()
    const schemeMatch = trimmed.match(/^(\d+)\s*\+\s*(\d+)$/)

    let freeQty = 0
    let purchaseRate = 0

    if (schemeMatch) {
      const buyFactor = toNumber(schemeMatch[1])
      const freeFactor = toNumber(schemeMatch[2])

      if (buyFactor > 0) {
        // Free quantity received is based on physical purchase threshold
        freeQty = Math.floor((qty * freeFactor) / buyFactor)
        // Scheme adjusted unit rate
        const adjustedUnitRate =
          (unitRate * buyFactor) / (buyFactor + freeFactor)
        // Purchase (Amount) in UI is the Row Total: (qty + freeQty) * adjustedUnitRate
        purchaseRate = (qty + freeQty) * adjustedUnitRate
      }
    } else {
      freeQty = toNumber(trimmed)
      // Purchase (Amount) in UI for simple free is the Row Total: qty * unitRate
      purchaseRate = qty * unitRate
    }

    purchaseRate = Math.round(purchaseRate * 100) / 100

    setValue(`items.${index}.freeQty`, freeQty, { shouldDirty: true })
    setValue(`items.${index}.purchaseRate`, purchaseRate, { shouldDirty: true })
  }

  useEffect(() => {
    if (!open) return
    const items =
      Array.isArray(order?.items) && order.items.length > 0
        ? order.items.map(buildRowFromItem)
        : [buildBlankRow()]

    const normalizedIsUdhar =
      order?.isUdhar === true ||
      order?.isUdhar === "YES" ||
      order?.isUdhar === "yes"
    reset({
      supplierId: order?.supplierId || order?.supplier?.id || "",
      status: order?.status || "DELIVERED",
      receivedAt: toDateInputValue(
        order?.receivedAt || order?.updatedAt || order?.createdAt || new Date()
      ),
      invoiceNo: order?.invoiceNo || "",
      notes: order?.notes || "",
      paymentMode: order?.paymentMode || "cash",
      paymentDetails: order?.paymentDetails || "",
      isUdhar: normalizedIsUdhar ? "YES" : "NO",
      paidAmount: 0,
      items,
    })
  }, [open, order, reset])

  const totals = useMemo(() => {
    const totalProducts = items.length
    const totalUnitsReceived = items.reduce(
      (sum, item) => sum + toNumber(item.qty) + toNumber(item.freeQty),
      0
    )
    const subtotalExclTax = items.reduce((sum, item) => {
      return sum + toNumber(item.purchaseRate)
    }, 0)
    const totalDiscountAmount = items.reduce((sum, item) => {
      const lineBase = toNumber(item.purchaseRate)
      const discountValue = toNumber(item.discount)

      if ((item.discount_type || "flat") === "percentage") {
        return sum + (lineBase * discountValue) / 100
      }

      return sum + discountValue
    }, 0)
    const totalTax = items.reduce((sum, item) => {
      const lineBase = toNumber(item.purchaseRate)
      const discountValue = toNumber(item.discount)
      const discountAmount =
        (item.discount_type || "flat") === "percentage"
          ? (lineBase * discountValue) / 100
          : discountValue
      const taxableAmount = Math.max(0, lineBase - discountAmount)
      const lineTaxPercent = toNumber(item.cgst) + toNumber(item.sgst)

      return sum + (taxableAmount * lineTaxPercent) / 100
    }, 0)
    const netPayable = Math.max(
      0,
      subtotalExclTax - totalDiscountAmount + totalTax
    )
    const balanceDue = Math.max(
      0,
      netPayable - totalPaidSoFar - toNumber(paidAmount)
    )

    return {
      totalProducts,
      totalUnitsReceived,
      subtotalExclTax,
      totalTax,
      totalDiscountAmount,
      netPayable,
      balanceDue,
    }
  }, [items, paidAmount, totalPaidSoFar])

  const isAlreadyReceived =
    order?.status === "PENDING" || order?.status === "COMPLETED"

  const remainingAmount = useMemo(() => {
    return Math.max(0, totals.netPayable - totalPaidSoFar)
  }, [totals.netPayable, totalPaidSoFar])

  const prevIsUdharRef = useRef(isUdhar)
  useEffect(() => {
    if (!open) return

    if (isUdhar === "NO") {
      setValue("paidAmount", remainingAmount, {
        shouldDirty: true,
        shouldTouch: true,
      })
    } else if (isUdhar === "YES" && prevIsUdharRef.current === "NO") {
      setValue("paidAmount", 0, {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
    prevIsUdharRef.current = isUdhar
  }, [open, isUdhar, remainingAmount, setValue])

  const saveMutation = useMutation({
    mutationFn: async (values: OrderConfirmFormValues) => {
      if (!order?.id) {
        throw new Error("Order id is missing")
      }

      const balanceDue = Math.max(
        0,
        totals.netPayable - toNumber(values.paidAmount)
      )
      const determinedStatus = balanceDue < 0.01 ? "COMPLETED" : "PENDING"
      const isUdharValue =
        determinedStatus === "COMPLETED" ? "NO" : values.isUdhar

      const cleanedItems = values.items.map((item) => {
        const { freeQtyInput, unitRate, ...rest } = item
        const totalQty = toNumber(item.qty) + toNumber(item.freeQty)
        const dbPurchaseRate =
          totalQty > 0
            ? toNumber(item.purchaseRate) / totalQty
            : toNumber(item.purchaseRate)
        return {
          ...rest,
          purchaseRate: Math.round(dbPurchaseRate * 100) / 100,
        }
      })

      return ordersApi.update(order.id, {
        ...values,
        isUdhar: isUdharValue,
        status: determinedStatus,
        items: cleanedItems,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      if (isAlreadyReceived) {
        toast.success("Order payment details updated")
      } else {
        toast.success("Order received and inventory updated")
      }
      onClose(false)
    },
    onError: () => {
      toast.error("Failed to update received order")
    },
  })

  const onSubmit = (values: OrderConfirmFormValues) => {
    saveMutation.mutate({
      ...values,
      paidAmount: totalPaidSoFar + toNumber(values.paidAmount),
      items: values.items.map((item) => ({
        ...item,
        expiry: normalizeExpiryForStorage(item.expiry),
      })),
    })
  }

  const paidAmountValue = toNumber(paidAmount)
  const outstandingAmount = Math.max(
    0,
    totals.netPayable - totalPaidSoFar - paidAmountValue
  )
  const lastPayment = paymentHistory[0]

  const originalPoUrl =
    order?.originalPoUrl || order?.poUrl || order?.documentUrl

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={isAlreadyReceived ? "Update Payment Details" : "Receive Order"}
      description={
        isAlreadyReceived
          ? "Update payment details and outstanding balance for this order."
          : "Confirm the received stock, batches, expiry, and rates before updating inventory."
      }
      size="extrafull"
      height="extrafull"
      scrollable={false}
      footer={null}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1860px] space-y-4"
      >
        <div className="flex flex-col gap-3 rounded-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="size-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {order?.supplier?.name ||
                    order?.supplier?.companyName ||
                    "Supplier not selected"}
                </span>
              </span>
              <span className="hidden text-muted-foreground/40 sm:inline">
                |
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-muted-foreground" />
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "No order date"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-border/60 bg-background px-4 text-xs font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-muted/30"
              disabled={!originalPoUrl}
              onClick={() => {
                if (originalPoUrl) {
                  window.open(originalPoUrl, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <FileText className="mr-1.5 size-4" />
              Original PO
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/95"
              disabled={saveMutation.isPending}
            >
              <CircleDollarSign className="mr-1.5 size-4" />
              {saveMutation.isPending
                ? "Saving..."
                : isAlreadyReceived
                  ? "Save & Update Payment"
                  : "Save & Update Inventory"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total Products
                </p>
                <p className="mt-0.5 text-2xl font-black text-foreground">
                  {totals.totalProducts} Items
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-violet-500/5 p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-sm hover:shadow-violet-500/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <Package className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total Units Received
                </p>
                <p className="mt-0.5 text-2xl font-black text-foreground">
                  {totals.totalUnitsReceived}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-emerald-500/5 p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-sm hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CircleDollarSign className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Subtotal Excl. Tax
                </p>
                <p className="mt-0.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{formatMoney(totals.subtotalExclTax)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/5 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Received Items List
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Review quantities, batches, expiry, and pricing before saving.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-lg border-border/50 bg-background px-3 text-xs font-bold text-foreground transition-all duration-200 hover:bg-muted/40"
              onClick={() => append(buildBlankRow())}
            >
              <Plus className="mr-1 size-3" />
              Add Item
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="w-max min-w-full">
              <div
                className="grid gap-3 border-b border-border/40 bg-muted/10 px-6 py-2.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                style={{
                  gridTemplateColumns:
                    "180px 140px 140px 90px 75px 80px 80px 80px 70px 70px 70px 60px 60px 110px 50px",
                }}
              >
                <div>Product Details</div>
                <div className="text-center">Ord Qty</div>
                <div className="text-center">Free</div>
                <div>Batch No.</div>
                <div>Expiry</div>
                <div className="text-right">Rate</div>
                <div className="text-right">Purchase</div>
                <div className="text-right">MRP/Sell</div>
                <div className="text-right">Rate 1</div>
                <div className="text-right">Rate 2</div>
                <div className="text-right">Rate 3</div>
                <div className="text-right">CGST</div>
                <div className="text-right">SGST</div>
                <div className="text-center">discount</div>
                <div className="text-right">Action</div>
              </div>

              <div className="max-h-[220px] min-h-[90px] divide-y divide-border/40 overflow-y-auto bg-card/50">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-muted/10"
                    style={{
                      gridTemplateColumns:
                        "180px 140px 140px 90px 75px 80px 80px 80px 70px 70px 70px 60px 60px 110px 40px",
                    }}
                  >
                    <div>
                      <Input
                        {...register(`items.${index}.name`)}
                        placeholder="Product name"
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <div className="flex w-full items-center overflow-hidden rounded-lg border border-border/60 bg-background transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 hover:border-primary/30">
                        <Input
                          type="text"
                          min={0}
                          step="1"
                          {...register(`items.${index}.qty`, {
                            valueAsNumber: true,
                            onChange: () => handleRowCalculation(index),
                          })}
                          className="h-9 w-[75px] shrink-0 border-0 bg-transparent px-1 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
                        />
                        <div className="h-5 w-px shrink-0 bg-border/60" />
                        <select
                          {...register(`items.${index}.unit`)}
                          className="w-[60px] shrink-0 bg-transparent py-1.5 pr-3 pl-1.5 text-xs font-semibold text-foreground outline-none"
                        >
                          {PACKAGING_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="flex w-full items-center overflow-hidden rounded-lg border border-border/60 bg-background transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 hover:border-primary/30">
                        <Input
                          type="text"
                          {...register(`items.${index}.freeQtyInput`, {
                            onChange: () => handleRowCalculation(index),
                          })}
                          className="h-9 w-[75px] shrink-0 border-0 bg-transparent px-1 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
                        />
                        <div className="h-5 w-px shrink-0 bg-border/60" />
                        <select
                          {...register(`items.${index}.freeUnit`)}
                          className="w-[60px] shrink-0 bg-transparent py-1.5 pr-3 pl-1.5 text-xs font-semibold text-foreground outline-none"
                        >
                          {PACKAGING_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Input
                        {...register(`items.${index}.batchNo`)}
                        placeholder="Batch"
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-xs text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Controller
                        control={control}
                        name={`items.${index}.expiry`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={5}
                            placeholder="MM/YY"
                            onChange={(event) => {
                              field.onChange(
                                formatExpiryTyping(event.target.value)
                              )
                            }}
                            onBlur={(event) => {
                              field.onBlur()
                              field.onChange(
                                normalizeExpiryForStorage(event.target.value)
                              )
                            }}
                            className="h-9 rounded-lg border-border/60 bg-background px-3 text-xs text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.unitRate`, {
                          valueAsNumber: true,
                          onChange: () => handleRowCalculation(index),
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.unitRate`, {
                          valueAsNumber: true,
                          onChange: () => handleRowCalculation(index),
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.purchaseRate`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.mrp`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate1`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate2`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        min={0}
                        step="0.01"
                        {...register(`items.${index}.rate3`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        {...register(`items.${index}.cgst`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        {...register(`items.${index}.sgst`, {
                          valueAsNumber: true,
                        })}
                        className="h-9 rounded-lg border-border/60 bg-background px-3 text-right text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      />
                    </div>
                    <div>
                      <div className="flex w-full items-center overflow-hidden rounded-lg border border-border/60 bg-background transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 hover:border-primary/30">
                        <Input
                          type="text"
                          min={0}
                          step="1"
                          {...register(`items.${index}.discount`, {
                            valueAsNumber: true,
                          })}
                          className="h-9 w-[50px] shrink-0 border-0 bg-transparent px-1 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
                        />
                        <div className="h-5 w-px shrink-0 bg-border/60" />
                        <select
                          {...register(`items.${index}.discount_type`)}
                          className="w-[55px] shrink-0 bg-transparent py-1.5 pr-3 pl-1.5 text-xs font-semibold text-foreground outline-none"
                        >
                          {DISCOUNT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-9 w-9 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
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
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/10 p-4.5 shadow-xs">
            <h4 className="text-sm font-bold text-foreground">
              Receiving Notes
            </h4>
            <div className="mt-3.5 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Received Date
                </label>
                <Input
                  type="date"
                  {...register("receivedAt")}
                  className="h-10 rounded-lg border-border/50 text-xs transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Invoice No.
                </label>
                <Input
                  {...register("invoiceNo")}
                  placeholder="Invoice / GRN number"
                  className="h-10 rounded-lg border-border/50 text-xs transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                />
              </div>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Notes
              </label>
              <Input
                {...register("notes")}
                placeholder="Short note for receiving..."
                className="h-10 rounded-lg border-border/50 text-xs transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/10 p-4.5 text-card-foreground shadow-xs">
            <h4 className="text-sm font-bold">Payment & Totals</h4>
            <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2 transition-colors duration-200 hover:bg-muted/50">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Subtotal Excl. Tax
                </p>
                <p className="mt-0.5 text-base font-black">
                  ₹{formatMoney(totals.subtotalExclTax)}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2 transition-colors duration-200 hover:bg-muted/50">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total Tax
                </p>
                <p className="mt-0.5 text-base font-black">
                  ₹{formatMoney(totals.totalTax)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 transition-colors duration-200 hover:bg-emerald-500/10">
                <p className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  Total Discount
                </p>
                <p className="mt-0.5 text-base font-black text-emerald-600 dark:text-emerald-400">
                  -₹{formatMoney(totals.totalDiscountAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-primary transition-colors duration-200 hover:bg-primary/15">
                <p className="text-[10px] font-bold tracking-wider text-primary/70 uppercase">
                  Net Payable
                </p>
                <p className="mt-0.5 text-base font-black">
                  ₹{formatMoney(totals.netPayable)}
                </p>
              </div>
            </div>

            <div className="mt-3.5 space-y-3.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 transition-all duration-200 hover:border-primary/25">
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Paid So Far
                  </p>
                  <p className="mt-0.5 text-base font-black text-foreground">
                    ₹{formatMoney(totalPaidSoFar)}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-amber-700 transition-all duration-200 hover:border-amber-500/40 dark:text-amber-400">
                  <p className="text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-500">
                    Outstanding
                  </p>
                  <p className="mt-0.5 text-base font-black">
                    ₹{formatMoney(outstandingAmount)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 transition-all duration-200 hover:border-primary/25">
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Last Payment
                  </p>
                  <p className="mt-0.5 text-base font-black text-foreground">
                    {lastPayment ? `₹${formatMoney(lastPayment.amount)}` : "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Payment Mode
                  </label>
                  <select
                    {...register("paymentMode")}
                    className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition-all duration-200 outline-none hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  >
                    {PAYMENT_MODE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Payment Details
                  </label>
                  <Input
                    {...register("paymentDetails")}
                    placeholder="Reference notes"
                    className="h-10 rounded-lg border-border/50 text-xs transition-all duration-200 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Is Udhar?
                  </label>
                  <select
                    {...register("isUdhar")}
                    className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition-all duration-200 outline-none hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Paid Amount
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...register("paidAmount", { valueAsNumber: true })}
                    placeholder="0.00"
                    readOnly={isUdhar === "NO"}
                    className={`h-10 rounded-lg border-border/60 text-xs transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 ${isUdhar === "NO" ? "cursor-not-allowed bg-muted/40 opacity-80" : ""}`}
                  />
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    {isUdhar === "NO"
                      ? "Auto-filled to clear the remaining balance."
                      : "Enter the additional amount paid now for this order."}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Payment History
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {paymentHistory.length
                        ? `${paymentHistory.length} payment${paymentHistory.length === 1 ? "" : "s"} recorded`
                        : "No payment history yet."}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <Clock3 className="size-3" />
                    {paymentHistory.length ? "Latest at top" : "Empty"}
                  </div>
                </div>

                <div className="mt-3 max-h-36 space-y-2.5 overflow-auto pr-1">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((entry) => (
                      <div
                        key={entry.id || `${entry.amount}-${entry.paidAt}`}
                        className="rounded-xl border border-border/40 bg-card px-3.5 py-2.5 transition-all duration-200 hover:border-primary/20 hover:shadow-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-foreground">
                                ₹{formatMoney(entry.amount)}
                              </span>
                              {entry.paymentMode ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-primary uppercase">
                                  {entry.paymentMode}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDateTime(entry.paidAt || entry.createdAt)}
                            </p>
                          </div>
                          {entry.isUdhar ? (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                              Udhar
                            </span>
                          ) : null}
                        </div>
                        {(entry.paymentDetails || entry.notes) && (
                          <p className="mt-1.5 border-t border-border/20 pt-1.5 text-[10px] leading-4 text-muted-foreground">
                            {entry.paymentDetails || entry.notes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/50 px-4 py-6 text-center">
                      <p className="text-xs font-bold text-foreground">
                        No payments recorded yet
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Save the order once to start tracking payment history.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </FormContainer>
  )
}
