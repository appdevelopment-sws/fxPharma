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
  Pause,
} from "lucide-react"
import { toast } from "sonner"

import FilterPointofSale from "@/components/dialog/admin/FilterPointofSale"
import ConfigureSaleItemDialog from "@/components/dialog/admin/ConfigureSaleItemDialog"
import HeldBillsDialog from "@/components/dialog/admin/HeldBillsDialog"
import { cn, getImageUrl } from "@/lib/utils"
import { queryKeys } from "@/lib/queryKeys"
import { useSettings } from "@/context/settingsContext"
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
  imageUrl?: string | null
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

type HeldBill = {
  id: string
  holdAt: string
  customerName: string
  customerPhone: string
  cart: CartItem[]
  discountPercent: number
  discountType: "flat" | "percent"
  paymentMode: string
  splitCashAmount?: string
  splitOnlineAmount?: string
  deliveryCost: number
  binValue: number
  totalAmount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_YEAR_PATTERN = /^(0[1-9]|1[0-2])\/(\d{4})$/

const parseExpiryValue = (value?: string | null) => {
  if (!value) return null

  const trimmed = value.trim()
  const monthYearMatch = trimmed.match(MONTH_YEAR_PATTERN)
  if (monthYearMatch) {
    const month = Number(monthYearMatch[1])
    const year = Number(monthYearMatch[2])
    return new Date(year, month, 0)
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatExpiry = (value?: string | null) => {
  if (!value) return "-"
  const trimmed = value.trim()
  const monthYearMatch = trimmed.match(MONTH_YEAR_PATTERN)
  if (monthYearMatch) {
    return `${monthYearMatch[1]}/${monthYearMatch[2]}`
  }

  const parsed = parseExpiryValue(trimmed)
  if (!parsed) return value
  return parsed.toLocaleDateString("en-IN", {
    month: "2-digit",
    year: "numeric",
  })
}

const isNearExpiry = (value?: string | null) => {
  if (!value) return false
  const parsed = parseExpiryValue(value)
  if (!parsed) return false
  return (
    (parsed.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 180
  )
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getRelationName = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number")
    return String(value) || "-"
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === "string" || typeof name === "number")
      return String(name) || "-"
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
      const purchaseRate = toNumber(
        batch.purchaseRate ?? batch.purchase_rate ?? 0
      )
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
        cgst: toNumber(inventoryItem?.cgst ?? 0),
        sgst: toNumber(inventoryItem?.sgst ?? 0),
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
    imageUrl: inventoryItem.imageUrl || null,
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
  const matches = packingStr.match(
    /(\d+)\s*(tablet|capsule|piece|tab|cap|'s|s)/
  )
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
  else if (rateType === "rateA")
    baseRate = batch.rateA || batch.mrp || batch.price || 0
  else if (rateType === "rateB")
    baseRate = batch.rateB || batch.mrp || batch.price || 0
  else if (rateType === "rateC")
    baseRate = batch.rateC || batch.mrp || batch.price || 0
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

const getProductIllustration = (
  product: PosProduct,
  size: "sm" | "md" = "md"
) => {
  const name = product.name.toLowerCase()
  const form = (product.formulation || "").toLowerCase()
  const grad = getProductGradient(product.id)
  const svgClass = size === "sm" ? "w-7 h-7" : "w-14 h-14"
  const wrapClass = size === "sm" ? "h-8 w-8" : "h-full w-full"

  if (product.imageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded",
          wrapClass,
          grad.bg
        )}
      >
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className={cn(
            "object-contain",
            size === "sm" ? "h-7 w-7" : "h-14 w-14"
          )}
        />
      </div>
    )
  }

  const wrap = (child: React.ReactNode) => (
    <div
      className={cn(
        "flex items-center justify-center rounded",
        wrapClass,
        grad.bg
      )}
    >
      {child}
    </div>
  )

  if (
    name.includes("elvive") ||
    name.includes("shampoo") ||
    name.includes("body wash")
  ) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient
            id={`sg-${product.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <path d="M26 12h12v4H26z" fill="#94a3b8" />
        <path d="M22 16h20v6H22z" fill="#64748b" />
        <rect
          x="18"
          y="22"
          width="28"
          height="34"
          rx="6"
          fill={`url(#sg-${product.id})`}
        />
        <rect
          x="22"
          y="30"
          width="20"
          height="16"
          rx="2"
          fill="white"
          opacity="0.8"
        />
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
          <linearGradient
            id={`bg-${product.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <rect
          x="8"
          y="12"
          width="22"
          height="42"
          rx="2"
          fill={`url(#bg-${product.id})`}
        />
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
          <linearGradient
            id={`tg-${product.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <path
          d="M12 48 L22 14 C23 11 27 11 28 14 L38 48 Z"
          fill={`url(#tg-${product.id})`}
        />
        <rect x="10" y="48" width="30" height="4" fill="#475569" />
        <rect x="22" y="10" width="6" height="4" fill="#94a3b8" />
        <rect
          x="19"
          y="30"
          width="12"
          height="8"
          transform="rotate(-15 19 30)"
          fill="white"
          opacity="0.8"
        />
      </svg>
    )
  }

  if (
    name.includes("avaspray") ||
    name.includes("spray") ||
    name.includes("inhaler")
  ) {
    return wrap(
      <svg viewBox="0 0 64 64" className={svgClass} fill="none">
        <defs>
          <linearGradient
            id={`spg-${product.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <rect
          x="20"
          y="24"
          width="24"
          height="32"
          rx="4"
          fill={`url(#spg-${product.id})`}
        />
        <path d="M28 12h8v12h-8z" fill="#94a3b8" />
        <path d="M36 14h6v4h-6z" fill="#475569" />
        <circle cx="40" cy="16" r="1.5" fill="#f43f5e" />
        <rect
          x="25"
          y="32"
          width="14"
          height="12"
          rx="1"
          fill="white"
          opacity="0.8"
        />
      </svg>
    )
  }

  // Generic medicine box (default)
  return wrap(
    <svg viewBox="0 0 64 64" className={svgClass} fill="none">
      <defs>
        <linearGradient
          id={`bxg-${product.id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
      </defs>
      <rect
        x="10"
        y="16"
        width="44"
        height="32"
        rx="4"
        fill={`url(#bxg-${product.id})`}
      />
      <rect x="14" y="22" width="36" height="8" fill="white" opacity="0.8" />
      <circle cx="20" cy="38" r="4" fill="white" opacity="0.5" />
      <circle cx="28" cy="38" r="4" fill="white" opacity="0.5" />
      <line
        x1="36"
        y1="38"
        x2="48"
        y2="38"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="36"
        y1="42"
        x2="44"
        y2="42"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
      />
    </svg>
  )
}

// ─── POS Component ────────────────────────────────────────────────────────────

const POS = () => {
  const { settings } = useSettings()
  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Held bills state
  const [heldBillsModalOpen, setHeldBillsModalOpen] = useState(false)
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pos_held_bills")
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    }
    return []
  })

  // Synchronize held bills with local storage
  useEffect(() => {
    try {
      localStorage.setItem("pos_held_bills", JSON.stringify(heldBills))
    } catch (e) {
      console.error("Failed to save held bills", e)
    }
  }, [heldBills])

  // Search / filter
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [manufacturer, setManufacturer] = useState("All Manufacturers")

  // Selected card highlight
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )

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
  const [discountType, setDiscountType] = useState<"flat" | "percent">(
    "percent"
  )
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [splitCashAmount, setSplitCashAmount] = useState("")
  const [splitOnlineAmount, setSplitOnlineAmount] = useState("")
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
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
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
        id: responseData.id,
        invoiceId: responseData.invoice_id,
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
        cashAmount: responseData.cash_amount,
        onlineAmount: responseData.online_amount,
        date: new Date(responseData.createdAt).toLocaleString("en-IN"),
      })
      setSuccessModalOpen(true)
      toast.success("Invoice saved and stock updated!")
    },
    onError: (error: any) => {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save invoice."
      toast.error(errMsg)
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories.list({ limit: 20 }),
    queryFn: () => CategoryApi.getCategories({ limit: 20 }),
  })

  const { data: manufacturersData } = useQuery({
    queryKey: queryKeys.manufacturers.list({ limit: 20 }),
    queryFn: () => ManufacturerApi.getManufacturers({ limit: 20 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.inventory.list({ limit: 20 }),
    queryFn: () => InventoryApi.getAll({ limit: 20 }),
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
        !product.category.toLowerCase().includes(search) &&
        !product.batches.some((batch) =>
          batch.number.toLowerCase().includes(search)
        )
      )
        return false

      if (category !== "All Categories" && product.category !== category)
        return false
      if (manufacturer !== "All Manufacturers" && product.mfg !== manufacturer)
        return false

      if (posFilters.stockStatus !== "all") {
        if (posFilters.stockStatus === "in_stock" && product.totalStock <= 0)
          return false
        if (posFilters.stockStatus === "out_of_stock" && product.totalStock > 0)
          return false
        if (
          posFilters.stockStatus === "low_stock" &&
          (product.totalStock <= 0 || product.totalStock > 50)
        )
          return false
      }

      if (posFilters.itemType !== "all") {
        const t = product.type.toLowerCase()
        if (posFilters.itemType === "rx" && !t.includes("rx")) return false
        if (posFilters.itemType === "otc" && !t.includes("otc")) return false
        if (posFilters.itemType === "generics" && t.includes("rx")) return false
      }

      if (
        posFilters.formulation.length > 0 &&
        !posFilters.formulation.includes(product.formulation)
      )
        return false
      if (
        posFilters.manufacturers.length > 0 &&
        !posFilters.manufacturers.includes(product.mfg)
      )
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
    const maxStock =
      config.sellUnit === "strip" ? b.stock : b.stock * qtyPerStrip

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

    const rateVal = getRateValue(
      b,
      config.rateType,
      config.sellUnit,
      qtyPerStrip
    )
    const cartItemId = `${b.id}-${config.sellUnit}-${config.rateType}`

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId)
      if (existingIdx > -1) {
        const existing = prev[existingIdx]
        const newQty = Math.min(existing.qty + config.qty, maxStock)
        const updated = [...prev]
        updated[existingIdx] = {
          ...existing,
          qty: newQty,
          itemDiscount: config.itemDiscount,
        }
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
          item.sellUnit === "strip"
            ? item.batch.stock
            : item.batch.stock * qtyPerStrip
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
        item.id !== cartItemId
          ? item
          : { ...item, itemDiscount: Math.min(100, Math.max(0, disc)) }
      )
    )
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const grossTotal = cart.reduce(
    (sum, item) => sum + item.rateValue * item.qty,
    0
  )

  const totalItemDiscountAmount = cart.reduce(
    (sum, item) => sum + (item.rateValue * item.qty * item.itemDiscount) / 100,
    0
  )

  const totalTaxAmount = cart.reduce((sum, item) => {
    const itemTaxable =
      item.rateValue * item.qty * (1 - item.itemDiscount / 100)
    return (
      sum +
      (itemTaxable * (toNumber(item.batch.cgst) + toNumber(item.batch.sgst))) /
      100
    )
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
  const changeAmount =
    tenderedAmount > roundedNet ? tenderedAmount - roundedNet : 0
  const dueAmount =
    tenderedAmount < roundedNet ? roundedNet - tenderedAmount : 0

  // Pre-populate split amounts when entering split payment mode
  useEffect(() => {
    if (paymentMode === "Split Payment") {
      if (!splitCashAmount && !splitOnlineAmount) {
        setSplitCashAmount("0")
        setSplitOnlineAmount(roundedNet.toString())
      }
    }
  }, [paymentMode])

  // Adjust split amounts dynamically if the bill total changes
  useEffect(() => {
    if (paymentMode === "Split Payment") {
      const cash = parseFloat(splitCashAmount) || 0
      setSplitOnlineAmount(Math.max(0, roundedNet - cash).toString())
    }
  }, [roundedNet])

  // ── Payment ───────────────────────────────────────────────────────────────

  const handlePrint = async (invoiceId: string) => {
    try {
      const activeTemplate = settings.invoice_template_name || settings.invoice_template || "template1"
      await InvoiceApi.openInvoiceHtml(invoiceId, activeTemplate, true)
    } catch (error) {
      toast.error("Failed to print invoice.")
      console.error(error)
    }
  }

  const handleCompletePayment = (printOnSuccess = false) => {
    if (cart.length === 0) return

    if (paymentMode === "Split Payment") {
      const cash = parseFloat(splitCashAmount) || 0
      const online = parseFloat(splitOnlineAmount) || 0
      if (Math.abs(cash + online - roundedNet) > 0.01) {
        toast.error(
          `Split amounts (Cash: ₹${cash.toFixed(2)}, Online: ₹${online.toFixed(2)}) must sum up to the total net payable: ₹${roundedNet.toFixed(2)}`
        )
        return
      }
    }

    const payload = {
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      paymentMode:
        paymentMode === "Cash"
          ? "CASH"
          : paymentMode === "UPI / QR"
            ? "UPI"
            : paymentMode === "Card / POS"
              ? "CARD"
              : "SPLIT",
      cashAmount:
        paymentMode === "Split Payment"
          ? parseFloat(splitCashAmount) || 0
          : paymentMode === "Cash"
            ? roundedNet
            : 0,
      onlineAmount:
        paymentMode === "Split Payment"
          ? parseFloat(splitOnlineAmount) || 0
          : paymentMode !== "Cash"
            ? roundedNet
            : 0,
      grossAmount: grossTotal,
      discountAmount: discountAmount,
      taxAmount: totalTaxAmount,
      deliveryCost: deliveryCost,
      totalAmount: roundedNet,
      tenderedAmount: tenderedAmount || roundedNet,
      changeAmount: changeAmount,
      items: cart.map((item) => {
        const subTotal =
          item.rateValue * item.qty -
          (item.rateValue * item.qty * item.itemDiscount) / 100
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
      onSuccess: (response) => {
        if (printOnSuccess && response?.data?.id) {
          handlePrint(response.data.id)
        }
      },
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
    setSplitCashAmount("")
    setSplitOnlineAmount("")
    setDeliveryCost(0)
    setBinValue(0)
    setSelectedProductId(null)
    setSuccessModalOpen(false)
    setSuccessInvoiceDetails(null)
  }

  const handleHoldBill = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty! Cannot hold an empty bill.")
      return
    }
    const newHeldBill: HeldBill = {
      id: `hold-${Date.now()}`,
      holdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      cart,
      discountPercent,
      discountType,
      paymentMode,
      splitCashAmount:
        paymentMode === "Split Payment" ? splitCashAmount : undefined,
      splitOnlineAmount:
        paymentMode === "Split Payment" ? splitOnlineAmount : undefined,
      deliveryCost,
      binValue,
      totalAmount: roundedNet,
    }
    setHeldBills((prev) => [newHeldBill, ...prev])
    toast.success("Bill placed on hold.")
    resetPos()
  }

  const handleRestoreBill = (bill: HeldBill) => {
    if (cart.length > 0) {
      const confirmRestore = window.confirm(
        "You have items in your current cart. Restoring this bill will overwrite the current cart. Do you want to proceed?"
      )
      if (!confirmRestore) return
    }
    setCart(bill.cart)
    setCustomerName(bill.customerName)
    setCustomerPhone(bill.customerPhone)
    setDiscountPercent(bill.discountPercent)
    setDiscountType(bill.discountType)
    setPaymentMode(bill.paymentMode)
    setSplitCashAmount(bill.splitCashAmount || "")
    setSplitOnlineAmount(bill.splitOnlineAmount || "")
    setDeliveryCost(bill.deliveryCost)
    setBinValue(bill.binValue)
    setReceiveAmount("")

    // Remove from held bills list
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id))
    setHeldBillsModalOpen(false)
    toast.success("Bill restored.")
  }

  const handleDeleteHeldBill = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this held bill?"
    )
    if (!confirmDelete) return
    setHeldBills((prev) => prev.filter((b) => b.id !== id))
    toast.success("Held bill deleted.")
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40 font-sans text-foreground select-none">
      {/* ══════════════════════════════════════════════
          LEFT PANEL — Product Catalog
      ══════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top bar: search + filters ── */}
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border bg-card px-4 py-3 shadow-sm">
          {/* Search */}
          <div className="relative max-w-72 min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search / Scan medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/40 py-2 pr-9 pl-9 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus:border-teal-400 focus:ring-1 focus:ring-teal-300/30"
            />
            <ScanLine className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-300" />
          </div>

          {/* Held Bills Button */}
          <button
            type="button"
            onClick={() => setHeldBillsModalOpen(true)}
            className="relative flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60 active:scale-95"
          >
            <Pause className="h-3.5 w-3.5 text-blue-500" />
            <span>Held Bills</span>
            {heldBills.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-sm">
                {heldBills.length}
              </span>
            )}
          </button>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60 active:scale-95"
          >
            <Filter className="h-3.5 w-3.5 text-teal-500" />
            Filter
          </button>

          {/* Spacer + count */}
          <span className="ml-auto hidden text-xs font-semibold whitespace-nowrap text-muted-foreground sm:block">
            {filteredProducts.length} items
          </span>

          {/* Clock */}
          <div className="hidden items-center gap-1 text-xs font-bold text-muted-foreground lg:flex">
            <Clock className="h-3.5 w-3.5" />
            {liveTime}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-muted/20 p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/40">
              <Pill className="h-12 w-12 animate-bounce" />
              <p className="text-sm font-semibold">No products found.</p>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              }}
            >
              {filteredProducts.map((product) => {
                const firstBatch = product.batches[0] || null
                const basePrice = firstBatch
                  ? firstBatch.mrp || firstBatch.price || 0
                  : 0
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
                      "relative flex cursor-pointer flex-col items-center rounded-lg border bg-card p-2.5 text-left transition-all duration-150 hover:shadow-md active:scale-[0.97]",
                      isSelected
                        ? "border-teal-500 bg-teal-500/5 shadow-sm ring-1 ring-teal-400/40"
                        : isOutOfStock
                          ? "cursor-not-allowed border-border opacity-50"
                          : "border-border hover:border-teal-300"
                    )}
                  >
                    {/* Illustration */}
                    <div className="mb-2.5 flex h-[100px] w-full items-center justify-center overflow-hidden rounded-md bg-muted/40">
                      {getProductIllustration(product, "md")}
                    </div>

                    {/* Name */}
                    <p className="line-clamp-2 w-full text-center text-xs leading-tight font-semibold text-foreground">
                      {product.name}
                    </p>

                    {/* Price */}
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      {basePrice > 0 ? `${basePrice.toFixed(2)}` : "0"}
                      <span className="text-[10px] font-semibold text-muted-foreground/60"></span>
                    </p>

                    {/* Out of stock badge */}
                    {isOutOfStock && (
                      <span className="absolute top-1.5 right-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
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
                  className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 p-2.5 opacity-40"
                >
                  <div className="mb-2.5 flex h-[100px] w-full items-center justify-center rounded-md bg-muted/40">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground/30">
                    —
                  </p>
                  <p className="text-xs text-muted-foreground/20">---</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Invoice
      ══════════════════════════════════════════════ */}
      <div className="flex w-[540px] flex-shrink-0 flex-col border-l border-border bg-card shadow-xl xl:w-[600px]">
        {/* ── Table header ── */}
        <div
          className="grid flex-shrink-0 items-center border-b border-border bg-muted/40 px-3 py-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase"
          style={{ gridTemplateColumns: "52px 1fr 70px 56px 108px 84px 76px" }}
        >
          <span>Image</span>
          <span>Items</span>
          <span>Batch</span>
          <span>Price</span>
          <span>Discount</span>
          <span className="text-center">Qty</span>
          <span className="pr-1 text-right">Sub Total</span>
        </div>

        {/* ── Cart rows ── */}
        <div className="custom-scrollbar flex-1 divide-y divide-border/40 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground/30">
              <ShoppingCart className="h-10 w-10" />
              <p className="text-xs font-semibold text-muted-foreground/50">
                No items added yet
              </p>
              <p className="text-[10px] text-muted-foreground/30">
                Click a product on the left to add
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const totalItemPrice = item.rateValue * item.qty
              const itemDiscountAmt = (totalItemPrice * item.itemDiscount) / 100
              const finalItemPrice = totalItemPrice - itemDiscountAmt

              return (
                <div
                  key={item.id}
                  className="grid items-center border-b border-border/30 px-3 py-3 transition-colors hover:bg-muted/30"
                  style={{
                    gridTemplateColumns: "52px 1fr 70px 56px 108px 84px 76px",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/60">
                    {getProductIllustration(item.product, "sm")}
                  </div>

                  {/* Name + remove */}
                  <div className="flex min-w-0 items-center gap-1.5 pr-1.5">
                    <p className="flex-1 truncate text-xs leading-tight font-semibold text-foreground">
                      {item.product.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Batch */}
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {item.batch.number}
                  </div>

                  {/* Price */}
                  <div className="text-xs font-semibold text-foreground">
                    {item.rateValue.toFixed(2)}
                  </div>

                  {/* Discount: type dropdown + value */}
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <select className="h-7 cursor-pointer appearance-none rounded border border-border bg-background py-1 pr-5 pl-2 text-xs text-foreground outline-none focus:border-teal-400">
                        <option>Flat</option>
                        <option>%</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-1 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.itemDiscount}
                      onChange={(e) =>
                        updateItemDiscount(item.id, Number(e.target.value))
                      }
                      className="h-7 w-9 rounded border border-border bg-muted/40 px-1 py-1 text-center text-xs text-foreground outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/70"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-foreground tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/70"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Sub Total */}
                  <div className="pr-1 text-right">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {finalItemPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground/50"></span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Payment fields ── */}
        <div className="flex-shrink-0 border-t border-border bg-card px-4 pt-3.5 pb-2.5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">

            {/* ── Left column: Customer & Payment Details ── */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Customer & Payment Info
              </div>

              {/* Customer Name */}
              <div className="flex items-center gap-2">
                <label className="w-24 flex-shrink-0 text-xs font-semibold text-muted-foreground">
                  Cust. Name
                </label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-300/20 transition-all"
                />
              </div>

              {/* Customer Phone */}
              <div className="flex items-center gap-2">
                <label className="w-24 flex-shrink-0 text-xs font-semibold text-muted-foreground">
                  Cust. Phone
                </label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-300/20 transition-all"
                />
              </div>

              {/* Payment Type */}
              <div className="flex items-center gap-2">
                <label className="w-24 flex-shrink-0 text-xs font-semibold text-muted-foreground">
                  Payment Type
                </label>
                <div className="relative min-w-0 flex-1">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pl-2.5 pr-7 text-xs text-foreground outline-none focus:border-teal-500 transition-all cursor-pointer"
                  >
                    <option>Cash</option>
                    <option>Card / POS</option>
                    <option>UPI / QR</option>
                    <option>Split Payment</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Split Payment Amounts */}
              {paymentMode === "Split Payment" && (
                <div className="space-y-2 rounded-lg border border-teal-200/50 bg-teal-500/5 p-2 transition-all">
                  <div className="flex items-center gap-2">
                    <label className="w-20 flex-shrink-0 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                      Cash Amt
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={splitCashAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        setSplitCashAmount(val)
                        const cashNum = parseFloat(val) || 0
                        setSplitOnlineAmount(
                          Math.max(0, roundedNet - cashNum).toString()
                        )
                      }}
                      className="flex-1 min-w-0 rounded border border-teal-200/30 bg-background px-2.5 py-1 text-xs text-right outline-none focus:border-teal-500 transition-all font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-20 flex-shrink-0 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                      Online Amt
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={splitOnlineAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        setSplitOnlineAmount(val)
                        const onlineNum = parseFloat(val) || 0
                        setSplitCashAmount(
                          Math.max(0, roundedNet - onlineNum).toString()
                        )
                      }}
                      className="flex-1 min-w-0 rounded border border-teal-200/30 bg-background px-2.5 py-1 text-xs text-right outline-none focus:border-teal-500 transition-all font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column: Totals & Payments Summary ── */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pb-0.5">
                  Billing Summary
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-sm font-semibold text-muted-foreground">Total Payable</span>
                  <span className="text-xl font-extrabold text-foreground tabular-nums">
                    ₹{roundedNet.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Discount
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")}
                        className="appearance-none rounded-lg border border-border bg-background py-1 pl-2 pr-6 text-xs text-foreground outline-none focus:border-teal-500 h-7 cursor-pointer"
                      >
                        <option value="percent">Select</option>
                        <option value="flat">Flat</option>
                        <option value="percent">%</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={discountPercent}
                      onChange={(e) =>
                        setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs text-right text-foreground outline-none focus:border-teal-500 transition-all h-7"
                    />
                  </div>
                </div>

                {/* Due Amount */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground">Due Amount</span>
                  <input
                    readOnly
                    value={dueAmount > 0 ? dueAmount.toFixed(2) : "0.00"}
                    className="w-24 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-right font-bold text-rose-500 outline-none h-7"
                  />
                </div>

                {/* Final Amount (Tendered/Received) */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/50">
                  <label className="text-xs font-bold text-foreground">
                    Final Amount
                  </label>
                  <input
                    type="number"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-right font-bold text-foreground outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-300/20 transition-all h-7"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ── Action buttons ── */}
        <div className="grid flex-shrink-0 grid-cols-4 gap-2 border-t border-border bg-muted/30 px-4 py-3">
          <button
            onClick={resetPos}
            disabled={createInvoiceMutation.isPending}
            className="rounded-lg bg-amber-500 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-600 active:scale-95 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleHoldBill}
            disabled={cart.length === 0 || createInvoiceMutation.isPending}
            className="rounded-lg bg-blue-500 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hold
          </button>
          <button
            onClick={() => handleCompletePayment(false)}
            disabled={cart.length === 0 || createInvoiceMutation.isPending}
            className="rounded-lg bg-teal-500 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {createInvoiceMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => handleCompletePayment(true)}
            disabled={cart.length === 0 || createInvoiceMutation.isPending}
            className="rounded-lg bg-teal-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
        <DialogContent className="rounded-2xl bg-card p-6 text-center font-sans sm:max-w-md">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <DialogTitle className="text-base font-black tracking-tight text-foreground uppercase">
              Transaction Success
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-muted-foreground">
              Invoice generated and stock updated.
            </DialogDescription>
          </DialogHeader>

          {successInvoiceDetails && (
            <div className="space-y-3 py-2 text-left">
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-4 text-[10px] font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>Invoice ID</span>
                  <span className="font-extrabold text-foreground">
                    {successInvoiceDetails.invoiceId || successInvoiceDetails.id}
                  </span>
                </div>
                {successInvoiceDetails.customerName && (
                  <div className="flex justify-between">
                    <span>Customer Name</span>
                    <span className="font-extrabold text-foreground">
                      {successInvoiceDetails.customerName}
                    </span>
                  </div>
                )}
                {successInvoiceDetails.customerPhone && (
                  <div className="flex justify-between">
                    <span>Customer Phone</span>
                    <span className="font-extrabold text-foreground">
                      {successInvoiceDetails.customerPhone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Date &amp; Time</span>
                  <span className="font-extrabold text-foreground">
                    {successInvoiceDetails.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode</span>
                  <span className="font-black text-teal-600 uppercase">
                    {successInvoiceDetails.paymentMode === "SPLIT" ? (
                      <span>
                        Split (Cash: ₹
                        {successInvoiceDetails.cashAmount?.toFixed(2) ?? "0.00"}
                        , Online: ₹
                        {successInvoiceDetails.onlineAmount?.toFixed(2) ??
                          "0.00"}
                        )
                      </span>
                    ) : (
                      successInvoiceDetails.paymentMode
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl border border-border bg-card p-4 text-[10px] font-bold">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Total</span>
                  <span>₹{successInvoiceDetails.grossTotal.toFixed(2)}</span>
                </div>
                {successInvoiceDetails.overallDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>
                      −₹{successInvoiceDetails.overallDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST</span>
                  <span>₹{successInvoiceDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-xs font-black text-foreground">
                  <span>Net Paid</span>
                  <span className="font-mono text-emerald-600">
                    ₹{successInvoiceDetails.netPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="-mx-6 -mb-6 gap-2 rounded-b-2xl border-t bg-muted/40 p-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (successInvoiceDetails?.id) {
                  handlePrint(successInvoiceDetails.id)
                }
              }}
              className="flex flex-1 items-center justify-center gap-1.5 text-xs font-extrabold uppercase"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={resetPos}
              className="flex-1 bg-emerald-600 text-xs font-extrabold text-white uppercase hover:bg-emerald-700"
            >
              New Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HeldBillsDialog
        open={heldBillsModalOpen}
        onClose={setHeldBillsModalOpen}
        heldBills={heldBills}
        onRestore={handleRestoreBill}
        onDelete={handleDeleteHeldBill}
      />
    </div>
  )
}

export default POS