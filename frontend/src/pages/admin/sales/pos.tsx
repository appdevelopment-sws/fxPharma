import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingCart,
  User,
  Pill,
  ScanLine,
  Filter,
  FileText,
  ChevronDown,
  Phone,
  Stethoscope,
  CheckCircle2,
  MapPin,
  Building2,
  AlertCircle,
} from "lucide-react"

import FilterPointofSale from "@/components/dialog/admin/FilterPointofSale"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/queryKeys"
import {
  CategoryApi,
  ManufacturerApi,
} from "@/services/attributesApi"
import InventoryApi from "@/services/inventoryApi"

type PosBatch = {
  id: string
  number: string
  expiry: string
  stock: number
  price: number
  isNearExpiry?: boolean
}

type PosProduct = {
  id: string
  name: string
  composition: string
  mfg: string
  category: string
  totalStock: number
  type: string
  formulation: string
  batches: PosBatch[]
}

type CartItem = {
  product: PosProduct
  batch: PosBatch
  qty: number
}

const formatExpiry = (value?: string | null) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-IN", {
    month: "2-digit",
    year: "2-digit",
  })
}

const isNearExpiry = (value?: string | null) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false

  const daysUntilExpiry =
    (parsed.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry <= 180
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getRelationName = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value) || "-"
  }

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === "string" || typeof name === "number") {
      return String(name) || "-"
    }
  }

  return "-"
}

const buildPosProduct = (inventoryItem: any): PosProduct => {
  const batches = Array.isArray(inventoryItem?.batches)
    ? inventoryItem.batches.map((batch: any) => {
        const price = toNumber(batch.mrp ?? batch.purchaseRate ?? 0)
        const stock = toNumber(batch.availableQty ?? batch.receivedQty ?? 0)

        return {
          id: batch.id,
          number: batch.batchNo || batch.number || "-",
          expiry: formatExpiry(batch.expiryDate || batch.expiry),
          stock,
          price,
          isNearExpiry: isNearExpiry(batch.expiryDate || batch.expiry),
        }
      })
    : []

  const fallbackStock = toNumber(inventoryItem?.availableStock ?? 0)
  const resolvedBatches =
    batches.length > 0
      ? batches
      : [
          {
            id: `${inventoryItem.id}-batch`,
            number: "N/A",
            expiry: "-",
            stock: fallbackStock,
            price: toNumber(
              inventoryItem?.mrp ?? inventoryItem?.purchaseRate ?? 0
            ),
            isNearExpiry: false,
          },
        ]

  return {
    id: inventoryItem.id,
    name: inventoryItem.name || "-",
    composition: inventoryItem.saltComposition || "-",
    mfg: getRelationName(inventoryItem.manufacturer),
    category: getRelationName(inventoryItem.category),
    totalStock:
      batches.length > 0
        ? batches.reduce((sum: number, batch: PosBatch) => sum + batch.stock, 0)
        : fallbackStock,
    type: inventoryItem.itemType || inventoryItem.type || "OTC",
    formulation: inventoryItem.formulation || inventoryItem.itemType || "all",
    batches: resolvedBatches,
  }
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [manufacturer, setManufacturer] = useState("All Manufacturers")

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [posFilters, setPosFilters] = useState<any>({
    stockStatus: "all",
    itemType: "all",
    formulation: [],
    manufacturers: [],
  })

  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [tendered, setTendered] = useState("")

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories.list({ limit: 1000 }),
    queryFn: () => CategoryApi.getCategories({ limit: 1000 }),
  })

  const { data: manufacturersData } = useQuery({
    queryKey: queryKeys.manufacturers.list({ limit: 1000 }),
    queryFn: () => ManufacturerApi.getManufacturers({ limit: 1000 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.inventory.list({ limit: 1000 }),
    queryFn: () => InventoryApi.getAll({ limit: 1000 }),
  })

  const categoryOptions = useMemo(
    () => [
      { label: "All Categories", value: "All Categories" },
      ...(categoriesData?.data || []).map((item: any) => ({
        label: item.name,
        value: item.name,
      })),
    ],
    [categoriesData]
  )

  const manufacturerOptions = useMemo(
    () => [
      { label: "All Manufacturers", value: "All Manufacturers" },
      ...(manufacturersData?.data || []).map((item: any) => ({
        label: item.name,
        value: item.name,
      })),
    ],
    [manufacturersData]
  )

  const manufacturerFilterOptions = useMemo(
    () =>
      (manufacturersData?.data || []).map((item: any) => ({
        label: item.name,
        value: item.name,
      })),
    [manufacturersData]
  )

  const products = useMemo(
    () => (productsData?.data || []).map(buildPosProduct),
    [productsData]
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.composition.toLowerCase().includes(search) ||
        product.mfg.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      if (!matchesSearch) return false

      const matchesCategory =
        category === "All Categories" || product.category === category
      if (!matchesCategory) return false

      const matchesManufacturer =
        manufacturer === "All Manufacturers" || product.mfg === manufacturer
      if (!matchesManufacturer) return false

      if (posFilters.stockStatus !== "all") {
        if (posFilters.stockStatus === "in_stock" && product.totalStock <= 0) {
          return false
        }
        if (
          posFilters.stockStatus === "out_of_stock" &&
          product.totalStock > 0
        ) {
          return false
        }
        if (
          posFilters.stockStatus === "low_stock" &&
          (product.totalStock <= 0 || product.totalStock > 50)
        ) {
          return false
        }
      }

      if (posFilters.itemType !== "all") {
        const normalizedType = product.type.toLowerCase()
        if (posFilters.itemType === "rx" && !normalizedType.includes("rx")) {
          return false
        }
        if (posFilters.itemType === "otc" && !normalizedType.includes("otc")) {
          return false
        }
        if (
          posFilters.itemType === "generics" &&
          normalizedType.includes("rx")
        ) {
          return false
        }
      }

      if (
        posFilters.formulation.length > 0 &&
        !posFilters.formulation.includes(product.formulation)
      ) {
        return false
      }

      if (posFilters.manufacturers.length > 0) {
        const matchesAnyMfg = posFilters.manufacturers.includes(product.mfg)
        if (!matchesAnyMfg) return false
      }

      return true
    })
  }, [category, manufacturer, posFilters, products, searchTerm])

  const addToCart = (product: PosProduct, batch: PosBatch) => {
    if (batch.stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.batch.id === batch.id)
      if (existing) {
        return prev.map((item) =>
          item.batch.id === batch.id
            ? { ...item, qty: Math.min(item.qty + 1, batch.stock) }
            : item
        )
      }

      return [...prev, { product, batch, qty: 1 }]
    })
  }

  const updateQty = (batchId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.batch.id !== batchId) return item
        const newQty = Math.min(
          item.batch.stock,
          Math.max(1, item.qty + delta)
        )
        return { ...item, qty: newQty }
      })
    )
  }

  const removeFromCart = (batchId: string) => {
    setCart((prev) => prev.filter((item) => item.batch.id !== batchId))
  }

  const grossTotal = cart.reduce(
    (sum, item) => sum + item.batch.price * item.qty,
    0
  )
  const discountAmount = (grossTotal * discountPercent) / 100
  const taxableAmount = grossTotal - discountAmount
  const tax = taxableAmount * 0.12
  const netPayable = taxableAmount + tax
  const roundedNet = Math.round(netPayable)
  const rounding = roundedNet - netPayable

  const tenderedAmount = parseFloat(tendered) || 0
  const changeAmount =
    tenderedAmount > roundedNet ? tenderedAmount - roundedNet : 0

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative flex-1">
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {manufacturerOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan barcode or search by item name, composition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pr-4 pl-10 text-sm text-foreground shadow-sm transition-all outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring"
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              F2
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2 pb-20">
          {filteredProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
              No products found for the selected filters.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-start gap-4 p-5">
                  <div
                    className={cn(
                      "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl",
                      product.type.toLowerCase().includes("rx")
                        ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-blue-500"
                    )}
                  >
                    <Pill className="h-8 w-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                        {product.name}
                      </h3>
                      {product.type && product.type !== "NORMAL" && (
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                          {product.type}
                        </span>
                      )}
                    </div>
                    <p className="mb-2 truncate text-sm text-slate-500 dark:text-slate-400">
                      {product.composition}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {product.mfg}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap",
                      product.totalStock > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    )}
                  >
                    {product.totalStock} IN STOCK
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-transparent">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold tracking-wider text-slate-400 dark:border-slate-800">
                        <th className="px-6 py-3">BATCH NO.</th>
                        <th className="px-6 py-3">EXPIRY</th>
                        <th className="px-6 py-3">AVAILABLE STOCK</th>
                        <th className="px-6 py-3">UNIT PRICE</th>
                        <th className="px-6 py-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {product.batches.map((batch) => (
                        <tr
                          key={batch.id}
                          className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                            {batch.number}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={cn(
                                "flex items-center gap-1.5 font-bold",
                                batch.isNearExpiry
                                  ? "text-red-500"
                                  : "text-slate-600 dark:text-slate-400"
                              )}
                            >
                              {batch.isNearExpiry && (
                                <AlertCircle className="h-3.5 w-3.5" />
                              )}
                              {batch.expiry}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                            {batch.stock} Strips
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                            ₹{batch.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => addToCart(product, batch)}
                              disabled={batch.stock <= 0}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                                batch.stock > 0
                                  ? "border border-blue-200 bg-white text-blue-600 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                  : "cursor-not-allowed bg-slate-100 text-slate-400"
                              )}
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="z-10 flex w-[400px] flex-col border-l border-border bg-card shadow-[-10px_0_30px_rgba(0,0,0,0.02)] xl:w-[480px]">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              Current Invoice
            </h2>
          </div>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            #INV-2023-089
          </span>
        </div>

        <div className="space-y-3 border-b border-border bg-card p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mobile Number"
                className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
            <div className="relative flex-[1.5]">
              <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Customer Name"
                defaultValue="Rahul Sharma"
                className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
          </div>

          <div className="relative">
            <Stethoscope className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Prescribing Doctor"
              defaultValue="Dr. A. K. Singh (Reg: 45892)"
              className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto bg-muted/30 p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">
                Cart is empty. Scan or select items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.batch.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                        {item.product.name}
                      </h4>
                      <div className="mt-0.5 flex gap-2 text-[11px] text-muted-foreground">
                        <span>Batch: {item.batch.number}</span>
                        <span>Exp: {item.batch.expiry}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground">
                        ₹{(item.batch.price * item.qty).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ₹{item.batch.price.toFixed(2)} / unit
                      </p>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-2">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-muted">
                      <button
                        onClick={() => updateQty(item.batch.id, -1)}
                        className="px-2 py-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={item.qty}
                        className="w-8 border-x border-border bg-transparent py-1 text-center text-sm font-bold text-foreground outline-none"
                      />
                      <button
                        onClick={() => updateQty(item.batch.id, 1)}
                        className="px-2 py-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        title="Add Discount"
                      >
                        <span className="text-xs font-bold">%</span>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.batch.id)}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="z-10 border-t border-border bg-card">
          <div className="space-y-2.5 border-b border-border p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>
                Gross Total ({cart.reduce((a, b) => a + b.qty, 0)} Items)
              </span>
              <span className="font-semibold text-foreground">
                ₹{grossTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Overall Discount</span>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-20 items-center overflow-hidden rounded border border-border">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-muted px-2 text-right text-sm text-foreground outline-none"
                  />
                  <span className="border-l border-border bg-muted px-1.5 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <span className="min-w-[50px] text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>CGST + SGST (12%)</span>
              <span className="font-semibold text-foreground">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Rounding</span>
              <span className="font-semibold text-foreground">
                {rounding >= 0 ? "+" : ""}₹{rounding.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-accent/50 px-4 py-3">
            <div>
              <h3 className="font-bold text-foreground">Net Payable</h3>
              <p className="text-[10px] text-muted-foreground uppercase">
                Includes all taxes
              </p>
            </div>
            <span className="text-2xl font-black tracking-tight text-primary">
              ₹{roundedNet.toFixed(2)}
            </span>
          </div>

          <div className="p-4">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {["Cash", "Card / POS", "UPI / QR"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-1 py-2 text-xs font-semibold transition-all ${paymentMode === mode ? "border-ring bg-primary/10 text-primary shadow-sm" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                >
                  {mode === "Cash" && <FileText className="h-4 w-4" />}
                  {mode === "Card / POS" && <Receipt className="h-4 w-4" />}
                  {mode === "UPI / QR" && <ScanLine className="h-4 w-4" />}
                  {mode}
                </button>
              ))}
            </div>

            <div className="mb-4 flex gap-3">
              <div className="relative flex-1">
                <label className="absolute -top-2 left-2 bg-card px-1 text-[10px] font-bold text-muted-foreground uppercase">
                  Tendered
                </label>
                <div className="flex items-center overflow-hidden rounded-lg border border-border transition-all focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                  <span className="pl-3 font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    className="w-full bg-transparent px-2 py-2.5 font-bold text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="relative flex-1">
                <label className="absolute -top-2 left-2 bg-card px-1 text-[10px] font-bold text-destructive uppercase">
                  Change
                </label>
                <div className="flex items-center overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10">
                  <span className="pl-3 font-bold text-destructive">₹</span>
                  <input
                    type="text"
                    readOnly
                    value={changeAmount.toFixed(2)}
                    className="w-full bg-transparent px-2 py-2.5 font-bold text-destructive outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all ${cart.length === 0 ? "cursor-not-allowed bg-muted text-muted-foreground shadow-none" : "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"}`}
            >
              <CheckCircle2 className="h-5 w-5" />
              Complete Payment (Enter)
            </button>
          </div>
        </div>
      </div>

      <FilterPointofSale
        open={isFilterOpen}
        onClose={setIsFilterOpen}
        initialFilters={posFilters}
        onFilter={setPosFilters}
        manufacturerOptions={manufacturerFilterOptions}
      />
    </div>
  )
}

export default POS
