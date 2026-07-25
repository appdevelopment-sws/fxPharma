import { useEffect } from "react"
import { CheckCircle2, Printer, PlusCircle } from "lucide-react"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"

interface CartItem {
  id: string
  product: {
    name: string
  }
  qty: number
  rateValue: number
  itemDiscount: number
}

interface SuccessInvoiceDetails {
  id: string
  invoiceId?: string
  customerName?: string
  customerPhone?: string
  items?: CartItem[]
  grossTotal: number
  itemDiscounts: number
  overallDiscount: number
  tax: number
  netPayable: number
  tendered?: number
  change?: number
  paymentMode: string
  cashAmount?: number
  onlineAmount?: number
  date: string
}

interface SuccessInvoiceDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  invoiceDetails: SuccessInvoiceDetails | null
  onPrint: (invoiceId: string) => void
  onNewSale: () => void
}

export default function SuccessInvoiceDialog({
  open,
  onClose,
  invoiceDetails,
  onPrint,
  onNewSale,
}: SuccessInvoiceDialogProps) {
  // Keyboard navigation for success modal:
  // Enter / N -> New Sale
  // P / F5 -> Print Invoice
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key.toLowerCase() === "n") {
        e.preventDefault()
        onNewSale()
      } else if (e.key === "F5" || (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault()
        if (invoiceDetails?.id) {
          onPrint(invoiceDetails.id)
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        onNewSale()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, invoiceDetails, onPrint, onNewSale])

  if (!invoiceDetails) return null

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onNewSale()
      }}
      title="Transaction Successful"
      description="Invoice generated and inventory stock updated."
      size="md"
      className="p-0 sm:max-w-md"
      footer={
        <div className="flex w-full items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (invoiceDetails?.id) {
                onPrint(invoiceDetails.id)
              }
            }}
            className="flex flex-1 items-center justify-center gap-1.5 text-xs font-extrabold uppercase"
          >
            <Printer className="h-4 w-4" />
            Print <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[9px] font-mono">[F5 / P]</span>
          </Button>
          <Button
            type="button"
            onClick={onNewSale}
            className="flex flex-1 items-center justify-center gap-1.5 bg-emerald-600 text-xs font-extrabold text-white uppercase hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" />
            New Sale <span className="ml-1 rounded bg-emerald-800/40 px-1 py-0.5 text-[9px] font-mono">[Enter]</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-3 p-4 font-sans text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-3 text-left">
          {/* Invoice Basic Metadata */}
          <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3.5 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between">
              <span>Invoice No.</span>
              <span className="font-extrabold text-foreground">
                {invoiceDetails.invoiceId || invoiceDetails.id}
              </span>
            </div>
            {invoiceDetails.customerName && (
              <div className="flex justify-between">
                <span>Customer</span>
                <span className="font-bold text-foreground">
                  {invoiceDetails.customerName}
                </span>
              </div>
            )}
            {invoiceDetails.customerPhone && (
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-bold text-foreground">
                  {invoiceDetails.customerPhone}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Date &amp; Time</span>
              <span className="font-medium text-foreground">
                {invoiceDetails.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-extrabold text-teal-600 uppercase">
                {invoiceDetails.paymentMode === "SPLIT" ? (
                  <span>
                    Split (Cash: ₹
                    {invoiceDetails.cashAmount?.toFixed(2) ?? "0.00"}, Online: ₹
                    {invoiceDetails.onlineAmount?.toFixed(2) ?? "0.00"})
                  </span>
                ) : (
                  invoiceDetails.paymentMode
                )}
              </span>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="space-y-1.5 rounded-xl border border-border bg-card p-3.5 text-xs font-semibold">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross Total</span>
              <span>₹{invoiceDetails.grossTotal.toFixed(2)}</span>
            </div>
            {invoiceDetails.overallDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>−₹{invoiceDetails.overallDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>GST / Tax</span>
              <span>₹{invoiceDetails.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-black text-foreground">
              <span>Net Paid</span>
              <span className="font-mono text-emerald-600">
                ₹{invoiceDetails.netPayable.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  )
}
