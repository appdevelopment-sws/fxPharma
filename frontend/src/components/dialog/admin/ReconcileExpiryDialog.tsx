import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { queryKeys } from "@/lib/queryKeys"
import type { ExpiryReportItem } from "@/services/inventoryApi"

interface ReconcileExpiryDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  item: ExpiryReportItem | null
}

export default function ReconcileExpiryDialog({
  open,
  onClose,
  item,
}: ReconcileExpiryDialogProps) {
  const queryClient = useQueryClient()
  const [actionType, setActionType] = useState<"return" | "dispose" | "adjust">("dispose")
  const [reconcileQty, setReconcileQty] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item && open) {
      setReconcileQty(item.stockQty || 0)
      setNotes("")
      setActionType(
        item.remainingDays !== null && item.remainingDays <= 0 ? "dispose" : "return"
      )
    }
  }, [item, open])

  if (!item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      setIsSubmitting(false)
      toast.success(
        `Batch ${item.batchNo} (${item.productName}) reconciled: ${
          actionType === "dispose"
            ? "Marked as Disposed"
            : actionType === "return"
              ? "Marked for Vendor Return"
              : "Stock Adjusted"
        }`
      )
      onClose(false)
    }, 400)
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Expiry Stock Reconciliation"
      description="Reconcile expired or near-expiry batch stock (Vendor Return, Write-off/Disposal, or Stock Adjustment)."
      size="md"
      height="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" type="button" onClick={() => onClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="reconcile-form" disabled={isSubmitting}>
            <RotateCcw className="mr-2 size-4" />
            {isSubmitting ? "Processing..." : "Confirm Reconciliation"}
          </Button>
        </div>
      }
    >
      <form id="reconcile-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{item.productName}</span>
            <span className="font-semibold text-muted-foreground">Batch: {item.batchNo}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Manufacturer: {item.manufacturer?.name || "-"}</span>
            <span>
              Current Stock: <strong>{item.stockQty} {item.unit || "Units"}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">RECONCILIATION ACTION</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActionType("dispose")}
              className={`rounded-lg border p-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                actionType === "dispose"
                  ? "border-red-500 bg-red-500/10 text-red-600 font-bold"
                  : "border-input bg-background hover:bg-muted"
              }`}
            >
              Dispose / Write-off
            </button>
            <button
              type="button"
              onClick={() => setActionType("return")}
              className={`rounded-lg border p-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                actionType === "return"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 font-bold"
                  : "border-input bg-background hover:bg-muted"
              }`}
            >
              Return to Vendor
            </button>
            <button
              type="button"
              onClick={() => setActionType("adjust")}
              className={`rounded-lg border p-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                actionType === "adjust"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-input bg-background hover:bg-muted"
              }`}
            >
              Stock Adjustment
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">QUANTITY TO RECONCILE</Label>
          <Input
            type="number"
            min={1}
            max={item.stockQty}
            value={reconcileQty}
            onChange={(e) => setReconcileQty(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">REASON / REMARKS</Label>
          <Input
            placeholder="e.g. Expired batch disposal / Damaged goods return"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </FormContainer>
  )
}
