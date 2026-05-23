import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import { Trash2, ShoppingCart } from "lucide-react"

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

type HeldBill = {
  id: string
  holdAt: string
  customerName: string
  customerPhone: string
  cart: CartItem[]
  discountPercent: number
  discountType: "flat" | "percent"
  paymentMode: string
  deliveryCost: number
  binValue: number
  totalAmount: number
}

interface HeldBillsDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  heldBills: HeldBill[]
  onRestore: (bill: HeldBill) => void
  onDelete: (id: string) => void
}

export default function HeldBillsDialog({
  open,
  onClose,
  heldBills,
  onRestore,
  onDelete,
}: HeldBillsDialogProps) {
  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Held Bills"
      description="Select a held bill to restore it to the POS cart or discard it."
      size="md"
      scrollable={false}
      height="lg"
      footer={
        <Button
          variant="outline"
          onClick={() => onClose(false)}
          className="w-full font-extrabold text-xs uppercase"
        >
          Close
        </Button>
      }
    >
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {heldBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300 gap-2">
            <ShoppingCart className="h-10 w-10 text-gray-250" />
            <p className="text-sm font-bold text-gray-400">No bills currently on hold.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden bg-white">
            {heldBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-gray-800 truncate">
                      {bill.customerName || "Walk-in Customer"}
                    </p>
                    {bill.customerPhone && (
                      <span className="text-xs font-semibold text-gray-400">({bill.customerPhone})</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold">
                    Held on: {new Date(bill.holdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex gap-3 text-[10px] text-gray-500 font-extrabold">
                    <span>Items: {bill.cart.reduce((sum, item) => sum + item.qty, 0)}</span>
                    <span>Total: ₹{bill.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onRestore(bill)}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-600 hover:bg-teal-100 hover:border-teal-300 transition-all active:scale-95 cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(bill.id)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100 hover:border-red-300 transition-all active:scale-95 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormContainer>
  )
}
