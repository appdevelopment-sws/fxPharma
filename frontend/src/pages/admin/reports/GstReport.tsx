import { useCallback, useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/authContext"
import { StatCard } from "@/components/stat-card"
import { ChartCard } from "@/components/chart-card"
import { DashboardBarChart } from "@/components/charts"
import { ShieldCheck, LayoutGrid, Building2, Eye, FileDown, ChevronDown, FileText, Calendar as CalendarIcon } from "lucide-react"
import SectionCard from "@/components/SectionCard"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import InvoiceApi from "@/services/invoiceApi"

export default function GstReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales")

  const { user } = useAuth()

  const { data: gstData, isLoading } = useQuery({
    queryKey: ["gst-summary", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: () =>
      InvoiceApi.getGstSummary({
        startDate: date?.from?.toISOString(),
        endDate: date?.to?.toISOString(),
      }),
    enabled: Boolean(date?.from),
  })

  const reportData = gstData?.data || {
    sales: { taxableAmount: 0, cgst: 0, sgst: 0, totalGst: 0, totalAmount: 0 },
    purchases: { taxableAmount: 0, cgst: 0, sgst: 0, totalGst: 0, totalAmount: 0 },
    payable: { cgst: 0, sgst: 0, totalGst: 0 },
    salesList: [],
    purchasesList: [],
  }

  const chartData = useMemo(() => {
    return [
      {
        name: "Sales (Output)",
        CGST: reportData.sales.cgst,
        SGST: reportData.sales.sgst,
      },
      {
        name: "Purchases (Input)",
        CGST: reportData.purchases.cgst,
        SGST: reportData.purchases.sgst,
      },
      {
        name: "Payable (Net)",
        CGST: reportData.payable.cgst,
        SGST: reportData.payable.sgst,
      },
    ]
  }, [reportData])

  const salesColumns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "invoiceId",
        header: "INVOICE ID",
        render: (row) => <span className="font-bold text-primary">{row.invoiceId}</span>,
      },
      {
        key: "customerName",
        header: "CUSTOMER NAME",
        render: (row) => (
          <div>
            <div className="font-medium">{row.customerName}</div>
            {row.customerPhone && (
              <div className="text-xs text-muted-foreground">{row.customerPhone}</div>
            )}
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "DATE",
        render: (row) => <span>{format(new Date(row.createdAt), "dd MMM yyyy")}</span>,
      },
      {
        key: "grossAmount",
        header: "TAXABLE AMOUNT",
        render: (row) => <span>₹{row.grossAmount.toFixed(2)}</span>,
      },
      {
        key: "cgst",
        header: "CGST (2.5% / 6% / 9%)",
        render: (row) => <span className="text-muted-foreground">₹{row.cgst.toFixed(2)}</span>,
      },
      {
        key: "sgst",
        header: "SGST (2.5% / 6% / 9%)",
        render: (row) => <span className="text-muted-foreground">₹{row.sgst.toFixed(2)}</span>,
      },
      {
        key: "taxAmount",
        header: "TOTAL GST",
        render: (row) => <span className="font-semibold text-amber-600">₹{row.taxAmount.toFixed(2)}</span>,
      },
      {
        key: "totalAmount",
        header: "TOTAL AMOUNT",
        render: (row) => <span className="font-bold">₹{row.totalAmount.toFixed(2)}</span>,
      },
    ]
  }, [])

  const purchaseColumns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "itemName",
        header: "ITEM NAME",
        render: (row) => <span className="font-bold text-primary">{row.itemName}</span>,
      },
      {
        key: "batchNo",
        header: "BATCH NO",
        render: (row) => <Badge variant="outline">{row.batchNo}</Badge>,
      },
      {
        key: "receivedAt",
        header: "RECEIVED DATE",
        render: (row) => <span>{format(new Date(row.receivedAt), "dd MMM yyyy")}</span>,
      },
      {
        key: "qty",
        header: "QTY",
        render: (row) => <span>{row.qty}</span>,
      },
      {
        key: "taxableAmount",
        header: "TAXABLE AMOUNT",
        render: (row) => <span>₹{row.taxableAmount.toFixed(2)}</span>,
      },
      {
        key: "cgst",
        header: "CGST PAID",
        render: (row) => <span className="text-muted-foreground">₹{row.cgst.toFixed(2)}</span>,
      },
      {
        key: "sgst",
        header: "SGST PAID",
        render: (row) => <span className="text-muted-foreground">₹{row.sgst.toFixed(2)}</span>,
      },
      {
        key: "totalGst",
        header: "TOTAL GST",
        render: (row) => <span className="font-semibold text-emerald-600">₹{row.totalGst.toFixed(2)}</span>,
      },
      {
        key: "totalAmount",
        header: "TOTAL VALUE",
        render: (row) => <span className="font-bold">₹{row.totalAmount.toFixed(2)}</span>,
      },
    ]
  }, [])

  const handleExportCSV = () => {
    if (activeTab === "sales") {
      if (!reportData.salesList?.length) {
        toast.error("No sales data available to export")
        return
      }
      const headers = ["Invoice ID", "Customer Name", "Customer Phone", "Date", "Taxable Amount", "CGST", "SGST", "Total GST", "Total Amount"]
      const rows = reportData.salesList.map((row: any) => [
        `"${row.invoiceId}"`,
        `"${row.customerName}"`,
        `"${row.customerPhone || ""}"`,
        `"${format(new Date(row.createdAt), "yyyy-MM-dd")}"`,
        row.grossAmount,
        row.cgst,
        row.sgst,
        row.taxAmount,
        row.totalAmount,
      ])
      const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `gst_sales_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      if (!reportData.purchasesList?.length) {
        toast.error("No purchase data available to export")
        return
      }
      const headers = ["Item Name", "Batch No", "Received Date", "Qty", "Rate", "Taxable Amount", "CGST Paid", "SGST Paid", "Total GST", "Total Value"]
      const rows = reportData.purchasesList.map((row: any) => [
        `"${row.itemName}"`,
        `"${row.batchNo}"`,
        `"${format(new Date(row.receivedAt), "yyyy-MM-dd")}"`,
        row.qty,
        row.rate,
        row.taxableAmount,
        row.cgst,
        row.sgst,
        row.totalGst,
        row.totalAmount,
      ])
      const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `gst_purchases_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    toast.success("GST Report exported successfully")
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase font-semibold">
            GST Report & ITC Summary
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            GST Analytics
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {user?.name} • {user.role}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-lg border-border/60 bg-background/50 px-4 font-medium transition-all hover:bg-background hover:ring-1 hover:ring-primary/20"
              >
                <CalendarIcon className="mr-2 size-4 text-primary" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDown className="ml-2 size-4 opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 rounded-lg border-border/60 bg-background/50 px-4 font-medium transition-all hover:bg-background hover:ring-1 hover:ring-primary/20"
          >
            <FileDown className="mr-2 size-4 text-muted-foreground" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Output GST (Collected on Sales)"
          value={`₹${reportData.sales.totalGst.toFixed(2)}`}
          helper={`CGST: ₹${reportData.sales.cgst.toFixed(2)} | SGST: ₹${reportData.sales.sgst.toFixed(2)}`}
          icon={<ShieldCheck className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Input GST (Paid on Purchases)"
          value={`₹${reportData.purchases.totalGst.toFixed(2)}`}
          helper={`CGST: ₹${reportData.purchases.cgst.toFixed(2)} | SGST: ₹${reportData.purchases.sgst.toFixed(2)}`}
          icon={<LayoutGrid className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Net GST Payable"
          value={`₹${reportData.payable.totalGst.toFixed(2)}`}
          helper={`CGST: ₹${reportData.payable.cgst.toFixed(2)} | SGST: ₹${reportData.payable.sgst.toFixed(2)}`}
          icon={<Building2 className="h-4 w-4 text-primary" />}
          valueClassName="text-2xl font-bold text-primary"
        />
      </div>

      {/* Visual Chart and Calculation Explanation */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="GST Breakdown Overview"
            description="Comparing Output (collected) vs Input (paid) and Net Payable GST."
          >
            <div className="h-[280px]">
              <DashboardBarChart data={chartData} xKey="name" yKey="CGST" />
            </div>
          </ChartCard>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg mb-3">GST Calculation Rule</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Under GST regulations, businesses are only required to pay the difference between the tax collected on sales (Output GST) and the tax paid on procurement (Input GST/ITC).
            </p>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>Output GST:</span>
                <span className="text-amber-600">₹{reportData.sales.totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>(-) Input GST Credit:</span>
                <span className="text-emerald-600">-₹{reportData.purchases.totalGst.toFixed(2)}</span>
              </div>
              <hr className="border-border/60" />
              <div className="flex justify-between text-sm font-bold">
                <span>Net GST Payable:</span>
                <span className="text-primary">₹{reportData.payable.totalGst.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground leading-normal">
            * Note: CGST & SGST calculations are based on standard 50-50 splitting for local retail drug transactions.
          </div>
        </div>
      </div>

      {/* Tabs and Data Tables */}
      <SectionCard
        title="GST Ledger Breakdown"
        description="Filter and trace GST transactions for tax filing."
      >
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab("sales")}
              className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
                activeTab === "sales"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sales (Outward GST)
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
                activeTab === "purchases"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Purchases (Inward GST/ITC)
            </button>
          </div>

          {activeTab === "sales" ? (
            <DataTable
              columns={salesColumns}
              data={reportData.salesList || []}
              rowKey="id"
              isLoading={isLoading}
              emptyTitle="No outward sales found"
              emptyDescription="Adjust your date range filters to view sales transactions."
            />
          ) : (
            <DataTable
              columns={purchaseColumns}
              data={reportData.purchasesList || []}
              rowKey="id"
              isLoading={isLoading}
              emptyTitle="No inward purchases found"
              emptyDescription="Adjust your date range filters to view purchase transactions."
            />
          )}
        </div>
      </SectionCard>
    </div>
  )
}
