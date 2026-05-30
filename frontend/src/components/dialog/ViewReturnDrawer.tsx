import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Clock, XCircle, Package, CreditCard, FileText } from "lucide-react"
import { queryKeys } from "@/lib/queryKeys"
import ReturnApi, { type SalesReturn } from "@/services/returnApi"
import { FormContainer } from "@/components/formContainer"
import { StatusBadge } from "@/components/ui/badge-status"
import { cn } from "@/lib/utils"
import { RETURN_REASON_OPTIONS, REFUND_METHOD_OPTIONS } from "@/constants/page/admin/returns"

interface ViewReturnDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
  returnId?: string | null
}

export default function ViewReturnDrawer({
  open,
  onClose,
  returnId,
}: ViewReturnDrawerProps) {
  const { data: returnData, isLoading } = useQuery({
    queryKey: returnId ? queryKeys.returns.detail(returnId) : queryKeys.returns.detail(""),
    queryFn: () => ReturnApi.getReturn(returnId as string),
    enabled: open && Boolean(returnId),
  })

  const returnData_ = returnData?.data

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "REFUNDED":
        return <CheckCircle2 className="size-4" />
      case "PENDING":
        return <Clock className="size-4" />
      case "REJECTED":
        return <XCircle className="size-4" />
      default:
        return null
    }
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Return Details"
      description="View complete sales return information."
      size="xl"
      footer={null}
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading return details...
        </div>
      ) : returnData_ ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">RETURN ID</p>
              <p className="text-lg font-bold">{returnData_.return_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">STATUS</p>
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={returnData_.status}
                  className={cn(
                    "px-3 py-1 font-bold",
                    returnData_.status === "REFUNDED" && "bg-emerald-500/10 text-emerald-600",
                    returnData_.status === "PENDING" && "bg-amber-500/10 text-amber-600",
                    returnData_.status === "REJECTED" && "bg-red-500/10 text-red-600"
                  )}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">ORIGINAL INVOICE</p>
              <p className="font-bold text-primary">{returnData_.original_invoice}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">RETURN DATE</p>
              <p className="font-semibold">{returnData_.createdAt}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              <Package className="size-4" />
              Customer Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{returnData_.customer_name}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                <p className="font-semibold">{returnData_.customer_phone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Return Reason & Method */}
          <div className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                <FileText className="size-4" />
                Return Reason
              </h3>
              <p className="font-semibold">
                {RETURN_REASON_OPTIONS.find((r) => r.value === returnData_.reason)?.label ||
                  returnData_.reason}
              </p>
              {returnData_.note && (
                <div className="mt-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Note</p>
                  <p className="text-sm">{returnData_.note}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                <CreditCard className="size-4" />
                Refund Method
              </h3>
              <p className="font-semibold">
                {REFUND_METHOD_OPTIONS.find((r) => r.value === returnData_.refund_method)?.label ||
                  returnData_.refund_method}
              </p>
            </div>
          </div>

          {/* Return Items */}
          {returnData_.items && returnData_.items.length > 0 && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 p-4">
                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Returned Items ({returnData_.items.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20 text-left font-medium text-muted-foreground">
                      <th className="p-4">ITEM DETAILS</th>
                      <th className="p-4">BATCH</th>
                      <th className="p-4">EXPIRY</th>
                      <th className="p-4">UNIT PRICE</th>
                      <th className="p-4 text-center">RETURN QTY</th>
                      <th className="p-4">REASON</th>
                      <th className="p-4 text-right">REFUND AMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {returnData_.items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{item.name}</div>
                        </td>
                        <td className="p-4">{item.batch || "-"}</td>
                        <td className="p-4">{item.expiry || "-"}</td>
                        <td className="p-4">₹{item.unit_price.toFixed(2)}</td>
                        <td className="p-4 text-center font-semibold">{item.return_qty}</td>
                        <td className="p-4">
                          {RETURN_REASON_OPTIONS.find((r) => r.value === item.reason)?.label ||
                            item.reason}
                        </td>
                        <td className="p-4 text-right font-semibold">
                          ₹{item.refund_amt.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              <CreditCard className="size-4" />
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{returnData_.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span className="font-medium">₹{returnData_.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Restocking Fee</span>
                <span className="font-medium">-₹{returnData_.restocking_fee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-lg font-bold">Total Refund</span>
                <span className="text-lg font-bold text-primary">
                  ₹{returnData_.return_value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={() => onClose(false)}
              className="rounded-lg border px-6 py-2 text-sm font-medium hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No return details available.
        </div>
      )}
    </FormContainer>
  )
}
