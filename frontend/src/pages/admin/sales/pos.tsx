import { useState } from "react"
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

// Mock Data Restructured for Batch Management
const CATEGORIES = [
  "All Categories",
  "Rx Only",
  "OTC",
  "Antibiotics",
  "Analgesics",
  "Syrups",
]
const MANUFACTURERS = [
  "All Manufacturers",
  "Cipla Ltd.",
  "Sun Pharma",
  "Micro Labs",
  "Abbott",
]

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Amoxicillin 500mg Cap",
    type: "Rx",
    composition: "Amoxicillin Trihydrate IP",
    mfg: "Cipla Ltd.",
    rack: "A-04",
    totalStock: 450,
    formulation: "tablet_capsule",
    batches: [
      { id: "1-b1", number: "AMX-23A", expiry: "10/25", stock: 150, price: 12.5, isNearExpiry: true },
      { id: "1-b2", number: "AMX-24B", expiry: "12/26", stock: 300, price: 13.0 },
    ],
  },
  {
    id: 2,
    name: "Cetirizine 10mg Tab",
    type: "OTC",
    composition: "Cetirizine Hydrochloride IP",
    mfg: "Sun Pharma",
    rack: "B-12",
    totalStock: 85,
    formulation: "tablet_capsule",
    batches: [
      { id: "2-b1", number: "CET-24A", expiry: "01/27", stock: 85, price: 4.5 },
    ],
  },
  {
    id: 3,
    name: "Dolo 650mg Tab",
    type: "OTC",
    composition: "Paracetamol IP 650mg",
    mfg: "Micro Labs",
    rack: "C-05",
    totalStock: 0,
    formulation: "tablet_capsule",
    batches: [
      { id: "3-b1", number: "DOL-23C", expiry: "10/25", stock: 0, price: 3.0, isNearExpiry: true },
    ],
  },
  {
    id: 4,
    name: "Azithromycin 250mg",
    type: "Rx",
    composition: "Azithromycin IP",
    mfg: "Cipla Ltd.",
    rack: "A-09",
    totalStock: 120,
    formulation: "tablet_capsule",
    batches: [
      { id: "4-b1", number: "AZI-24", expiry: "11/26", stock: 120, price: 22.0 },
    ],
  },
  {
    id: 5,
    name: "Cough Syrup 100ml",
    type: "OTC",
    composition: "Diphenhydramine",
    mfg: "Sun Pharma",
    rack: "S-02",
    totalStock: 40,
    formulation: "syrup_suspension",
    batches: [
      { id: "5-b1", number: "SYR-23", expiry: "08/25", stock: 40, price: 45.0, isNearExpiry: true },
    ],
  },
]

const POS = () => {
  const [cart, setCart] = useState<{ product: any; batch: any; qty: number }[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [manufacturer, setManufacturer] = useState("All Manufacturers")

  // Filter Dialog State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [posFilters, setPosFilters] = useState<any>({
    stockStatus: "all",
    itemType: "all",
    formulation: [],
    manufacturers: [],
  })

  // Invoice state
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [tendered, setTendered] = useState("")

  const addToCart = (product: any, batch: any) => {
    if (batch.stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.batch.id === batch.id)
      if (existing) {
        return prev.map((item) =>
          item.batch.id === batch.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { product, batch, qty: 1 }]
    })
  }

  const updateQty = (batchId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.batch.id === batchId) {
          const newQty = Math.max(1, item.qty + delta)
          return { ...item, qty: newQty }
        }
        return item
      })
    )
  }

  const removeFromCart = (batchId: string) => {
    setCart((prev) => prev.filter((item) => item.batch.id !== batchId))
  }

  // Calculations
  const grossTotal = cart.reduce(
    (sum, item) => sum + item.batch.price * item.qty,
    0
  )
  const discountAmount = (grossTotal * discountPercent) / 100
  const taxableAmount = grossTotal - discountAmount
  const tax = taxableAmount * 0.12 // 12% GST example
  const netPayable = taxableAmount + tax
  const roundedNet = Math.round(netPayable)
  const rounding = roundedNet - netPayable

  const tenderedAmount = parseFloat(tendered) || 0
  const changeAmount =
    tenderedAmount > roundedNet ? tenderedAmount - roundedNet : 0

  const filteredProducts = DUMMY_PRODUCTS.filter((p) => {
    // 1. Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.composition.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    // 2. Simple top filters (Category & Manufacturer)
    const matchesCat = category === "All Categories" || p.type === category
    if (!matchesCat) return false

    const matchesMfg =
      manufacturer === "All Manufacturers" || p.mfg === manufacturer
    if (!matchesMfg) return false

    // 3. Advanced Dialog Filters
    // Stock Status
    if (posFilters.stockStatus !== "all") {
      if (posFilters.stockStatus === "in_stock" && p.totalStock <= 0) return false
      if (posFilters.stockStatus === "out_of_stock" && p.totalStock > 0) return false
      if (posFilters.stockStatus === "low_stock" && (p.totalStock <= 0 || p.totalStock > 50))
        return false
    }

    // Item Type
    if (posFilters.itemType !== "all") {
      if (posFilters.itemType === "rx" && p.type !== "Rx") return false
      if (posFilters.itemType === "otc" && p.type !== "OTC") return false
      if (posFilters.itemType === "generics" && p.type === "Rx") return false
    }

    // Formulation
    if (
      posFilters.formulation.length > 0 &&
      !posFilters.formulation.includes(p.formulation)
    ) {
      return false
    }

    // Manufacturers
    if (posFilters.manufacturers.length > 0) {
      const mfgMap: any = {
        cipla: "Cipla Ltd.",
        sun_pharma: "Sun Pharma",
        abbott: "Abbott",
        mankind: "Mankind",
        gsk: "GSK",
        torrent: "Torrent",
      }
      const matchesAnyMfg = posFilters.manufacturers.some(
        (val: string) => mfgMap[val] === p.mfg
      )
      if (!matchesAnyMfg) return false
    }

    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      {/* LEFT PANE - PRODUCTS */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {/* Top Filters */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Product List - Redesigned Cards */}
        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2 pb-20 space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start gap-4">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0",
                  product.type === "Rx" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                )}>
                  <Pill className="h-8 w-8" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 truncate dark:text-white">
                      {product.name}
                    </h3>
                    {product.type === "Rx" && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Rx
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-2 truncate dark:text-slate-400">
                    {product.composition}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {product.mfg}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Rack: {product.rack}
                    </span>
                  </div>
                </div>

                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap",
                  product.totalStock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {product.totalStock} IN STOCK
                </div>
              </div>

              {/* Batches Table */}
              <div className="border-t border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-transparent">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3">BATCH NO.</th>
                      <th className="px-6 py-3">EXPIRY</th>
                      <th className="px-6 py-3">AVAILABLE STOCK</th>
                      <th className="px-6 py-3">UNIT PRICE</th>
                      <th className="px-6 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {product.batches.map((batch) => (
                      <tr key={batch.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                          {batch.number}
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "flex items-center gap-1.5 font-bold",
                            batch.isNearExpiry ? "text-red-500" : "text-slate-600 dark:text-slate-400"
                          )}>
                            {batch.isNearExpiry && <AlertCircle className="h-3.5 w-3.5" />}
                            {batch.expiry}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                          {batch.stock} Strips
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900 text-sm dark:text-white">
                          ₹{batch.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => addToCart(product, batch)}
                            disabled={batch.stock <= 0}
                            className={cn(
                              "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                              batch.stock > 0
                                ? "bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
          ))}
        </div>
      </div>

      {/* RIGHT PANE - CART & PAYMENT */}
      <div className="z-10 flex w-[400px] flex-col border-l border-border bg-card shadow-[-10px_0_30px_rgba(0,0,0,0.02)] xl:w-[480px]">
        {/* Cart Header */}
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

        {/* Customer & Doctor Info */}
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
          <p className="flex items-center gap-1 px-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <GiftIcon /> 450 Reward Points Available
          </p>
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

        {/* Cart Items */}
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
                        {item.product.type === "Rx" && (
                          <span className="text-destructive-foreground rounded bg-destructive px-1 text-[9px] font-bold uppercase">
                            Rx
                          </span>
                        )}
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

        {/* Totals & Payment (Bottom fixed area) */}
        <div className="z-10 border-t border-border bg-card">
          {/* Subtotals */}
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

          {/* Net Payable */}
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

          {/* Payment Methods */}
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
                  <span className="pl-3 font-bold text-muted-foreground">
                    ₹
                  </span>
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
      />
    </div>
  )
}

// Mini internal icon since lucide-react doesn't have Gift by default in our list
const GiftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
)

export default POS
