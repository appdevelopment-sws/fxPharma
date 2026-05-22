import { useState, useEffect } from "react"
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

  if (sellUnit === "piece" && qtyPerStrip > 0) {
    return baseRate / qtyPerStrip
  }
  return baseRate
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
  const [rateType, setRateType] = useState<"mrp" | "rateA" | "rateB" | "rateC">("mrp")
  const [sellUnit, setSellUnit] = useState<"strip" | "piece">("strip")
  const [itemDiscount, setItemDiscount] = useState<number>(0)
  const [qty, setQty] = useState<number>(1)

  useEffect(() => {
    if (open && product) {
      const initialBatch = batch || product.batches[0] || null
      setActiveBatch(initialBatch)
      setRateType("mrp")
      setSellUnit("strip")
      setItemDiscount(0)
      setQty(1)
    }
  }, [open, product, batch])

  if (!product || !activeBatch) return null

  const qtyPerStrip = getQtyPerStrip(product)
  const activeRatePrice = getRateValue(activeBatch, rateType, sellUnit, qtyPerStrip)

  const totalBeforeDiscount = activeRatePrice * qty
  const discountVal = (totalBeforeDiscount * itemDiscount) / 100
  const taxableVal = totalBeforeDiscount - discountVal
  const cgstRate = toNumber(activeBatch.cgst)
  const sgstRate = toNumber(activeBatch.sgst)
  const taxVal = (taxableVal * (cgstRate + sgstRate)) / 100
  const netVal = taxableVal + taxVal

  const maxStock = sellUnit === "strip" ? activeBatch.stock : activeBatch.stock * qtyPerStrip

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
    { type: "mrp" as const, label: "M.R.P.", val: activeBatch.mrp || activeBatch.price },
    { type: "rateA" as const, label: "Rate A", val: activeBatch.rateA || activeBatch.mrp || activeBatch.price },
    { type: "rateB" as const, label: "Rate B", val: activeBatch.rateB || activeBatch.mrp || activeBatch.price },
    { type: "rateC" as const, label: "Rate C", val: activeBatch.rateC || activeBatch.mrp || activeBatch.price },
  ]

  const footer = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        variant="outline"
        type="button"
        onClick={() => onClose(false)}
        className="font-bold"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
      >
        Add to Invoice
      </Button>
    </div>
  )

  return (
    <FormContainer
      variant="modal"
      size="md"
      open={open}
      onOpenChange={onClose}
      title="Configure Sale Options"
      description="Adjust prices, sale units, and discount parameters for adding to checkout."
      footer={footer}
      scrollable={true}
    >
      <div className="space-y-5 pb-2 text-xs">
        {/* Batch and Expiry Dropdown Selector */}
        <div className="space-y-2">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
            Select Batch & Expiry Date
          </span>
          <div className="relative">
            <select
              value={activeBatch.id}
              onChange={(e) => {
                const nextBatch = product.batches.find((b) => b.id === e.target.value) || null
                if (nextBatch) {
                  setActiveBatch(nextBatch)
                  const maxStock = sellUnit === "strip" ? nextBatch.stock : nextBatch.stock * qtyPerStrip
                  setQty((q) => Math.min(q, maxStock))
                }
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-955 px-3.5 py-2.5 pr-10 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-100"
            >
              {product.batches.map((b) => (
                <option key={b.id} value={b.id} disabled={b.stock <= 0}>
                  {b.number} (Exp: {b.expiry}) {b.stock <= 0 ? "[OUT OF STOCK]" : `— ${b.stock} Strips`}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3.5 right-3.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Target batch summary card */}
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-200">
              {product.name}
            </h4>
            <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase">
              {product.formulation}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
            {product.composition}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <span>
              Batch: <span className="text-slate-700 dark:text-slate-200 font-black">{activeBatch.number}</span>
            </span>
            <span>
              Expiry: <span className="text-slate-700 dark:text-slate-200 font-black">{activeBatch.expiry}</span>
            </span>
            <span>
              Stock: <span className="text-slate-750 dark:text-slate-200 font-black">{activeBatch.stock} Strps ({activeBatch.stock * qtyPerStrip} Pcs)</span>
            </span>
          </div>
        </div>

        {/* Visual rate option cards */}
        <div className="space-y-2">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
            Select Rate Option
          </span>
          <div className="grid grid-cols-2 gap-3">
            {rateOptions.map((rate) => {
              const isSelected = rateType === rate.type
              const unitPrice = sellUnit === "piece" ? rate.val / qtyPerStrip : rate.val
              return (
                <button
                  key={rate.type}
                  type="button"
                  onClick={() => setRateType(rate.type)}
                  className={cn(
                    "relative flex flex-col items-start p-3 rounded-xl border transition-all text-left duration-150 cursor-pointer shadow-3xs",
                    isSelected
                      ? "border-blue-500 bg-blue-500/5 dark:border-blue-600 dark:bg-blue-950/20 ring-1 ring-blue-500/30"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 hover:bg-slate-50/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-2.5 top-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-650 text-white shadow-xs">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {rate.label}
                  </span>
                  <span className="font-mono font-black text-slate-850 dark:text-slate-100 text-sm mt-1">
                    ₹{rate.val.toFixed(2)}
                  </span>
                  {sellUnit === "piece" && (
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      ₹{unitPrice.toFixed(2)} / pc
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Visual Sell Unit Selector (Segmented buttons) */}
        <div className="space-y-2">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
            Select Unit Type
          </span>
          <div className="flex gap-2 p-1 bg-slate-100/50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSellUnit("strip")
                setQty((q) => Math.min(q, activeBatch.stock))
              }}
              className={cn(
                "flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer",
                sellUnit === "strip"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
              )}
            >
              Strips ({activeBatch.stock} Available)
            </button>
            <button
              type="button"
              disabled={qtyPerStrip <= 1}
              onClick={() => setSellUnit("piece")}
              className={cn(
                "flex-1 text-center py-2 text-xs font-black rounded-lg transition-all disabled:opacity-40 cursor-pointer",
                sellUnit === "piece"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
              )}
            >
              Pieces ({activeBatch.stock * qtyPerStrip} Available)
            </button>
          </div>
        </div>

        {/* Quantity and Discount row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quantity selector */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
              Sales Quantity
            </span>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-950 w-full h-[42px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10) || 1
                  setQty(Math.min(maxStock, Math.max(1, parsed)))
                }}
                className="w-full bg-transparent text-center text-xs font-black text-slate-850 dark:text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                className="px-3.5 py-2 text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Discount Percentage input */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
              Item Discount
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-955 overflow-hidden w-full h-[42px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
              <input
                type="number"
                min="0"
                max="100"
                value={itemDiscount}
                onChange={(e) => setItemDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full bg-transparent px-4.5 text-right text-xs font-black text-slate-850 dark:text-slate-100 outline-none"
                placeholder="0"
              />
              <span className="border-l border-slate-105 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 px-4 h-full flex items-center text-[11px] font-bold text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Subtotal cost estimation panel (premium dark bg) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-150 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-[9px] font-black uppercase tracking-widest">
              Cost Summary Preview
            </h5>
          </div>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between text-slate-400">
              <span>Base Value</span>
              <span>₹{totalBeforeDiscount.toFixed(2)}</span>
            </div>
            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-450">
                <span>Discount ({itemDiscount}%)</span>
                <span>-₹{discountVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>GST Tax ({cgstRate + sgstRate}%)</span>
              <span>₹{taxVal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white pt-2.5 border-t border-slate-800 font-extrabold text-sm">
              <span>Total Net</span>
              <span className="text-blue-400 font-mono text-base">₹{netVal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  )
}
