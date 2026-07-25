import { useState, useEffect, useRef } from "react"
import { Plus, Minus, Check, Sparkles, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import { cn } from "@/lib/utils"

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

interface ConfigureSaleItemDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  product: PosProduct | null
  batch?: PosBatch | null
  onAdd: (config: {
    rateType: "mrp" | "rateA" | "rateB" | "rateC"
    sellUnit: "strip" | "piece"
    qty: number
    itemDiscount: number
    batch: PosBatch
  }) => void
}

const getQtyPerStrip = (product: PosProduct) => {
  const isStrip = !product.unit1st || product.unit1st.toLowerCase() === "strip"
  if (!isStrip) {
    if (product.packQty2 && product.packQty2 > 0) return product.packQty2
    if (product.convStri && product.convStri > 0) return product.convStri
    return 10
  }

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
  return 10
}

const getRateValue = (
  batch: PosBatch,
  rateType: "mrp" | "rateA" | "rateB" | "rateC",
  sellUnit: "strip" | "piece",
  qtyPerStrip: number,
  isStrip: boolean
) => {
  let baseRate = 0
  if (rateType === "mrp") baseRate = batch.mrp || batch.price || 0
  else if (rateType === "rateA")
    baseRate = batch.rateA || batch.mrp || batch.price || 0
  else if (rateType === "rateB")
    baseRate = batch.rateB || batch.mrp || batch.price || 0
  else if (rateType === "rateC")
    baseRate = batch.rateC || batch.mrp || batch.price || 0

  if (isStrip) {
    if (sellUnit === "piece" && qtyPerStrip > 0) {
      return baseRate / qtyPerStrip
    }
    return baseRate
  } else {
    if (sellUnit === "strip") {
      return baseRate * qtyPerStrip
    }
    return baseRate
  }
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function ConfigureSaleItemDialog({
  open,
  onClose,
  product,
  batch,
  onAdd,
}: ConfigureSaleItemDialogProps) {
  const [activeBatch, setActiveBatch] = useState<PosBatch | null>(null)
  const [rateType, setRateType] = useState<"mrp" | "rateA" | "rateB" | "rateC">(
    "mrp"
  )
  const [sellUnit, setSellUnit] = useState<"strip" | "piece">("strip")
  const [itemDiscount, setItemDiscount] = useState<number>(0)
  const [qty, setQty] = useState<number>(1)

  const qtyInputRef = useRef<HTMLInputElement>(null)
  const discountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && product) {
      const initialBatch = batch || product.batches[0] || null
      setActiveBatch(initialBatch)
      setRateType("mrp")
      setSellUnit("strip")
      setItemDiscount(0)
      setQty(1)

      // Auto focus & select Qty input for instant hands-free typing
      setTimeout(() => {
        qtyInputRef.current?.focus()
        qtyInputRef.current?.select()
      }, 60)
    }
  }, [open, product, batch])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const lowerKey = key.toLowerCase()

      if (key === "Enter") {
        e.preventDefault()
        if (activeBatch) {
          onAdd({
            rateType,
            sellUnit,
            qty,
            itemDiscount,
            batch: activeBatch,
          })
          onClose(false)
        }
        return
      }

      if (key === "Escape") {
        e.preventDefault()
        onClose(false)
        return
      }

      const activeEl = document.activeElement
      const isTypingQty = activeEl === qtyInputRef.current
      const isTypingDisc = activeEl === discountInputRef.current

      // 1. 'U' key (or Alt+U): Always toggle Unit Type (Strips <-> Pieces) even when focused inside Qty input!
      if (lowerKey === "u" || (e.altKey && lowerKey === "u")) {
        e.preventDefault()
        setSellUnit((prev) => (prev === "strip" ? "piece" : "strip"))
        return
      }

      // 2. Rate switching: F1..F4, Alt+1..4, Ctrl+1..4 (or raw 1..4 when not typing inside input)
      if (
        key === "F1" ||
        (e.altKey && key === "1") ||
        (e.ctrlKey && key === "1") ||
        (key === "1" && !isTypingQty && !isTypingDisc)
      ) {
        e.preventDefault()
        setRateType("mrp")
        return
      }
      if (
        key === "F2" ||
        (e.altKey && key === "2") ||
        (e.ctrlKey && key === "2") ||
        (key === "2" && !isTypingQty && !isTypingDisc)
      ) {
        e.preventDefault()
        setRateType("rateA")
        return
      }
      if (
        key === "F3" ||
        (e.altKey && key === "3") ||
        (e.ctrlKey && key === "3") ||
        (key === "3" && !isTypingQty && !isTypingDisc)
      ) {
        e.preventDefault()
        setRateType("rateB")
        return
      }
      if (
        key === "F4" ||
        (e.altKey && key === "4") ||
        (e.ctrlKey && key === "4") ||
        (key === "4" && !isTypingQty && !isTypingDisc)
      ) {
        e.preventDefault()
        setRateType("rateC")
        return
      }

      // 3. 'Alt+D' or 'D' (when not typing in discount input): Focus Discount
      if (
        (e.altKey && lowerKey === "d") ||
        (lowerKey === "d" && !isTypingDisc)
      ) {
        e.preventDefault()
        discountInputRef.current?.focus()
        discountInputRef.current?.select()
        return
      }

      // 4. 'Alt+Q' or 'Q' (when not typing in qty input): Focus Qty
      if ((e.altKey && lowerKey === "q") || (lowerKey === "q" && !isTypingQty)) {
        e.preventDefault()
        qtyInputRef.current?.focus()
        qtyInputRef.current?.select()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, activeBatch, rateType, sellUnit, qty, itemDiscount, onAdd, onClose])

  if (!product || !activeBatch) return null

  const isStrip = !product.unit1st || product.unit1st.toLowerCase() === "strip"
  const qtyPerStrip = getQtyPerStrip(product)
  const activeRatePrice = getRateValue(
    activeBatch,
    rateType,
    sellUnit,
    qtyPerStrip,
    isStrip
  )

  const totalBeforeDiscount = activeRatePrice * qty
  const discountVal = (totalBeforeDiscount * itemDiscount) / 100
  const taxableVal = totalBeforeDiscount - discountVal
  const cgstRate = toNumber(activeBatch.cgst)
  const sgstRate = toNumber(activeBatch.sgst)
  const taxVal = (taxableVal * (cgstRate + sgstRate)) / 100
  const netVal = taxableVal + taxVal

  const maxStock = isStrip
    ? sellUnit === "strip"
      ? activeBatch.stock
      : activeBatch.stock * qtyPerStrip
    : sellUnit === "strip"
      ? Math.floor(activeBatch.stock / qtyPerStrip)
      : activeBatch.stock

  // Outer unit labels
  const outerUnitSingular = isStrip
    ? "Strip"
    : product.packing
      ? product.packing.charAt(0).toUpperCase() +
        product.packing.slice(1).toLowerCase()
      : "Box"

  const outerUnitPlural = isStrip
    ? "Strips"
    : outerUnitSingular.toLowerCase() === "box"
      ? "Boxes"
      : outerUnitSingular + "s"

  const outerUnitShort = isStrip ? "Strps" : outerUnitPlural

  // Inner unit labels
  const innerUnitSingular = isStrip
    ? "Piece"
    : product.unit1st
      ? product.unit1st.charAt(0).toUpperCase() +
        product.unit1st.slice(1).toLowerCase()
      : "Piece"

  const innerUnitPlural = isStrip
    ? "Pieces"
    : innerUnitSingular.toLowerCase() === "piece"
      ? "Pieces"
      : innerUnitSingular + "s"

  const innerUnitShort = isStrip ? "Pcs" : innerUnitPlural

  const handleAdd = () => {
    onAdd({
      rateType,
      sellUnit,
      qty,
      itemDiscount,
      batch: activeBatch,
    })
    onClose(false)
  }

  const rateOptions = [
    {
      type: "mrp" as const,
      label: "M.R.P.",
      keyNum: "F1 / 1",
      val: activeBatch.mrp || activeBatch.price,
    },
    {
      type: "rateA" as const,
      label: "Rate A",
      keyNum: "F2 / 2",
      val: activeBatch.rateA || activeBatch.mrp || activeBatch.price,
    },
    {
      type: "rateB" as const,
      label: "Rate B",
      keyNum: "F3 / 3",
      val: activeBatch.rateB || activeBatch.mrp || activeBatch.price,
    },
    {
      type: "rateC" as const,
      label: "Rate C",
      keyNum: "F4 / 4",
      val: activeBatch.rateC || activeBatch.mrp || activeBatch.price,
    },
  ]

  const footer = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        variant="outline"
        type="button"
        onClick={() => onClose(false)}
        className="font-bold"
      >
        Cancel <span className="ml-1 font-mono text-[9px] text-muted-foreground">[Esc]</span>
      </Button>
      <Button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 font-bold text-white hover:bg-blue-700"
      >
        Add to Invoice <span className="ml-1 rounded bg-blue-800 px-1 py-0.5 font-mono text-[9px] text-blue-100">[Enter]</span>
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="xl"
      open={open}
      onOpenChange={onClose}
      title="Configure Sale Options"
      description="Adjust prices, sale units, and discount parameters for adding to checkout."
      footer={footer}
      scrollable={true}
    >
      <div className="space-y-3.5 pb-1 text-xs">
        {/* Batch and Expiry Dropdown Selector */}
        <div className="space-y-1.5">
          <span className="block text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-400">
            Select Batch &amp; Expiry Date
          </span>
          <div className="relative">
            <select
              value={activeBatch.id}
              onChange={(e) => {
                const nextBatch =
                  product.batches.find((b) => b.id === e.target.value) || null
                if (nextBatch) {
                  setActiveBatch(nextBatch)
                  const nextMaxStock = isStrip
                    ? sellUnit === "strip"
                      ? nextBatch.stock
                      : nextBatch.stock * qtyPerStrip
                    : sellUnit === "strip"
                      ? Math.floor(nextBatch.stock / qtyPerStrip)
                      : nextBatch.stock
                  setQty((q) => Math.min(q, nextMaxStock))
                }
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-10 text-xs font-semibold text-slate-800 [color-scheme:light] transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:[color-scheme:dark]"
            >
              {product.batches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  disabled={b.stock <= 0}
                  className="bg-background text-foreground disabled:text-muted-foreground"
                >
                  {b.number} (Exp: {b.expiry}){" "}
                  {b.stock <= 0
                    ? "[OUT OF STOCK]"
                    : `— ${isStrip ? `${b.stock} Strips` : `${b.stock} Bottles`}`}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Target batch summary card */}
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-black text-slate-800 dark:text-slate-200">
              {product.name}
            </h4>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase dark:text-blue-400">
              {product.formulation}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {product.composition}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-400 dark:border-slate-800/80">
            <span>
              Batch:{" "}
              <span className="font-black text-slate-700 dark:text-slate-200">
                {activeBatch.number}
              </span>
            </span>
            <span>
              Expiry:{" "}
              <span className="font-black text-slate-700 dark:text-slate-200">
                {activeBatch.expiry}
              </span>
            </span>
            <span>
              Stock:{" "}
              <span className="font-black text-slate-700 dark:text-slate-200">
                {isStrip
                  ? `${activeBatch.stock} ${outerUnitShort} (${activeBatch.stock * qtyPerStrip} ${innerUnitShort})`
                  : `${Math.floor(activeBatch.stock / qtyPerStrip)} ${outerUnitPlural} (${activeBatch.stock} ${innerUnitPlural})`}
              </span>
            </span>
          </div>
        </div>

        {/* Visual rate option cards */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-400">
            <span>Select Rate Option</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">[Press 1, 2, 3 or 4]</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {rateOptions.map((rate) => {
              const isSelected = rateType === rate.type
              const displayPrice = isStrip
                ? rate.val
                : sellUnit === "strip"
                  ? rate.val * qtyPerStrip
                  : rate.val

              const subLabel = isStrip
                ? sellUnit === "piece"
                  ? `₹${(rate.val / qtyPerStrip).toFixed(2)} / ${innerUnitSingular.toLowerCase()}`
                  : null
                : sellUnit === "strip"
                  ? `₹${rate.val.toFixed(2)} / ${innerUnitSingular.toLowerCase()}`
                  : null

              return (
                <button
                  key={rate.type}
                  type="button"
                  onClick={() => setRateType(rate.type)}
                  className={cn(
                    "shadow-3xs relative flex cursor-pointer flex-col items-start rounded-xl border p-2.5 text-left transition-all duration-150",
                    isSelected
                      ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30 dark:border-blue-600 dark:bg-blue-950/20"
                      : "border-slate-200 bg-white hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950"
                  )}
                >
                  <span className="absolute top-1.5 right-1.5 rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    [{rate.keyNum}]
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase pr-5">
                    {rate.label}
                  </span>
                  <span className="mt-0.5 font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                    ₹{displayPrice.toFixed(2)}
                  </span>
                  {subLabel && (
                    <span className="mt-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                      {subLabel}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Visual Sell Unit Selector (Segmented buttons) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-400">
            <span>Select Unit Type</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">[Press U to toggle]</span>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-100/50 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                setSellUnit("strip")
                const nextMaxStock = isStrip
                  ? activeBatch.stock
                  : Math.floor(activeBatch.stock / qtyPerStrip)
                setQty((q) => Math.min(q, nextMaxStock))
              }}
              className={cn(
                "flex-1 cursor-pointer rounded-lg border py-1.5 text-center text-xs font-black transition-all",
                sellUnit === "strip"
                  ? "border-blue-500 bg-white text-slate-900 shadow-2xs dark:border-blue-600 dark:bg-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {outerUnitPlural} (
              {isStrip
                ? activeBatch.stock
                : Math.floor(activeBatch.stock / qtyPerStrip)}{" "}
              Available)
            </button>
            <button
              type="button"
              disabled={qtyPerStrip <= 1}
              onClick={() => {
                setSellUnit("piece")
                const nextMaxStock = isStrip
                  ? activeBatch.stock * qtyPerStrip
                  : activeBatch.stock
                setQty((q) => Math.min(q, nextMaxStock))
              }}
              className={cn(
                "flex-1 cursor-pointer rounded-lg border py-1.5 text-center text-xs font-black transition-all disabled:opacity-40",
                sellUnit === "piece"
                  ? "border-blue-500 bg-white text-slate-900 shadow-2xs dark:border-blue-600 dark:bg-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {innerUnitPlural} (
              {isStrip ? activeBatch.stock * qtyPerStrip : activeBatch.stock}{" "}
              Available)
            </button>
          </div>
        </div>

        {/* Quantity and Discount row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantity selector */}
          <div className="space-y-1.5">
            <span className="block text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-400">
              Sales Quantity <span className="font-mono text-blue-600 dark:text-blue-400">[Auto-focused]</span>
            </span>
            <div className="flex h-[38px] w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                ref={qtyInputRef}
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10) || 1
                  setQty(Math.min(maxStock, Math.max(1, parsed)))
                }}
                className="w-full bg-transparent text-center text-xs font-black text-slate-800 outline-none dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                className="px-3 py-1.5 text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Discount Percentage input */}
          <div className="space-y-1.5">
            <span className="block text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-400">
              Item Discount <span className="font-mono text-blue-600 dark:text-blue-400">[Press D]</span>
            </span>
            <div className="flex h-[38px] w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950">
              <input
                ref={discountInputRef}
                type="number"
                min="0"
                max="100"
                value={itemDiscount}
                onChange={(e) =>
                  setItemDiscount(
                    Math.min(100, Math.max(0, Number(e.target.value)))
                  )
                }
                className="w-full bg-transparent px-3 text-right text-xs font-black text-slate-800 outline-none dark:text-slate-100"
                placeholder="0"
              />
              <span className="flex h-full items-center border-l border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Subtotal cost estimation panel */}
        <div className="space-y-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <h5 className="text-[9px] font-bold tracking-widest uppercase">
              Cost Summary Preview
            </h5>
          </div>
          <div className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Base Value</span>
              <span className="text-slate-900 dark:text-slate-100">
                ₹{totalBeforeDiscount.toFixed(2)}
              </span>
            </div>
            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({itemDiscount}%)</span>
                <span className="font-bold">-₹{discountVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>GST Tax ({cgstRate + sgstRate}%)</span>
              <span className="text-slate-700 dark:text-slate-300">
                ₹{taxVal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:border-slate-800/80 dark:text-slate-100">
              <span>Total Net</span>
              <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">
                ₹{netVal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  )
}
