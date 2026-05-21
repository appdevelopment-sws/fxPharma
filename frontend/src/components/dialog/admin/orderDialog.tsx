import { useEffect, useMemo, useState } from "react"
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
    queryKey: queryKeys.inventory.list({ limit: 4 }),
    queryFn: () => InventoryApi.getAll({ limit: 4 }),
    enabled: open,
  })

  const { data: searchResultsData, isLoading: isSearchingInventory } = useQuery(
    {
      queryKey: queryKeys.inventory.list({ search: productSearch, limit: 5 }),
      queryFn: () => InventoryApi.getAll({ search: productSearch, limit: 5 }),
      enabled: open && productSearch.length > 2,
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
      reset(buildFormValues())
      return
    }

    reset(buildFormValues(order))
    setProductSearch("")
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
      size="extrafull"
      height="extrafull"
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
        className="max-w-[1860px] space-y-4"
      >
        <div className="flex flex-col gap-3 rounded-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="size-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {selectedSupplier?.companyName || "Supplier not selected"}
                </span>
              </span>
              <span className="hidden text-muted-foreground/40 sm:inline">
                |
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  Status: {status || "DRAFT"}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Items
                </p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {totalItems} Items
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-violet-500/5 p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-sm hover:shadow-violet-500/5 hover:border-violet-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <Plus className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Qty
                </p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {totalQty}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-emerald-500/5 p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-sm hover:shadow-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Truck className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Supplier
                </p>
                <p className="text-sm font-bold text-foreground mt-1 truncate max-w-[200px]">
                  {selectedSupplier?.companyName || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <div className="rounded-xl border border-border/50 bg-card p-4.5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Order Details</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Choose a supplier and set the order status.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                {/* <FormSelectField
                  control={control}
                  name="status"
                  label="STATUS"
                  options={ORDER_STATUS_OPTIONS}
                  readOnly={isViewMode}
                /> */}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-4.5 shadow-xs">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Order Items</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Search existing medicines and add them to the purchase list.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search medicines to add..."
                      className="h-9 pl-9 text-xs rounded-lg border-border/60 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200"
                      disabled={isViewMode}
                    />
                    {productSearch.length > 2 && (
                      <div className="absolute top-full right-0 left-0 z-20 mt-1.5 rounded-xl border border-border/60 bg-card shadow-lg max-h-60 overflow-y-auto">
                        {isSearchingInventory ? (
                          <div className="p-3 text-xs text-muted-foreground">
                            Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground">
                            No medicines found.
                          </div>
                        ) : (
                          <div className="p-1">
                            {searchResults.map((prod: any) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                  addItem(prod)
                                  setProductSearch("")
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary/5"
                              >
                                <div>
                                  <p className="text-xs font-semibold text-foreground">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {prod.saltComposition ||
                                      prod.category?.name ||
                                      "Inventory item"}
                                  </p>
                                </div>
                                <Plus className="size-3.5 text-primary" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted/10 rounded-lg">
                <div className="col-span-6">Medicine</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="mt-2 space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                {fields.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground bg-muted/5">
                    No medicines added yet. Use search or suggested items to add
                    order lines.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const item = items[index]

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 items-center gap-3 rounded-xl border border-border/60 bg-muted/5 p-3 hover:bg-muted/10 hover:border-primary/20 transition-all duration-200"
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
                          <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5 hover:border-primary/30 transition-all duration-200">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQty(index, -1)}
                              className="h-7 w-7 rounded-md"
                              disabled={isViewMode}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <Input
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
                              className="h-7 w-12 border-none bg-transparent p-0 text-center text-xs font-bold focus-visible:ring-0"
                              readOnly={isViewMode}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQty(index, 1)}
                              className="h-7 w-7 rounded-md"
                              disabled={isViewMode}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <select
                            value={item?.unit || "strip"}
                            onChange={(e) => updateUnit(index, e.target.value)}
                            disabled={isViewMode}
                            className="h-8 w-full rounded-lg border border-border/60 bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-80 transition-all duration-200"
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
                              size="icon-sm"
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

            <div className="rounded-xl border border-border/50 bg-muted/5 p-4.5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Suggested to Order</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Quick-add medicines that are currently low in stock.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                {isLoadingInventory ? (
                  <p className="text-xs text-muted-foreground">
                    Loading suggestions...
                  </p>
                ) : suggestedProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No suggestions available.
                  </p>
                ) : (
                  suggestedProducts.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3 hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.manufacturer?.name || "Manufacturer"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-all duration-200"
                        onClick={() => addItem(item)}
                        disabled={isViewMode}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4.5 shadow-xs space-y-4 bg-gradient-to-br from-card to-muted/5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Truck className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Supplier Summary</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Selected supplier contact details and status.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-4 py-1.5 border-b border-border/20">
                  <span className="text-muted-foreground font-medium">Company Name</span>
                  <span className="text-right font-bold text-foreground">
                    {selectedSupplier?.companyName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-1.5 border-b border-border/20">
                  <span className="text-muted-foreground font-medium">Supplier Email</span>
                  <span className="text-right font-bold text-foreground">
                    {selectedSupplier?.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-1.5 border-b border-border/20">
                  <span className="text-muted-foreground font-medium">Supplier Phone</span>
                  <span className="text-right font-bold text-foreground">
                    {selectedSupplier?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-1.5 border-b border-border/20">
                  <span className="text-muted-foreground font-medium">Preferred Status</span>
                  <span className="text-right font-bold text-foreground">
                    {selectedSupplier?.isPreferred
                      ? "Preferred supplier"
                      : "Standard supplier"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-1.5">
                  <span className="text-muted-foreground font-medium">Total Unique Items</span>
                  <span className="text-right font-bold text-foreground">
                    {totalItems}
                  </span>
                </div>
              </div>

              {/* <div className="my-4 border-t border-dashed" />

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Order Status
                </p>
                <p className="text-lg font-black tracking-tighter text-cyan-400 italic">
                  {status || "DRAFT"}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl bg-emerald-500 text-xs font-bold shadow-xs hover:bg-emerald-600 transition-all duration-200"
                  disabled={!selectedSupplier?.phone}
                >
                  <MessageCircle className="mr-2 size-4" />
                  Send Order via WhatsApp
                </Button>
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl bg-cyan-400 text-xs font-bold shadow-xs hover:bg-cyan-500 transition-all duration-200"
                  disabled={!selectedSupplier?.email}
                >
                  <Mail className="mr-2 size-4" />
                  Send Order via Email
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}
