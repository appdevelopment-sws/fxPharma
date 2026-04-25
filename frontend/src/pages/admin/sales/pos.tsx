import React, { useState } from "react"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Save,
  RefreshCw,
  X,
  Receipt,
  ShoppingCart,
  User,
  Package,
  Pill,
  ScanLine,
  Filter,
  FileText,
  ChevronDown,
  Phone,
  Stethoscope,
  CheckCircle2,
} from "lucide-react"

// Mock Data
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
    composition: "Amoxicillin Trihydrate IP",
    stock: 450,
    price: 12.5,
    type: "Rx",
    mfg: "Cipla Ltd.",
    batch: "AMX-24B",
    expiry: "12/26",
  },
  {
    id: 2,
    name: "Cetirizine 10mg Tab",
    composition: "Cetirizine Hydrochloride IP",
    stock: 85,
    price: 4.5,
    type: "OTC",
    mfg: "Sun Pharma",
    batch: "CET-24A",
    expiry: "01/27",
  },
  {
    id: 3,
    name: "Dolo 650mg Tab",
    composition: "Paracetamol IP 650mg",
    stock: 0,
    price: 3.0,
    type: "OTC",
    mfg: "Micro Labs",
    batch: "DOL-23C",
    expiry: "10/25",
  },
  {
    id: 4,
    name: "Azithromycin 250mg",
    composition: "Azithromycin IP",
    stock: 120,
    price: 22.0,
    type: "Rx",
    mfg: "Cipla Ltd.",
    batch: "AZI-24",
    expiry: "11/26",
  },
  {
    id: 5,
    name: "Vitamin C 500mg",
    composition: "Ascorbic Acid",
    stock: 500,
    price: 2.0,
    type: "Supplement",
    mfg: "Abbott",
    batch: "VIT-24",
    expiry: "05/27",
  },
  {
    id: 6,
    name: "Cough Syrup 100ml",
    composition: "Diphenhydramine",
    stock: 40,
    price: 45.0,
    type: "OTC",
    mfg: "Sun Pharma",
    batch: "SYR-23",
    expiry: "08/25",
  },
  {
    id: 7,
    name: "Pain Relief Spray",
    composition: "Diclofenac Diethylamine",
    stock: 30,
    price: 120.0,
    type: "OTC",
    mfg: "Cipla Ltd.",
    batch: "SPR-24",
    expiry: "09/26",
  },
  {
    id: 8,
    name: "Band-Aid (Waterproof)",
    composition: "Plaster",
    stock: 1000,
    price: 1.0,
    type: "First Aid",
    mfg: "Johnson",
    batch: "BND-24",
    expiry: "12/28",
  },
  {
    id: 9,
    name: "Omeprazole 20mg",
    composition: "Omeprazole IP",
    stock: 210,
    price: 8.5,
    type: "Rx",
    mfg: "Sun Pharma",
    batch: "OMP-24",
    expiry: "03/26",
  },
  {
    id: 10,
    name: "Pantoprazole 40mg",
    composition: "Pantoprazole Sodium",
    stock: 150,
    price: 10.0,
    type: "Rx",
    mfg: "Micro Labs",
    batch: "PAN-23",
    expiry: "02/25",
  },
]

const POS = () => {
  const [cart, setCart] = useState<{ product: any; qty: number }[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [manufacturer, setManufacturer] = useState("All Manufacturers")

  // Invoice state
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [tendered, setTendered] = useState("")

  const addToCart = (product: any) => {
    if (product.stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const newQty = Math.max(1, item.qty + delta)
          return { ...item, qty: newQty }
        }
        return item
      })
    )
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id))
  }

  // Calculations
  const grossTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
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
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.composition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = category === "All Categories" || p.type === category
    const matchesMfg =
      manufacturer === "All Manufacturers" || p.mfg === manufacturer
    return matchesSearch && matchesCat && matchesMfg
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
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Product Grid */}
        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2 pb-20">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`group relative flex h-full cursor-pointer flex-col rounded-xl border p-4 transition-all hover:shadow-md ${product.stock <= 0 ? "cursor-not-allowed border-destructive/30 bg-destructive/10 opacity-60" : "border-border bg-card hover:border-ring"}`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${product.type === "Rx" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                  >
                    <Pill className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${product.stock > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}
                  >
                    {product.stock > 0
                      ? `${product.stock} IN STOCK`
                      : "OUT OF STOCK"}
                  </span>
                </div>

                <h3 className="mb-1 line-clamp-2 text-sm leading-snug font-semibold text-card-foreground">
                  {product.name}
                </h3>
                <p className="mb-3 line-clamp-1 text-xs text-muted-foreground">
                  {product.mfg}
                </p>

                <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                  <div>
                    <p className="mb-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                      Price
                    </p>
                    <p className="font-bold text-card-foreground">
                      ₹{product.price.toFixed(2)}
                    </p>
                  </div>
                  {product.stock > 0 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                  key={item.product.id}
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
                        <span>Batch: {item.product.batch}</span>
                        <span>Exp: {item.product.expiry}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground">
                        ₹{(item.product.price * item.qty).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ₹{item.product.price.toFixed(2)} / unit
                      </p>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-2">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-muted">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
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
                        onClick={() => updateQty(item.product.id, 1)}
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
                        onClick={() => removeFromCart(item.product.id)}
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
