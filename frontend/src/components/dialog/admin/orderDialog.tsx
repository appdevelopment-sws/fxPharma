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
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              form="order-dialog-form"
              disabled={saveMutation.isPending || isSubmitting}
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
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight text-foreground">
                {isEditMode ? "Edit Order" : "New Purchase Order"}
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
                {status || "DRAFT"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                {selectedSupplier?.companyName || "Select a supplier"}
              </span>
              <span className="hidden text-muted-foreground/40 sm:inline">
                |
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                {totalItems} items
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Total Items
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                {totalItems}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Total Qty
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                {totalQty}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Supplier
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {selectedSupplier?.companyName || "Not selected"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Order Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a supplier and set the order status.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
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

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Order Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Search existing medicines and add them to the purchase list.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  <div className="relative">
                    {/* <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" /> */}
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search medicines to add..."
                      className="h-11 pl-11"
                      disabled={isViewMode}
                    />
                    {productSearch.length > 2 && (
                      <div className="absolute top-full right-0 left-0 z-20 mt-2 rounded-2xl border bg-card shadow-xl">
                        {isSearchingInventory ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            No medicines found.
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto p-2">
                            {searchResults.map((prod: any) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                  addItem(prod)
                                  setProductSearch("")
                                }}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-primary/5"
                              >
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {prod.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {prod.saltComposition ||
                                      prod.category?.name ||
                                      "Inventory item"}
                                  </p>
                                </div>
                                <Plus className="size-4 text-primary" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <div className="col-span-6">Medicine</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="mt-3 space-y-3">
                {fields.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                    No medicines added yet. Use search or suggested items to add
                    order lines.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const item = items[index]

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 items-center gap-4 rounded-2xl border p-4"
                      >
                        <div className="col-span-6">
                          <p className="font-bold text-foreground">
                            {item?.inventory?.name || item?.name || "Medicine"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item?.description ||
                              item?.inventory?.saltComposition ||
                              "No description"}
                          </p>
                        </div>

                        <div className="col-span-3 flex justify-center">
                          <div className="flex items-center gap-1 rounded-2xl border bg-background p-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQty(index, -1)}
                              className="h-8 w-8 rounded-xl"
                              disabled={isViewMode}
                            >
                              <Minus className="size-4" />
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
                              className="h-8 w-16 border-none text-center font-bold focus-visible:ring-0"
                              readOnly={isViewMode}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQty(index, 1)}
                              className="h-8 w-8 rounded-xl"
                              disabled={isViewMode}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <select
                            value={item?.unit || "strip"}
                            onChange={(e) => updateUnit(index, e.target.value)}
                            disabled={isViewMode}
                            className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-80"
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
                              className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-5" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-muted/30 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Suggested to Order</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick-add medicines that are currently low in stock.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {isLoadingInventory ? (
                  <p className="text-sm text-muted-foreground">
                    Loading suggestions...
                  </p>
                ) : suggestedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No suggestions available.
                  </p>
                ) : (
                  suggestedProducts.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border bg-card p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.manufacturer?.name || "Manufacturer"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => addItem(item)}
                        disabled={isViewMode}
                      >
                        <Plus className="size-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Supplier Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact details for the selected supplier.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Supplier Email</span>
                  <span className="text-right font-semibold">
                    {selectedSupplier?.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Supplier Phone</span>
                  <span className="text-right font-semibold">
                    {selectedSupplier?.phone || "N/A"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Supplier Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedSupplier?.isPreferred
                      ? "Preferred supplier"
                      : "Standard supplier"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-bold">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier Email</span>
                  <span className="font-bold">
                    {selectedSupplier?.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier Phone</span>
                  <span className="font-bold">
                    {selectedSupplier?.phone || "N/A"}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-dashed" />

              {/* <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Order Status
                </p>
                <p className="text-xl font-black tracking-tighter text-cyan-400 italic">
                  {status || "DRAFT"}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  type="button"
                  className="h-14 w-full rounded-2xl bg-emerald-500 text-base font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98]"
                  disabled={!selectedSupplier?.phone}
                >
                  <MessageCircle className="mr-3 size-6" />
                  Send Order via WhatsApp
                </Button>
                <Button
                  type="button"
                  className="h-14 w-full rounded-2xl bg-cyan-400 text-base font-bold shadow-lg shadow-cyan-400/20 hover:bg-cyan-500 active:scale-[0.98]"
                  disabled={!selectedSupplier?.email}
                >
                  <Mail className="mr-3 size-6" />
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
