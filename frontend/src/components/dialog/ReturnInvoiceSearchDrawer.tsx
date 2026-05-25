import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import InvoiceApi from "@/services/invoiceApi"

interface ReturnInvoiceSearchDrawerProps {
  open: boolean
  onClose: (open: boolean) => void
  onSelectInvoice: (invoiceId: string) => void
}

export default function ReturnInvoiceSearchDrawer({
  open,
  onClose,
  onSelectInvoice,
}: ReturnInvoiceSearchDrawerProps) {
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [isSearchingInvoice, setIsSearchingInvoice] = useState(false)

  useEffect(() => {
    if (!open) {
      setInvoiceSearch("")
      setIsSearchingInvoice(false)
    }
  }, [open])

  const handleSearch = async () => {
    const search = invoiceSearch.trim()
    if (!search) {
      toast.error("Please enter an invoice number")
      return
    }

    try {
      setIsSearchingInvoice(true)
      const result = await InvoiceApi.getInvoices({
        search,
        page: 1,
        perPage: 1,
      })
      const matchedInvoice =
        result.data.find((invoice) => invoice.invoice_id === search) ||
        result.data[0]

      if (!matchedInvoice) {
        toast.error("Invoice not found")
        return
      }

      toast.success("Invoice found")
      onSelectInvoice(matchedInvoice.id)
      onClose(false)
      setInvoiceSearch("")
    } catch (error: unknown) {
      const errMsg =
        (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message === "string" &&
          (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message) ||
        (error instanceof Error ? error.message : null) ||
        "Invoice not found"
      toast.error(errMsg)
    } finally {
      setIsSearchingInvoice(false)
    }
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Find Invoice"
      description="Search for an invoice to start processing a return."
      size="md"
      footer={null}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Invoice ID (e.g. INV-2023-086)"
            className="pl-10"
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setInvoiceSearch("")
              onClose(false)
            }}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSearch} disabled={isSearchingInvoice}>
            {isSearchingInvoice ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </FormContainer>
  )
}
