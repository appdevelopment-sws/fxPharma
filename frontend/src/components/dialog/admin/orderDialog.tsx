import { useEffect, useMemo, useState, useRef } from "react"
import {
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/formContainer"
import { FormSelectField } from "@/components/ui/form-fields"

import {
  ORDER_FORM_INITIAL_DATA,
  ORDER_STATUS_OPTIONS,
  UNIT_OPTIONS,
} from "@/constants/page/admin/order"
import { queryKeys } from "@/lib/queryKeys"
import { ordersApi } from "@/services/ordersApi"
import InventoryApi from "@/services/inventoryApi"
import SupplierApi from "@/services/supplierApi"
import { PACKAGING_TYPE_OPTIONS } from "@/constants/page/admin/inventory"

interface OrderDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  order?: any | null
}

type OrderItemFormValue = {
  tempId: string
  inventoryId?: string
  name: string
  description: string
  qty: number
  unit: string
  purchaseRate?: number
  inventory?: any
}

type OrderFormValues = {
  supplierId: string
  status: string
  items: OrderItemFormValue[]
}

const createTempId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildItemFromInventory = (inventoryItem: any): OrderItemFormValue => ({
  tempId: createTempId(),
  inventoryId: inventoryItem.id,
  name: inventoryItem.name || "",
  description:
    inventoryItem.saltComposition || inventoryItem.category?.name || "",
  qty: 1,
  unit: "strip",
  purchaseRate: inventoryItem.purchaseRate ?? undefined,
  inventory: inventoryItem,
})

const buildItemFromOrderItem = (item: any): OrderItemFormValue => ({
  tempId: item.tempId || item.id || createTempId(),
  inventoryId: item.inventoryId || item.inventory?.id || "",
  name: item.inventory?.name || item.name || "",
  description: item.inventory?.saltComposition || item.description || "",
  qty: Math.max(1, toNumber(item.qty || 1)),
  unit: item.unit || "strip",
  purchaseRate:
    item.purchaseRate === undefined || item.purchaseRate === null
      ? undefined
      : Number(item.purchaseRate),
  inventory: item.inventory,
})

const buildFormValues = (order?: any): OrderFormValues => {
  const items =
    Array.isArray(order?.items) && order.items.length > 0
      ? order.items.map(buildItemFromOrderItem)
      : []

  return {
    ...ORDER_FORM_INITIAL_DATA,
    supplierId: order?.supplierId || order?.supplier?.id || "",
    status: order?.status || ORDER_FORM_INITIAL_DATA.status,
    items,
  }
}

export default function OrderDialog({
  open,
  onClose,
  order,
}: OrderDialogProps) {
  const isEditMode = !!order?.id
  const isViewMode = !!order?.viewMode

  const queryClient = useQueryClient()
  const [productSearch, setProductSearch] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<OrderFormValues>({
    defaultValues: buildFormValues(),
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const supplierId = useWatch({ control, name: "supplierId" })
  const items = useWatch({ control, name: "items" }) || []
  const status = useWatch({ control, name: "status" })

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => SupplierApi.getSuppliers(),
    enabled: open,
  })

  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: queryKeys.inventory.list({ limit: 15 }),
    queryFn: () => InventoryApi.getAll({ limit: 15 }),
    enabled: open,
  })

  const { data: searchResultsData, isLoading: isSearchingInventory } = useQuery(
    {
      queryKey: queryKeys.inventory.list({ search: productSearch, limit: 20 }),
      queryFn: () => InventoryApi.getAll({ search: productSearch, limit: 20 }),
      enabled: open && productSearch.trim().length > 0,
    }
  )

  const suppliers = suppliersData?.data || []
  const suggestedProducts = inventoryData?.data || []
  const searchResults = searchResultsData?.data || []

  const selectedSupplier = useMemo(
    () =>
      suppliers.find((supplier: any) => supplier.id === supplierId) ||
      (order?.supplier?.id === supplierId ? order.supplier : null) ||
      null,
    [order?.supplier, supplierId, suppliers]
  )

  useEffect(() => {
    if (!open) {
      setProductSearch("")
      setIsDropdownOpen(false)
      reset(buildFormValues())
      return
    }

    reset(buildFormValues(order))
    setProductSearch("")
    setIsDropdownOpen(false)
  }, [open, order, reset])

  const saveMutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      const payload = {
        ...data,
        supplierId: data.supplierId || selectedSupplier?.id,
        items: data.items,
      }

      return isEditMode
        ? ordersApi.update(order.id, payload)
        : ordersApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.success(isEditMode ? "Order updated" : "Order created")
      reset(buildFormValues())
      onClose(false)
    },
    onError: () => {
      toast.error("Failed to save order")
    },
  })

  const updateQty = (index: number, delta: number) => {
    const currentQty = toNumber(items?.[index]?.qty)
    setValue(`items.${index}.qty`, Math.max(1, currentQty + delta), {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const updateUnit = (index: number, unit: string) => {
    setValue(`items.${index}.unit`, unit, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const addItem = (inventoryItem: any) => {
    if (isViewMode) return

    const existingIndex = items.findIndex(
      (item: any) => item.inventoryId === inventoryItem.id
    )

    if (existingIndex >= 0) {
      updateQty(existingIndex, 1)
      return
    }

    append(buildItemFromInventory(inventoryItem))
  }

  const removeItem = (index: number) => {
    if (isViewMode) return
    remove(index)
  }

  const totalItems = items.length
  const totalQty = items.reduce(
    (sum: number, item: any) => sum + Math.max(1, toNumber(item.qty)),
    0
  )

  const onSubmit: SubmitHandler<OrderFormValues> = (data) => {
    saveMutation.mutate(data)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={isEditMode ? "Edit Order" : "Create New Order"}
      description="Create a supplier order, add medicines, and keep the purchase list ready for confirmation."
      size="xl"
      height="full"
      scrollable={false}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            className="h-9 rounded-lg border-border/60 text-xs font-semibold hover:bg-muted/30 transition-all duration-200"
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="order-dialog-form"
              disabled={saveMutation.isPending || isSubmitting}
              className="h-9 rounded-lg px-5 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground transition-all duration-200 shadow-xs"
            >
              {saveMutation.isPending || isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Order"
                  : "Save Order"}
            </Button>
          )}
        </div>
      }
    >
      <form
        id="order-dialog-form"
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-[1800px] space-y-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/20 pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                <Truck className="size-3.5" />
                {selectedSupplier?.companyName || "Supplier not selected"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 font-semibold text-muted-foreground">
                <Clock className="size-3.5" />
                Status: {status || "DRAFT"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-3 shadow-xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Items
                </p>
                <p className="text-base font-extrabold text-foreground truncate mt-0.5">
                  {totalItems} Lines
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-violet-500/5 p-3 shadow-xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                <Plus className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Quantity
                </p>
                <p className="text-base font-extrabold text-foreground truncate mt-0.5">
                  {totalQty} Units
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/5 p-3 shadow-xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Truck className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Supplier
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5 truncate max-w-[240px]">
                  {selectedSupplier?.companyName || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {/* Order Items Table Card */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 bg-muted/5 p-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Order Items</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Search existing medicines and add them to the purchase list.
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <div ref={dropdownRef} className="relative w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Medicine
                    </span>
                    <button
                      type="button"
                      disabled={isViewMode}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 text-xs font-semibold text-foreground hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-muted-foreground">Search...</span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {isDropdownOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-border/60 bg-card shadow-lg flex flex-col overflow-hidden backdrop-blur-md bg-card/95">
                        <div className="p-2 border-b border-border/40 bg-muted/5">
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder=""
                            autoFocus
                            className="h-8 w-full rounded-lg border border-border/60 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                          />
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                          <div className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground">
                            Search...
                          </div>

                          {isSearchingInventory || isLoadingInventory ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              Searching...
                            </div>
                          ) : (
                            (() => {
                              const listToDisplay =
                                productSearch.trim().length > 0
                                  ? searchResults
                                  : suggestedProducts
                              if (listToDisplay.length === 0) {
                                return (
                                  <div className="p-3 text-xs text-muted-foreground text-center">
                                    No medicines found.
                                  </div>
                                )
                              }
                              return listToDisplay.map((prod: any) => (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => {
                                    addItem(prod)
                                    setProductSearch("")
                                    setIsDropdownOpen(false)
                                  }}
                                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                                >
                                  <div className="truncate pr-2">
                                    <span>{prod.name}</span>
                                    <span className="text-muted-foreground font-normal ml-1.5">
                                      (Stk: {prod.availableStock ?? 0})
                                    </span>
                                  </div>
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150">
                                    <Plus className="size-3" />
                                  </div>
                                </button>
                              ))
                            })()
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted/15 border-b border-border/40">
                <div className="col-span-6">Medicine</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="divide-y divide-border/40 max-h-[30vh] overflow-y-auto pr-1">
                {fields.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-muted/5">
                    No medicines added yet. Use search or suggestions to compile order.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const item = items[index]

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 items-center gap-3 px-4 py-2.5 hover:bg-muted/10 transition-colors duration-150"
                      >
                        <div className="col-span-6">
                          <p className="text-xs font-bold text-foreground">
                            {item?.inventory?.name || item?.name || "Medicine"}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {item?.description ||
                              item?.inventory?.saltComposition ||
                              "No description"}
                          </p>
                        </div>

                        <div className="col-span-3 flex justify-center">
                          <div className="flex items-center overflow-hidden rounded-lg border border-border/60 bg-background hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
                            <button
                              type="button"
                              onClick={() => updateQty(index, -1)}
                              className="flex h-8 w-8 items-center justify-center bg-muted/20 hover:bg-muted/50 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-border/60"
                              disabled={isViewMode}
                            >
                              <Minus className="size-3" />
                            </button>
                            <input
                              type="number"
                              value={item?.qty ?? 1}
                              onChange={(e) =>
                                setValue(
                                  `items.${index}.qty`,
                                  Math.max(1, toNumber(e.target.value) || 1),
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                  }
                                )
                              }
                              className="h-8 w-12 border-0 bg-transparent text-center text-xs font-semibold focus:outline-none focus:ring-0 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              readOnly={isViewMode}
                            />
                            <button
                              type="button"
                              onClick={() => updateQty(index, 1)}
                              className="flex h-8 w-8 items-center justify-center bg-muted/20 hover:bg-muted/50 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-border/60"
                              disabled={isViewMode}
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <select
                            value={item?.unit || "strip"}
                            onChange={(e) => updateUnit(index, e.target.value)}
                            disabled={isViewMode}
                            className="h-8 w-full rounded-lg border border-border/60 bg-background px-2 text-xs font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-80 transition-all duration-200"
                          >
                            {PACKAGING_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          {!isViewMode ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Suggested to Order Card */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs">
              <div className="flex items-center gap-3 border-b border-border/40 bg-muted/5 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Suggested to Order</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Quick-add medicines that are currently low in stock.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/5">
                <div className="grid gap-2 sm:grid-cols-2 max-h-[160px] overflow-y-auto pr-1">
                  {isLoadingInventory ? (
                    <p className="col-span-2 p-4 text-center text-xs text-muted-foreground">
                      Loading suggestions...
                    </p>
                  ) : suggestedProducts.length === 0 ? (
                    <p className="col-span-2 p-4 text-center text-xs text-muted-foreground">
                      No suggestions available.
                    </p>
                  ) : (
                    suggestedProducts.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-2.5 hover:border-primary/20 hover:bg-muted/10 transition-all duration-150"
                      >
                        <div className="space-y-0.5 truncate mr-2">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {item.manufacturer?.name || "Manufacturer"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shrink-0"
                          onClick={() => addItem(item)}
                          disabled={isViewMode}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Supplier Selection and contact summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs">
              <div className="flex items-center gap-3 border-b border-border/40 bg-muted/5 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Truck className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Supplier Details</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select a supplier and review contact details.
                  </p>
                </div>
              </div>

              <div className="p-4.5 space-y-4">
                <FormSelectField
                  control={control}
                  name="supplierId"
                  label="SUPPLIER"
                  options={suppliers.map((supplier: any) => ({
                    label: supplier.companyName,
                    value: supplier.id,
                  }))}
                  placeholder={
                    isLoadingSuppliers
                      ? "Loading suppliers..."
                      : "Select supplier"
                  }
                  required
                  readOnly={isViewMode}
                />

                <div className="border-t border-border/20 pt-4">
                  {selectedSupplier ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground font-medium">Company Name</span>
                        <span className="text-right font-semibold text-foreground">
                          {selectedSupplier.companyName || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground font-medium">Supplier Email</span>
                        <span className="text-right font-semibold text-foreground select-all">
                          {selectedSupplier.email || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground font-medium">Supplier Phone</span>
                        <span className="text-right font-semibold text-foreground select-all">
                          {selectedSupplier.phone || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground font-medium">Preferred Status</span>
                        <span className="text-right font-semibold text-foreground">
                          {selectedSupplier.isPreferred
                            ? "Preferred supplier"
                            : "Standard supplier"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-border/20 pt-2.5">
                        <span className="text-muted-foreground font-medium">Total Unique Items</span>
                        <span className="text-right font-bold text-foreground">
                          {totalItems}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/60 p-5 text-center bg-muted/5">
                      <p className="text-xs text-muted-foreground">
                        Select a supplier above to view contact details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
