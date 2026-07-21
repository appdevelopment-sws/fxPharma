import { FileDown } from "lucide-react"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import DataTable, { type DataTableColumn } from "@/components/data-table"
import type { ExpiryReportItem } from "@/services/inventoryApi"

export type CompanyExpiryGroup = {
  companyId: string
  companyName: string
  totalBatches: number
  totalStock: number
  totalValue: number
  expiredCount: number
  expiringSoonCount: number
  activeCount: number
  items: ExpiryReportItem[]
}

interface CompanyMedicinesDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  companyGroup: CompanyExpiryGroup | null
  columns: DataTableColumn<ExpiryReportItem>[]
  onExportCSV?: (group: CompanyExpiryGroup) => void
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

export default function CompanyMedicinesDialog({
  open,
  onClose,
  companyGroup,
  columns,
  onExportCSV,
}: CompanyMedicinesDialogProps) {
  if (!companyGroup) return null

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={companyGroup.companyName}
      description="Grouped medicines & batches subject to active filters."
      size="full"
      height="full"
      scrollable={false}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {onExportCSV ? (
            <Button
              variant="outline"
              onClick={() => onExportCSV(companyGroup)}
              className="gap-2"
            >
              <FileDown className="size-4 text-muted-foreground" />
              Export {companyGroup.companyName} CSV
            </Button>
          ) : (
            <div />
          )}
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 rounded-lg border bg-background p-3 text-xs">
          <div>
            <span className="text-muted-foreground">Total Batches:</span>{" "}
            <strong className="font-semibold text-foreground">
              {companyGroup.totalBatches}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">Total Stock:</span>{" "}
            <strong className="font-semibold text-foreground">
              {companyGroup.totalStock.toLocaleString("en-IN")} Units
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">Total Risk Value:</span>{" "}
            <strong className="font-semibold text-primary">
              {formatCurrency(companyGroup.totalValue)}
            </strong>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={companyGroup.items}
          rowKey="id"
          currentPage={1}
          lastPage={1}
          pageSize={companyGroup.items.length || 10}
          totalRecords={companyGroup.items.length}
          isLoading={false}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          emptyTitle="No medicines found"
          emptyDescription="No expiring medicines listed for this manufacturer."
        />
      </div>
    </FormContainer>
  )
}
