import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Eye,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  ArrowUpRight,
  Download,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import InvoiceApi, { type Invoice } from "@/services/invoiceApi"
import { StatusBadge } from "@/components/ui/badge-status"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  INITIAL_INVOICE_FILTERS,
  PAYMENT_MODE_OPTIONS,
  INVOICE_STATUS_OPTIONS,
  INVOICE_COLUMNS,
} from "@/constants/page/admin/invoices"

const formatCurrency = (value: number) => `\u20B9${value.toFixed(2)}`

export default function RecentInvoicesPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  )
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1")
  const { filter, handleFilter } = useSearchFilter(INITIAL_INVOICE_FILTERS)

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: queryKeys.invoices.list(filter),
    queryFn: () => InvoiceApi.getInvoices(filter),
  })

  const { data: statsData } = useQuery({
    queryKey: queryKeys.invoices.stats(),
    queryFn: () => InvoiceApi.getInvoiceStats(),
    staleTime: 0,
    initialData: {
      data: {
        todays_sales: 0,
        todays_sales_trend: "12% vs yesterday",
        total_invoices: 0,
        total_invoices_trend: "8% vs yesterday",
        avg_order_value: 316.5,
        avg_order_value_trend: "3% vs yesterday",
        refunds_issued: 120.0,
        refunds_issued_trend: "1 return today",
      },
    },
  })

  const { data: invoiceTemplatesData, isLoading: isLoadingTemplates } =
    useQuery({
      queryKey: queryKeys.invoices.templates(),
      queryFn: () => InvoiceApi.getInvoiceTemplates(),
      staleTime: 5 * 60 * 1000,
    })

  const stats = statsData.data
  const invoiceTemplates = invoiceTemplatesData?.data.templates || []
  const defaultTemplate =
    invoiceTemplatesData?.data.defaultTemplate || "template1"

  useEffect(() => {
    if (!invoiceTemplatesData?.data.templates?.length) return

    const nextTemplate = invoiceTemplates.includes(selectedTemplate)
      ? selectedTemplate
      : defaultTemplate

    if (nextTemplate !== selectedTemplate) {
      setSelectedTemplate(nextTemplate)
    }
  }, [defaultTemplate, invoiceTemplates, invoiceTemplatesData, selectedTemplate])

  const { data: invoiceDetailsData, isFetching: isLoadingInvoiceDetails } =
    useQuery({
      queryKey: selectedInvoiceId
        ? queryKeys.invoices.detail(selectedInvoiceId)
        : queryKeys.invoices.detail(""),
      queryFn: () => InvoiceApi.getInvoice(selectedInvoiceId as string),
      enabled: Boolean(selectedInvoiceId),
    })

  const selectedInvoice = invoiceDetailsData?.data

  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
  }, [])

  const handleDownloadInvoice = useCallback(
    async (invoice: Invoice) => {
      try {
        const blob = await InvoiceApi.downloadInvoicePdf(
          invoice.id,
          selectedTemplate
        )
        downloadBlob(
          blob,
          `${invoice.invoice_id}-${selectedTemplate}.pdf`
        )
        toast.success(`Downloaded ${invoice.invoice_id} as ${selectedTemplate}.pdf`)
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Could not download invoice PDF. Please try again."
        )
      }
    },
    [downloadBlob, selectedTemplate]
  )

  const handlePreviewInvoice = useCallback((invoice: Invoice) => {
    try {
      InvoiceApi.openInvoiceHtml(invoice.id, selectedTemplate)
      toast.success(`Opened ${invoice.invoice_id} preview`)
    } catch {
      toast.error("Could not open invoice preview.")
    }
  }, [selectedTemplate])

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  const columns: DataTableColumn<Invoice>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: INVOICE_COLUMNS.find((c) => c.key === "serial")?.label || "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "invoice_details",
        header: "INVOICE DETAILS",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setSelectedInvoiceId(row.id)}
                className="cursor-pointer p-0 text-left font-bold text-primary hover:underline"
              >
                {row.invoice_id}
              </button>
              <div className="text-xs text-muted-foreground">
                {row.createdAt}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "customer_info",
        header: "CUSTOMER INFO",
        render: (row) => (
          <div className="space-y-0.5 text-sm">
            <div className="font-semibold">{row.customer_name}</div>
            <div className="text-xs text-muted-foreground">
              {row.customer_phone || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "items",
        header: "ITEMS",
        render: (row) => (
          <Badge
            variant="secondary"
            className="border-none bg-muted/50 font-medium text-muted-foreground"
          >
            {row.item_count} Items
          </Badge>
        ),
      },
      {
        key: "total_amount",
        header: "TOTAL AMOUNT",
        render: (row) => (
          <span className="font-bold">₹{row.total_amount.toFixed(2)}</span>
        ),
      },
      {
        key: "payment_mode",
        header: "PAYMENT MODE",
        render: (row) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            {row.payment_mode === "CASH" && <Banknote className="size-4" />}
            {row.payment_mode === "UPI" && <QrCode className="size-4" />}
            {row.payment_mode === "CARD" && <CreditCard className="size-4" />}
            <span className="capitalize">{row.payment_mode.toLowerCase()}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => (
          <StatusBadge
            status={row.status}
            className={cn(
              "px-3 py-1 font-bold",
              row.status === "PAID" && "bg-emerald-500/10 text-emerald-600",
              row.status === "REFUNDED" && "bg-red-500/10 text-red-600"
            )}
          />
        ),
      },
      {
        key: "action",
        header: "ACTIONS",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setSelectedInvoiceId(row.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handlePreviewInvoice(row)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRight className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => handleDownloadInvoice(row)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="size-4" />
            </Button>
          </div>
        ),
      },
    ]
  }, [
    filter.page,
    filter.perPage,
    handleDownloadInvoice,
    handlePreviewInvoice,
  ])

  const sectionAction = (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Invoice Template
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          disabled={isLoadingTemplates || invoiceTemplates.length === 0}
          className="h-9 min-w-[180px] rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(invoiceTemplates.length > 0 ? invoiceTemplates : [defaultTemplate]).map(
            (template) => (
              <option key={template} value={template}>
                {template}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!selectedInvoice}
          onClick={() => selectedInvoice && handlePreviewInvoice(selectedInvoice)}
        >
          <ArrowUpRight className="mr-2 size-4" />
          Preview Selected
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedInvoice}
          onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
        >
          <Download className="mr-2 size-4" />
          Download PDF
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`₹${stats.todays_sales.toLocaleString()}`}
          helper={stats.todays_sales_trend}
          icon={<CreditCard className="size-5" />}
        />
        <StatCard
          title="Total Invoices"
          value={String(stats.total_invoices)}
          helper={stats.total_invoices_trend}
          icon={<FileText className="size-5" />}
        />
        <StatCard
          title="Average Order Value"
          value={`₹${stats.avg_order_value.toFixed(2)}`}
          helper={stats.avg_order_value_trend}
          icon={<CreditCard className="size-5" />}
        />
        <StatCard
          title="Refunds Issued"
          value={`₹${stats.refunds_issued.toFixed(2)}`}
          helper={stats.refunds_issued_trend}
          icon={<RotateCcw className="size-5" />}
        />
      </div>

      <SectionCard
        title="Recent Invoices"
        description="View and manage all sales transactions and invoice history."
        action={sectionAction}
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
              payment_mode: filter.payment_mode || "all",
              status: filter.status || "all",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[30%]"
              placeholder="Search by Invoice #, Customer Name or Phone..."
            />
            <FilterBar.Select
              name="payment_mode"
              placeholder="All Payment Modes"
              options={[
                { label: "All Payment Modes", value: "all" },
                ...PAYMENT_MODE_OPTIONS,
              ]}
            />
            <FilterBar.Select
              name="status"
              placeholder="All Status"
              options={[
                { label: "All Status", value: "all" },
                ...INVOICE_STATUS_OPTIONS,
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={invoicesData?.data || []}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={invoicesData?.meta?.pages || 1}
            pageSize={filter.perPage || 10}
            totalRecords={invoicesData?.meta?.total || 0}
            isLoading={isLoadingInvoices}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No invoices found"
            emptyDescription="Create a new sale or adjust your filters."
          />
        </div>
      </SectionCard>

      <Dialog
        open={Boolean(selectedInvoiceId)}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoiceId(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Invoice {selectedInvoice?.invoice_id || ""}
            </DialogTitle>
            <DialogDescription>
              Sale details and billed items.
            </DialogDescription>
          </DialogHeader>

          {isLoadingInvoiceDetails ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading invoice...
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePreviewInvoice(selectedInvoice)}
                >
                  <ArrowUpRight className="mr-2 size-4" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                >
                  <Download className="mr-2 size-4" />
                  Download PDF
                </Button>
              </div>
              <div className="grid gap-3 rounded-lg border border-border/60 p-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Customer
                  </p>
                  <p className="font-semibold">
                    {selectedInvoice.customer_name || "Walk-in Customer"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="font-semibold">
                    {selectedInvoice.customer_phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Payment
                  </p>
                  <p className="font-semibold capitalize">
                    {selectedInvoice.payment_mode.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Date
                  </p>
                  <p className="font-semibold">{selectedInvoice.createdAt}</p>
                </div>
              </div>

              <div className="max-h-64 overflow-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Item</th>
                      <th className="px-3 py-2 font-semibold">Batch</th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((item) => (
                      <tr key={item.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium">
                          {item.inventory_name}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {item.batch_no || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.qty} {item.sell_unit}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(item.sub_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross</span>
                  <span>{formatCurrency(selectedInvoice.gross_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>{formatCurrency(selectedInvoice.discount_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Invoice not found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
