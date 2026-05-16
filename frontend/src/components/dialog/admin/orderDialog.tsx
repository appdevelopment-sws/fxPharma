import { useState, useEffect } from "react"
import {
    Search,
    Plus,
    Minus,
    Trash2,
    Truck,
    History,
    MessageCircle,
    Mail,
    CheckCircle2,
    Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    FormSelectField,
} from "@/components/ui/form-fields"
import { useForm } from "react-hook-form"

import {
    UNIT_OPTIONS,
    SUPPLIER_ACCOUNT_SUMMARY,
} from "@/constants/page/admin/order"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ordersApi } from "@/services/ordersApi"
import SupplierApi from "@/services/supplierApi"
import InventoryApi from "@/services/inventoryApi"
import { queryKeys } from "@/lib/queryKeys"

interface OrderDialogProps {
    open: boolean
    onClose: (open: boolean) => void
    order?: any | null
}

export default function OrderDialog({
    open,
    onClose,
    order,
}: OrderDialogProps) {
    const isEditMode = !!order?.id
    const isViewMode = !!order?.viewMode
    const queryClient = useQueryClient()

    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

    const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
        queryKey: queryKeys.suppliers.all,
        queryFn: () => SupplierApi.getSuppliers(),
    })

    const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
        queryKey: queryKeys.inventory.list({ limit: 4 }),
        queryFn: () => InventoryApi.getAll({ limit: 4 }),
    })

    const suppliers = suppliersData?.data || []
    const suggestedProducts = inventoryData?.data || []
    const [productSearch, setProductSearch] = useState("")

    const { data: searchResultsData, isLoading: isSearchingInventory } = useQuery({
        queryKey: queryKeys.inventory.list({ search: productSearch, limit: 5 }),
        queryFn: () => InventoryApi.getAll({ search: productSearch, limit: 5 }),
        enabled: productSearch.length > 2,
    })

    const searchResults = searchResultsData?.data || []

    const { data: recentOrdersData, isLoading: isLoadingRecentOrders } = useQuery({
        queryKey: ["orders", "recent", selectedSupplier?.id],
        queryFn: () => ordersApi.getAll({ search: selectedSupplier?.companyName, limit: 5 }),
        enabled: !!selectedSupplier?.id,
    })

    const recentOrders = recentOrdersData?.data || []

    const { control, reset, handleSubmit, setValue } = useForm({
        defaultValues: {
            supplierId: "",
            status: "DRAFT",
        }
    })

    const getItemKey = (item: any) => item?.inventoryId || item?.id || item?.tempId

    const normalizeItem = (inventoryItem: any) => ({
        inventoryId: inventoryItem.id,
        name: inventoryItem.name,
        description: inventoryItem.saltComposition || inventoryItem.category?.name || "",
        qty: 1,
        unit: "strips",
        purchaseRate: inventoryItem.purchaseRate ?? undefined,
        inventory: inventoryItem,
    })

    useEffect(() => {
        if (open) {
            if (order) {
                setSelectedItems(order.items || [])
                setSelectedSupplier(order.supplier || null)
                reset({
                    supplierId: order.supplierId,
                    status: order.status,
                })
            } else {
                setSelectedItems([])
                setSelectedSupplier(null)
                reset({
                    supplierId: "",
                    status: "DRAFT",
                })
            }
        }
    }, [open, order, reset])

    const saveMutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                ...data,
                supplierId: selectedSupplier?.id,
                items: selectedItems,
            }
            return isEditMode ? ordersApi.update(order.id, payload) : ordersApi.create(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
            toast.success(isEditMode ? "Order updated" : "Order created")
            onClose(false)
        },
        onError: () => {
            toast.error("Failed to save order")
        }
    })

    const onSubmit = (data: any) => {
        saveMutation.mutate(data)
    }

    const updateQty = (id: any, delta: number) => {
        setSelectedItems(prev => prev.map(item =>
            getItemKey(item) === id
                ? { ...item, qty: Math.max(1, (Number(item.qty) || 0) + delta) }
                : item
        ))
    }

    const removeItem = (id: any) => {
        setSelectedItems(prev => prev.filter(item => getItemKey(item) !== id))
    }

    const addItem = (inventoryItem: any) => {
        const itemKey = inventoryItem.id
        setSelectedItems(prev => {
            const existingIndex = prev.findIndex((item) => getItemKey(item) === itemKey)

            if (existingIndex >= 0) {
                return prev.map((item, index) =>
                    index === existingIndex
                        ? { ...item, qty: Math.max(1, (Number(item.qty) || 0) + 1) }
                        : item
                )
            }

            return [...prev, normalizeItem(inventoryItem)]
        })
    }

    return (
        <FormContainer
            variant="modal"
            open={open}
            onOpenChange={(isOpen) => onClose(isOpen)}
            title={isEditMode ? "Edit Order" : "Create New Order"}
            size="full"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onClose(false)}>
                        {isViewMode ? "Close" : "Cancel"}
                    </Button>
                    {!isViewMode && (
                        <Button 
                            onClick={handleSubmit(onSubmit)}
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? "Saving..." : isEditMode ? "Update Order" : "Save Order"}
                        </Button>
                    )}
                </div>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="grid h-full grid-cols-1 gap-8 p-1 xl:grid-cols-3">
                {/* Left Column: Order Items & Suggestions */}
                <div className="space-y-8 xl:col-span-2">
                    {/* Order Items Section */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Plus className="size-5" />
                                </div>
                                <h2 className="text-xl font-bold">Order Items</h2>
                            </div>

                        </div>

                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-12 pl-12 pr-4 text-base focus-visible:ring-primary/20"
                                placeholder="Search existing medicines to add..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                            {productSearch.length > 2 && (
                                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border bg-card shadow-lg">
                                    {isSearchingInventory ? (
                                        <div className="p-4 text-sm text-muted-foreground">Searching...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="p-4 text-sm text-muted-foreground">No medicines found.</div>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto p-2">
                                            {searchResults.map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-primary/5"
                                                    onClick={() => {
                                                        addItem(prod)
                                                        setProductSearch("")
                                                    }}
                                                >
                                                    <div>
                                                        <p className="font-bold">{prod.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {prod.saltComposition || prod.category?.name || "Inventory item"}
                                                        </p>
                                                    </div>
                                                    <Plus className="size-4 text-primary" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-12 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <div className="col-span-6">Medicine</div>
                                <div className="col-span-3 text-center">Quantity</div>
                                <div className="col-span-2 text-center">Unit</div>
                                <div className="col-span-1 text-right"></div>
                            </div>

                            <div className="space-y-3">
                                {selectedItems.map((item) => (
                                    <div key={getItemKey(item)} className="grid grid-cols-12 items-center rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
                                        <div className="col-span-6">
                                            <p className="text-lg font-bold">{item.inventory?.name || item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.description || item.inventory?.saltComposition || ""}</p>
                                        </div>

                                        <div className="col-span-3 flex justify-center">
                                            <div className="flex items-center gap-1 rounded-xl border bg-background p-1 shadow-sm">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => updateQty(getItemKey(item), -1)}
                                                    className="h-8 w-8 rounded-lg hover:bg-muted"
                                                >
                                                    <Minus className="size-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) => updateQty(getItemKey(item), parseInt(e.target.value) - item.qty)}
                                                    className="h-8 w-16 border-none text-center font-bold focus-visible:ring-0"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => updateQty(getItemKey(item), 1)}
                                                    className="h-8 w-8 rounded-lg hover:bg-muted"
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            <select
                                                className="h-10 rounded-xl border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={item.unit}
                                                onChange={(e) => { }}
                                            >
                                                {UNIT_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeItem(getItemKey(item))}
                                                className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="size-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Suggested Section */}
                    <div className="rounded-2xl border bg-muted/30 p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <h2 className="text-xl font-bold">Suggested to Order</h2>
                        </div>

                        <div className="space-y-3">
                                {isLoadingInventory ? (
                                    <p className="text-sm text-muted-foreground">Loading suggestions...</p>
                                ) : suggestedProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No suggestions available.</p>
                                ) : suggestedProducts.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-purple-300">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-1">
                                            <p className="font-bold">{item.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-5 rounded-md px-2 text-[10px] font-bold uppercase tracking-wider">
                                                    Stock Low
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">{item.manufacturer?.name || "Manufacturer"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="outline"
                                        className="h-10 w-10 rounded-xl border-purple-200 text-purple-500 hover:bg-purple-500 hover:text-white"
                                        onClick={() => addItem(item)}
                                    >
                                        <Plus className="size-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Supplier & Status */}
                <div className="space-y-6">
                    {/* Supplier Section */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                                    <Truck className="size-5" />
                                </div>
                                <h2 className="text-xl font-bold">Supplier</h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isLoadingSuppliers ? (
                                <p className="text-sm text-muted-foreground">Loading suppliers...</p>
                            ) : suppliers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No suppliers found.</p>
                            ) : suppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    onClick={() => {
                                        setSelectedSupplier(supplier)
                                        setValue("supplierId", supplier.id)
                                    }}
                                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedSupplier?.id === supplier.id
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                        : "border-border hover:border-primary/30"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold">{supplier.companyName}</p>
                                                {supplier.isPreferred && (
                                                    <Badge variant="outline" className="h-5 rounded-md border-primary/30 bg-primary/10 px-2 text-[9px] font-bold uppercase tracking-wider text-primary">
                                                        Preferred
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="size-3" />
                                                <span>Delivers in {supplier.isPreferred ? "24h" : "48h"}</span>
                                            </div>
                                        </div>
                                        {selectedSupplier?.id === supplier.id && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                                                <CheckCircle2 className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Status Section */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3 text-muted-foreground">
                            <Clock className="size-5" />
                            <h3 className="font-bold">{selectedSupplier?.companyName || "Supplier"} - Account Status</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Total Paid</p>
                                    <p className="text-lg font-bold text-emerald-500">${SUPPLIER_ACCOUNT_SUMMARY.paid.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-muted-foreground">Remaining</p>
                                    <p className="text-lg font-bold text-destructive">${SUPPLIER_ACCOUNT_SUMMARY.remaining.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Custom Progress Bar */}
                            <div className="h-2 w-full overflow-hidden rounded-full bg-destructive/10">
                                <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${(SUPPLIER_ACCOUNT_SUMMARY.paid / SUPPLIER_ACCOUNT_SUMMARY.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-right text-xs font-bold text-muted-foreground">Total Billed: ${SUPPLIER_ACCOUNT_SUMMARY.total.toLocaleString()}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Orders</p>
                            <div className="space-y-2">
                                {isLoadingRecentOrders ? (
                                    <p className="text-xs text-muted-foreground">Loading recent orders...</p>
                                ) : recentOrders.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No recent orders.</p>
                                ) : recentOrders.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
                                        <span className="font-medium text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="font-bold">Items: {order.items?.length || 0}</span>
                                        <Badge variant="outline" className="h-5 rounded-md border-emerald-200 bg-emerald-50 px-2 text-[9px] font-bold uppercase text-emerald-600">
                                            {order.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="rounded-2xl bg-card p-6">
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Items</span>
                                <span className="font-bold">{selectedItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Supplier Email</span>
                                <span className="font-bold">{selectedSupplier?.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Supplier Phone</span>
                                <span className="font-bold">{selectedSupplier?.phone || "N/A"}</span>
                            </div>
                        </div>

                        <div className="my-6 border-t border-dashed" />

                        <div className="flex items-center justify-between">
                            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Order Status</p>
                            <p className="font-black text-cyan-400 tracking-tighter text-xl italic">DRAFT</p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <Button type="button" className="h-14 w-full rounded-2xl bg-emerald-500 text-base font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98]">
                                <MessageCircle className="mr-3 size-6" /> Send Order via WhatsApp
                            </Button>
                            <Button type="button" className="h-14 w-full rounded-2xl bg-cyan-400 text-base font-bold shadow-lg shadow-cyan-400/20 hover:bg-cyan-500 active:scale-[0.98]">
                                <Mail className="mr-3 size-6" /> Send Order via Email
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormContainer>
    )
}
