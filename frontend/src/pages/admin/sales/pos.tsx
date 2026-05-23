import { useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import InvoiceApi from "@/services/invoiceApi"
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Pill,
  ScanLine,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  Printer,
  Search,
} from "lucide-react"
import { toast } from "sonner"

import FilterPointofSale from "@/components/dialog/admin/FilterPointofSale"
import ConfigureSaleItemDialog from "@/components/dialog/admin/ConfigureSaleItemDialog"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/queryKeys"
import { CategoryApi, ManufacturerApi } from "@/services/attributesApi"
import InventoryApi from "@/services/inventoryApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type PosBatch = {
  id: string
  number: string
  expiry: string
  stock: number
  price: number
  isNearExpiry?: boolean
  rateA: number
  rateB: number
  rateC: number
  mrp: number
  purchaseRate: number
  cgst: number
  sgst: number
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
  packing?: string
  unit1st?: string
  unit2nd?: string
  packQty1?: number
  packQty2?: number
  packQty3?: number
  convStri?: number
  convCas?: number
}

type CartItem = {
  id: string
  product: PosProduct
  batch: PosBatch
  qty: number
  sellUnit: "strip" | "piece"
  rateType: "mrp" | "rateA" | "rateB" | "rateC"
  rateValue: number
  itemDiscount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatExpiry = (value?: string | null) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-IN", { month: "2-digit", year: "2-digit" })
}

const isNearExpiry = (value?: string | null) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return (parsed.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 180
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getRelationName = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") return String(value) || "-"
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === "string" || typeof name === "number") return String(name) || "-"
  }
  return "-"
}

const buildPosProduct = (inventoryItem: any): PosProduct => {
  const batches = Array.isArray(inventoryItem?.batches)
    ? inventoryItem.batches.map((batch: any) => {
      const mrp = toNumber(batch.mrp ?? 0)
      const rateA = toNumber(batch.rateA ?? batch.rate_a ?? 0)
      const rateB = toNumber(batch.rateB ?? batch.rate_b ?? 0)
      const rateC = toNumber(batch.rateC ?? batch.rate_c ?? 0)
      const purchaseRate = toNumber(batch.purchaseRate ?? batch.purchase_rate ?? 0)
      const price = mrp || purchaseRate || 0
      const stock = toNumber(batch.availableQty ?? batch.receivedQty ?? 0)
      return {
        id: batch.id,
        number: batch.batchNo || batch.number || "-",
        expiry: formatExpiry(batch.expiryDate || batch.expiry),
        stock,
        price,
        isNearExpiry: isNearExpiry(batch.expiryDate || batch.expiry),
        rateA,
        rateB,
        rateC,
        mrp,
        purchaseRate,
        cgst: toNumber(batch.cgst ?? 0),
        sgst: toNumber(batch.sgst ?? 0),
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
          price: toNumber(inventoryItem?.mrp ?? inventoryItem?.purchaseRate ?? 0),
          isNearExpiry: false,
          rateA: toNumber(inventoryItem?.rateA ?? 0),
          rateB: toNumber(inventoryItem?.rateB ?? 0),
          rateC: toNumber(inventoryItem?.rateC ?? 0),
          mrp: toNumber(inventoryItem?.mrp ?? 0),
          purchaseRate: toNumber(inventoryItem?.purchaseRate ?? 0),
          cgst: toNumber(inventoryItem?.cgst ?? 0),
          sgst: toNumber(inventoryItem?.sgst ?? 0),
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
        ? batches.reduce((sum: number, b: PosBatch) => sum + b.stock, 0)
        : fallbackStock,
    type: inventoryItem.itemType || inventoryItem.type || "OTC",
    formulation: inventoryItem.formulation || inventoryItem.itemType || "all",
    batches: resolvedBatches,
    packing: inventoryItem.packing || "",
    unit1st: inventoryItem.unit1st || "",
    unit2nd: inventoryItem.unit2nd || "",
    packQty1: toNumber(inventoryItem.packQty1 ?? 0),
    packQty2: toNumber(inventoryItem.packQty2 ?? 0),
    packQty3: toNumber(inventoryItem.packQty3 ?? 0),
    convStri: toNumber(inventoryItem.convStri ?? 0),
    convCas: toNumber(inventoryItem.convCas ?? 0),
  }
}

const getQtyPerStrip = (product: PosProduct) => {
  if (product.convStri && product.convStri > 0) return product.convStri
  if (product.packQty3 && product.packQty3 > 0) return product.packQty3
  const packingStr = String(product.packing || "").toLowerCase()
  const matches = packingStr.match(/(\d+)\s*(tablet|capsule|piece|tab|cap|'s|s)/)
  if (matches && matches[1]) {
    const parsed = parseInt(matches[1], 10)
    if (parsed > 0) return parsed
  }
  const ratioMatches = packingStr.match(/1\s*x\s*(\d+)/)
  if (ratioMatches && ratioMatches[1]) {
    const parsed = parseInt(ratioMatches[1], 10)
    if (parsed > 0) return parsed
  }
  const numMatches = packingStr.match(/(\d+)/)
  if (numMatches && numMatches[1]) {
    const parsed = parseInt(numMatches[1], 10)
    if (parsed > 0) return parsed
  }
  return 10
}

const getRateValue = (
  batch: PosBatch,
  rateType: "mrp" | "rateA" | "rateB" | "rateC",
  sellUnit: "strip" | "piece",
  qtyPerStrip: number
) => {
  let baseRate = 0
  if (rateType === "mrp") baseRate = batch.mrp || batch.price || 0
  else if (rateType === "rateA") baseRate = batch.rateA || batch.mrp || batch.price || 0
  else if (rateType === "rateB") baseRate = batch.rateB || batch.mrp || batch.price || 0
  else if (rateType === "rateC") baseRate = batch.rateC || batch.mrp || batch.price || 0
  if (sellUnit === "piece" && qtyPerStrip > 0) return baseRate / qtyPerStrip
  return baseRate
}

// ─── Product illustration helper ─────────────────────────────────────────────

const getProductGradient = (productId: string) => {
  const gradients = [
    { from: "#fb7185", to: "#f43f5e", bg: "bg-rose-50" },
    { from: "#60a5fa", to: "#2563eb", bg: "bg-blue-50" },
    { from: "#fbbf24", to: "#d97706", bg: "bg-amber-50" },
    { from: "#34d399", to: "#059669", bg: "bg-emerald-50" },
    { from: "#c084fc", to: "#7c3aed", bg: "bg-purple-50" },
    { from: "#22d3ee", to: "#0891b2", bg: "bg-cyan-50" },
    { from: "#f472b6", to: "#db2777", bg: "bg-pink-50" },
  ]
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

const getProductIllustration = (product: PosProduct, size: "sm" | "md" = "md") => {
  const name = product.name.toLowerCase()
  const form = (product.formulation || "").toLowerCase()
  const grad = getProductGradient(product.id)
  const svgClass = size === "sm" ? "w-7 h-7" : "w-14 h-14"
  const wrapClass = size === "sm" ? "h-8 w-8" : "h-full w-full"

  const wrap = (child: React.ReactNode) => (
    <div className={cn("flex items-center justify-center rounded", wrapClass, grad.bg)}>
      {child}
    </div>
  )

  if (name.includes("elvive") || name.includes("shampoo") || name.includes("body wash")) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient id={`sg-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <path d="M26 12h12v4H26z" fill="#94a3b8" />
        <path d="M22 16h20v6H22z" fill="#64748b" />
        <rect x="18" y="22" width="28" height="34" rx="6" fill={`url(#sg-${product.id})`} />
        <rect x="22" y="30" width="20" height="16" rx="2" fill="white" opacity="0.8" />
        <path d="M26 34h12v2H26zm0 4h8v2H26z" fill={grad.to} />
      </svg>
    )
  }

  if (
    name.includes("vitalzin") ||
    name.includes("drop") ||
    name.includes("syrup") ||
    form.includes("syrup") ||
    form.includes("suspension")
  ) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient id={`bg-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <rect x="8" y="12" width="22" height="42" rx="2" fill={`url(#bg-${product.id})`} />
        <rect x="12" y="20" width="14" height="24" fill="white" opacity="0.3" />
        <rect x="36" y="24" width="18" height="30" rx="3" fill="#64748b" />
        <path d="M41 20h8v4h-8z" fill="#475569" />
        <path d="M43 14h4v6h-4z" fill="#94a3b8" />
        <rect x="40" y="32" width="10" height="14" fill="white" opacity="0.8" />
      </svg>
    )
  }

  if (
    name.includes("curafin") ||
    name.includes("gel") ||
    name.includes("cream") ||
    name.includes("ointment")
  ) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient id={`tg-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <path d="M12 48 L22 14 C23 11 27 11 28 14 L38 48 Z" fill={`url(#tg-${product.id})`} />
        <rect x="10" y="48" width="30" height="4" fill="#475569" />
        <rect x="22" y="10" width="6" height="4" fill="#94a3b8" />
        <rect x="19" y="30" width="12" height="8" transform="rotate(-15 19 30)" fill="white" opacity="0.8" />
      </svg>
    )
  }

  if (name.includes("avaspray") || name.includes("spray") || name.includes("inhaler")) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient id={`spg-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <rect x="20" y="24" width="24" height="32" rx="4" fill={`url(#spg-${product.id})`} />
        <path d="M28 12h8v12h-8z" fill="#94a3b8" />
        <path d="M36 14h6v4h-6z" fill="#475569" />
        <circle cx="40" cy="16" r="1.5" fill="#f43f5e" />
        <rect x="25" y="32" width="14" height="12" rx="1" fill="white" opacity="0.8" />
      </svg>
    )
  }

  // Generic medicine box (default)
  return wrap(
    <svg viewBox="0 0 64 64" className={svgClass} fill="none">
      <defs>
        <linearGradient id={`bxg-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
      </defs>
      <rect x="10" y="16" width="44" height="32" rx="4" fill={`url(#bxg-${product.id})`} />
      <rect x="14" y="22" width="36" height="8" fill="white" opacity="0.8" />
      <circle cx="20" cy="38" r="4" fill="white" opacity="0.5" />
      <circle cx="28" cy="38" r="4" fill="white" opacity="0.5" />
      <line x1="36" y1="38" x2="48" y2="38" stroke="white" strokeWidth="2" opacity="0.5" />
      <line x1="36" y1="42" x2="44" y2="42" stroke="white" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}

// ─── POS Component ────────────────────────────────────────────────────────────

const POS = () => {
  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Search / filter
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [manufacturer, setManufacturer] = useState("All Manufacturers")

  // Selected card highlight
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  // Configure modal
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [configProduct, setConfigProduct] = useState<PosProduct | null>(null)
  const [configBatch, setConfigBatch] = useState<PosBatch | null>(null)

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [posFilters, setPosFilters] = useState<any>({
    stockStatus: "all",
    itemType: "all",
    formulation: [],
    manufacturers: [],
  })

  // Invoice fields
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountType, setDiscountType] = useState<"flat" | "percent">("percent")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [deliveryCost, setDeliveryCost] = useState(0)
  const [binValue, setBinValue] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  // Success modal
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successInvoiceDetails, setSuccessInvoiceDetails] = useState<any>(null)

  // Live clock
  const [liveTime, setLiveTime] = useState(
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  )
  useEffect(() => {
    const t = setInterval(
      () =>
        setLiveTime(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        ),
      1000
    )
    return () => clearInterval(t)
  }, [])

  // ── Data queries ──────────────────────────────────────────────────────────

  const queryClient = useQueryClient()

  const createInvoiceMutation = useMutation({
    mutationFn: (payload: any) => InvoiceApi.createInvoice(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })

      const responseData = response.data
      setSuccessInvoiceDetails({
        id: responseData.invoice_id || responseData.id,
        customerName: responseData.customer_name,
        customerPhone: responseData.customer_phone,
        items: responseData.items || cart,
        grossTotal: responseData.gross_amount,
        itemDiscounts: responseData.discount_amount,
        overallDiscount: responseData.discount_amount,
        tax: responseData.tax_amount,
        netPayable: responseData.total_amount,
        tendered: responseData.tendered_amount,
        change: responseData.change_amount,
        paymentMode: responseData.payment_mode,
        date: new Date(responseData.createdAt).toLocaleString("en-IN"),
      })
      setSuccessModalOpen(true)
      toast.success("Invoice saved and stock updated!")
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to save invoice."
      toast.error(errMsg)
    },
  })

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
      if (
        search &&
        !product.name.toLowerCase().includes(search) &&
        !product.composition.toLowerCase().includes(search) &&
        !product.mfg.toLowerCase().includes(search) &&
        !product.category.toLowerCase().includes(search)
      )
        return false

      if (category !== "All Categories" && product.category !== category) return false
      if (manufacturer !== "All Manufacturers" && product.mfg !== manufacturer) return false

      if (posFilters.stockStatus !== "all") {
        if (posFilters.stockStatus === "in_stock" && product.totalStock <= 0) return false
        if (posFilters.stockStatus === "out_of_stock" && product.totalStock > 0) return false
        if (posFilters.stockStatus === "low_stock" && (product.totalStock <= 0 || product.totalStock > 50))
          return false
      }

      if (posFilters.itemType !== "all") {
        const t = product.type.toLowerCase()
        if (posFilters.itemType === "rx" && !t.includes("rx")) return false
        if (posFilters.itemType === "otc" && !t.includes("otc")) return false
        if (posFilters.itemType === "generics" && t.includes("rx")) return false
      }

      if (posFilters.formulation.length > 0 && !posFilters.formulation.includes(product.formulation))
        return false
      if (posFilters.manufacturers.length > 0 && !posFilters.manufacturers.includes(product.mfg))
        return false

      return true
    })
  }, [category, manufacturer, posFilters, products, searchTerm])

  // ── Cart actions ──────────────────────────────────────────────────────────

  const handleAddConfiguredToCart = (config: {
    rateType: "mrp" | "rateA" | "rateB" | "rateC"
    sellUnit: "strip" | "piece"
    qty: number
    itemDiscount: number
    batch: PosBatch
  }) => {
    if (!configProduct) return
    const b = config.batch
    const qtyPerStrip = getQtyPerStrip(configProduct)
    const maxStock = config.sellUnit === "strip" ? b.stock : b.stock * qtyPerStrip

    if (config.qty <= 0) {
      toast.error("Please enter a valid quantity.")
      return
    }
    if (config.qty > maxStock) {
      toast.error(
        `Insufficient stock! Max available is ${maxStock} ${config.sellUnit === "strip" ? "Strips" : "Pieces"}.`
      )
      return
    }

    const rateVal = getRateValue(b, config.rateType, config.sellUnit, qtyPerStrip)
    const cartItemId = `${b.id}-${config.sellUnit}-${config.rateType}`

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId)
      if (existingIdx > -1) {
        const existing = prev[existingIdx]
        const newQty = Math.min(existing.qty + config.qty, maxStock)
        const updated = [...prev]
        updated[existingIdx] = { ...existing, qty: newQty, itemDiscount: config.itemDiscount }
        return updated
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product: configProduct,
          batch: b,
          qty: config.qty,
          sellUnit: config.sellUnit,
          rateType: config.rateType,
          rateValue: rateVal,
          itemDiscount: config.itemDiscount,
        },
      ]
    })

    setConfigModalOpen(false)
    toast.success(`${configProduct.name} added to invoice.`)
  }

  const updateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item
        const qtyPerStrip = getQtyPerStrip(item.product)
        const maxStock =
          item.sellUnit === "strip" ? item.batch.stock : item.batch.stock * qtyPerStrip
        const newQty = Math.min(maxStock, Math.max(1, item.qty + delta))
        return { ...item, qty: newQty }
      })
    )
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId))
  }

  const updateItemDiscount = (cartItemId: string, disc: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id !== cartItemId ? item : { ...item, itemDiscount: Math.min(100, Math.max(0, disc)) }
      )
    )
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const grossTotal = cart.reduce((sum, item) => sum + item.rateValue * item.qty, 0)

  const totalItemDiscountAmount = cart.reduce(
    (sum, item) => sum + (item.rateValue * item.qty * item.itemDiscount) / 100,
    0
  )

  const totalTaxAmount = cart.reduce((sum, item) => {
    const itemTaxable = item.rateValue * item.qty * (1 - item.itemDiscount / 100)
    return sum + (itemTaxable * (toNumber(item.batch.cgst) + toNumber(item.batch.sgst))) / 100
  }, 0)

  const totalAfterItemDiscount = grossTotal - totalItemDiscountAmount
  const discountAmount =
    discountType === "flat"
      ? Math.min(discountPercent, totalAfterItemDiscount)
      : (totalAfterItemDiscount * discountPercent) / 100
  const taxableAmount = totalAfterItemDiscount - discountAmount
  const netPayable = taxableAmount + totalTaxAmount + deliveryCost - binValue
  const roundedNet = Math.max(0, Math.round(netPayable))

  const tenderedAmount = parseFloat(receiveAmount) || 0
  const changeAmount = tenderedAmount > roundedNet ? tenderedAmount - roundedNet : 0
  const dueAmount = tenderedAmount < roundedNet ? roundedNet - tenderedAmount : 0

  // ── Payment ───────────────────────────────────────────────────────────────

  const handleCompletePayment = (printOnSuccess = false) => {
    if (cart.length === 0) return

    const payload = {
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      paymentMode: paymentMode === "Cash" ? "CASH" : paymentMode === "UPI / QR" ? "UPI" : "CARD",
      grossAmount: grossTotal,
      discountAmount: discountAmount,
      taxAmount: totalTaxAmount,
      deliveryCost: deliveryCost,
      totalAmount: roundedNet,
      tenderedAmount: tenderedAmount || roundedNet,
      changeAmount: changeAmount,
      items: cart.map((item) => {
        const subTotal = item.rateValue * item.qty - (item.rateValue * item.qty * item.itemDiscount) / 100
        return {
          inventoryId: item.product.id,
          inventoryName: item.product.name,
          batchId: item.batch.id.endsWith("-batch") ? null : item.batch.id,
          batchNo: item.batch.number === "N/A" ? null : item.batch.number,
          qty: item.qty,
          sellUnit: item.sellUnit,
          rateType: item.rateType,
          rateValue: item.rateValue,
          itemDiscount: item.itemDiscount,
          subTotal: subTotal,
        }
      }),
    }

    createInvoiceMutation.mutate(payload, {
      onSuccess: () => {
        if (printOnSuccess) {
          toast.info("Preparing print...")
        }
      }
    })
  }

  const resetPos = () => {
    setCart([])
    setSearchTerm("")
    setCustomerName("")
    setCustomerPhone("")
    setDiscountPercent(0)
    setDiscountType("percent")
    setReceiveAmount("")
    setDeliveryCost(0)
    setBinValue(0)
    setSelectedProductId(null)
    setSuccessModalOpen(false)
    setSuccessInvoiceDetails(null)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 font-sans text-gray-900 select-none">

      {/* ══════════════════════════════════════════════
          LEFT PANEL — Product Catalog
      ══════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* ── Top bar: search + filters ── */}
        <div className="flex items-center gap-2.5 border-b border-gray-200 bg-white px-4 py-3 shadow-sm flex-shrink-0">
          {/* Search */}
          <div className="relative min-w-0 flex-1 max-w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search / Scan medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300/30 transition-all"
            />
            <ScanLine className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm outline-none focus:border-teal-400 transition-all"
            >
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Manufacturer */}
          <div className="relative hidden md:block">
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm outline-none focus:border-teal-400 transition-all"
            >
              {manufacturerOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
          >
            <Filter className="h-3.5 w-3.5 text-teal-500" />
            Filter
          </button>

          {/* Spacer + count */}
          <span className="ml-auto hidden sm:block text-xs text-gray-400 font-semibold whitespace-nowrap">
            {filteredProducts.length} items
          </span>

          {/* Clock */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            {liveTime}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-300">
              <Pill className="h-12 w-12 animate-bounce" />
              <p className="text-sm font-semibold">No products found.</p>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
            >
              {filteredProducts.map((product) => {
                const firstBatch = product.batches[0] || null
                const basePrice = firstBatch ? firstBatch.mrp || firstBatch.price || 0 : 0
                const isOutOfStock = product.totalStock <= 0
                const isSelected = selectedProductId === product.id

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setConfigProduct(product)
                      setConfigBatch(firstBatch)
                      setConfigModalOpen(true)
                    }}
                    className={cn(
                      "relative flex flex-col items-center rounded-lg border bg-white p-2.5 text-left transition-all duration-150 active:scale-[0.97] cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-teal-500 ring-1 ring-teal-400/40 shadow-sm bg-teal-50/30"
                        : isOutOfStock
                          ? "border-gray-200 opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-teal-300"
                    )}
                  >
                    {/* Illustration */}
                    <div className="flex h-[100px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-50 mb-2.5">
                      {getProductIllustration(product, "md")}
                    </div>

                    {/* Name */}
                    <p className="w-full text-center text-xs font-semibold leading-tight text-gray-800 line-clamp-2">
                      {product.name}
                    </p>

                    {/* Price */}
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      {basePrice > 0 ? `${basePrice.toFixed(2)}` : "0"}
                      <span className="text-[10px] font-semibold text-gray-400"></span>
                    </p>

                    {/* Out of stock badge */}
                    {isOutOfStock && (
                      <span className="absolute top-1.5 right-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Out
                      </span>
                    )}
                  </button>
                )
              })}

              {/* Empty placeholder cards to maintain grid shape */}
              {Array.from({
                length: Math.max(
                  0,
                  filteredProducts.length % 5 === 0
                    ? 0
                    : 5 - (filteredProducts.length % 5)
                ),
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex flex-col items-center rounded-lg border border-dashed border-gray-200 bg-white/60 p-2.5 opacity-40"
                >
                  <div className="flex h-[100px] w-full items-center justify-center rounded-md bg-gray-50 mb-2.5">
                    <ShoppingCart className="h-8 w-8 text-gray-200" />
                  </div>
                  <p className="text-xs font-semibold text-gray-300">—</p>
                  <p className="text-xs text-gray-200">---</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Invoice
      ══════════════════════════════════════════════ */}
      <div className="flex w-[540px] xl:w-[600px] flex-col border-l border-gray-200 bg-white shadow-xl flex-shrink-0">

        {/* ── Table header ── */}
        <div
          className="grid flex-shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500"
          style={{ gridTemplateColumns: "40px 1fr 70px 56px 108px 84px 76px" }}
        >
          <span>Image</span>
          <span>Items</span>
          <span>Batch</span>
          <span>Price</span>
          <span>Discount</span>
          <span className="text-center">Qty</span>
          <span className="text-right pr-1">Sub Total</span>
        </div>

        {/* ── Cart rows ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-gray-300">
              <ShoppingCart className="h-10 w-10" />
              <p className="text-xs font-semibold text-gray-400">No items added yet</p>
              <p className="text-[10px] text-gray-300">Click a product on the left to add</p>
            </div>
          ) : (
            cart.map((item) => {
              const totalItemPrice = item.rateValue * item.qty
              const itemDiscountAmt = (totalItemPrice * item.itemDiscount) / 100
              const finalItemPrice = totalItemPrice - itemDiscountAmt

              return (
                <div
                  key={item.id}
                  className="grid items-center px-3 py-3 hover:bg-gray-50/70 transition-colors border-b border-gray-50"
                  style={{ gridTemplateColumns: "40px 1fr 70px 56px 108px 84px 76px" }}
                >
                  {/* Thumbnail */}
                  <div className="h-9 w-9 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getProductIllustration(item.product, "sm")}
                  </div>

                  {/* Name + remove */}
                  <div className="flex items-center gap-1.5 pr-1.5 min-w-0">
                    <p className="flex-1 truncate font-semibold text-gray-800 text-xs leading-tight">
                      {item.product.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Batch */}
                  <div className="font-mono text-xs text-gray-500 truncate">
                    {item.batch.number}
                  </div>

                  {/* Price */}
                  <div className="text-xs font-semibold text-gray-700">
                    {item.rateValue.toFixed(2)}
                  </div>

                  {/* Discount: type dropdown + value */}
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <select className="appearance-none rounded border border-gray-200 bg-white pl-2 pr-5 py-1 text-xs outline-none focus:border-teal-400 h-7 text-gray-600 cursor-pointer">
                        <option>Flat</option>
                        <option>%</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.itemDiscount}
                      onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                      className="w-9 rounded border border-gray-200 bg-gray-50 px-1 py-1 text-xs text-center outline-none focus:border-teal-400 h-7"
                    />
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-gray-800 tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Sub Total */}
                  <div className="text-right pr-1">
                    <span className="text-xs font-bold text-gray-800 tabular-nums">
                      {finalItemPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400"></span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Thin scroll decoration bar */}
        <div className="flex h-2 flex-shrink-0 items-center border-t border-gray-100 bg-gray-100 px-1">
          <div className="h-1 flex-1 rounded-full overflow-hidden bg-gray-200">
            <div className="h-full w-1/3 rounded-full bg-gray-400 opacity-50" />
          </div>
        </div>

        {/* ── Payment fields ── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-3.5 pb-2.5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">

            {/* ── Left column ── */}
            <div className="space-y-2.5">
              {/* Customer Name */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Cust. Name
                </label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300/20 transition-all"
                />
              </div>

              {/* Customer Phone */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Cust. Phone
                </label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300/20 transition-all"
                />
              </div>

              {/* Receive Amount */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Receive Amount
                </label>
                <input
                  type="number"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-right outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300/20 transition-all"
                />
              </div>

              {/* Change Amount */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Change Amount
                </label>
                <input
                  readOnly
                  value={changeAmount.toFixed(0)}
                  className="flex-1 min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs text-right text-gray-500 outline-none"
                />
              </div>

              {/* Due Amount */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Due Amount
                </label>
                <input
                  readOnly
                  value={dueAmount > 0 ? dueAmount.toFixed(2) : roundedNet.toFixed(2)}
                  className="flex-1 min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs text-right font-semibold text-gray-700 outline-none"
                />
              </div>

              {/* Payment Type */}
              <div className="flex items-center gap-2">
                <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Payment Type
                </label>
                <div className="relative flex-1 min-w-0">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-teal-400 transition-all"
                  >
                    <option>Cash</option>
                    <option>Card / POS</option>
                    <option>UPI / QR</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-2.5">
              {/* Total */}
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black text-gray-800">Total</span>
                <span className="text-base font-black text-gray-800 tabular-nums">
                  {roundedNet.toFixed(2)}
                  <span className="text-xs font-semibold text-gray-500"></span>
                </span>
              </div>

              {/* BIN */}
              <div className="flex items-center gap-1.5">
                <label className="w-9 flex-shrink-0 text-xs font-semibold text-gray-500">BIN</label>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-teal-400">
                    <option>Select</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={binValue}
                  onChange={(e) => setBinValue(Number(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-right outline-none focus:border-teal-400 transition-all"
                />
              </div>

              {/* Discount */}
              <div className="flex items-center gap-1.5">
                <label className="w-9 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Discount
                </label>
                <div className="relative">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")}
                    className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-teal-400"
                  >
                    <option value="percent">Select</option>
                    <option value="flat">Flat</option>
                    <option value="percent">%</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="0"
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))
                  }
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-right outline-none focus:border-teal-400 transition-all"
                />
              </div>

              {/* Delivery Cost */}
              <div className="flex items-center gap-1.5">
                <label className="w-16 flex-shrink-0 text-xs font-semibold text-gray-500">
                  Delivery Cost
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(Math.max(0, Number(e.target.value)))}
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-right outline-none focus:border-teal-400 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>


        </div>

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-3 gap-2.5 border-t border-gray-200 bg-gray-50/80 px-4 py-3 flex-shrink-0">
          <button
            onClick={resetPos}
            disabled={createInvoiceMutation.isPending}
            className="rounded-lg border border-amber-300 bg-white py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors active:scale-95 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={() => handleCompletePayment(false)}
            disabled={cart.length === 0 || createInvoiceMutation.isPending}
            className="rounded-lg border border-teal-300 bg-white py-2.5 text-sm font-bold text-teal-600 hover:bg-teal-50 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createInvoiceMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => handleCompletePayment(true)}
            disabled={cart.length === 0 || createInvoiceMutation.isPending}
            className="rounded-lg border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createInvoiceMutation.isPending ? "Saving..." : "Save & Print"}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════ */}

      <FilterPointofSale
        open={isFilterOpen}
        onClose={setIsFilterOpen}
        initialFilters={posFilters}
        onFilter={setPosFilters}
        manufacturerOptions={manufacturerFilterOptions}
      />

      <ConfigureSaleItemDialog
        open={configModalOpen}
        onClose={setConfigModalOpen}
        product={configProduct}
        batch={configBatch}
        onAdd={handleAddConfiguredToCart}
      />

      {/* Success / Receipt modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md font-sans p-6 rounded-2xl text-center">
          <DialogHeader className="items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2 mx-auto">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <DialogTitle className="text-base font-black tracking-tight text-slate-900 uppercase">
              Transaction Success
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-semibold text-xs">
              Invoice generated and stock updated.
            </DialogDescription>
          </DialogHeader>

          {successInvoiceDetails && (
            <div className="space-y-3 py-2 text-left">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-[10px] font-bold text-gray-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Invoice ID</span>
                  <span className="text-gray-800 font-extrabold">{successInvoiceDetails.id}</span>
                </div>
                {successInvoiceDetails.customerName && (
                  <div className="flex justify-between">
                    <span>Customer Name</span>
                    <span className="text-gray-800 font-extrabold">{successInvoiceDetails.customerName}</span>
                  </div>
                )}
                {successInvoiceDetails.customerPhone && (
                  <div className="flex justify-between">
                    <span>Customer Phone</span>
                    <span className="text-gray-800 font-extrabold">{successInvoiceDetails.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Date &amp; Time</span>
                  <span className="text-gray-800 font-extrabold">{successInvoiceDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode</span>
                  <span className="text-teal-600 font-black uppercase">
                    {successInvoiceDetails.paymentMode}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-1.5 text-[10px] font-bold">
                <div className="flex justify-between text-gray-500">
                  <span>Gross Total</span>
                  <span>₹{successInvoiceDetails.grossTotal.toFixed(2)}</span>
                </div>
                {successInvoiceDetails.overallDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>−₹{successInvoiceDetails.overallDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>GST</span>
                  <span>₹{successInvoiceDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-xs font-black text-gray-800">
                  <span>Net Paid</span>
                  <span className="text-emerald-600 font-mono">
                    ₹{successInvoiceDetails.netPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-4 -mx-6 -mb-6 bg-gray-50 p-4 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={() => toast.success("Printing invoice...")}
              className="flex-1 font-extrabold text-xs uppercase flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={resetPos}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase"
            >
              New Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default POS
