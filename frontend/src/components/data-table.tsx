import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableColumn<T> = {
  key: string
  header: React.ReactNode
  className?: string
  cellClassName?: string
  render?: (row: T, index: number) => React.ReactNode
  accessor?: keyof T | ((row: T) => React.ReactNode)
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: keyof T | ((row: T, index: number) => React.Key)
  isLoading?: boolean
  emptyTitle?: string
  rowClassName?: string | ((row: T, index: number) => string)
  emptyDescription?: string
  currentPage?: number
  lastPage?: number
  pageSize?: number
  totalRecords?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

function resolveCellValue<T>(
  column: DataTableColumn<T>,
  row: T,
  index: number
) {
  if (column.render) {
    return column.render(row, index)
  }

  if (typeof column.accessor === "function") {
    return column.accessor(row)
  }

  if (column.accessor) {
    return row[column.accessor] as React.ReactNode
  }

  return null
}

function resolveRowKey<T>(
  rowKey: DataTableProps<T>["rowKey"],
  row: T,
  index: number
) {
  if (typeof rowKey === "function") {
    return rowKey(row, index)
  }

  return row[rowKey] as React.Key
}

function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "There is nothing to display right now.",
  currentPage = 1,
  lastPage = 1,
  pageSize = 10,
  rowClassName,
  totalRecords = data.length,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: DataTableProps<T>) {
  const showPagination = Boolean(onPageChange || onPageSizeChange)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonLoader columns={columns.length} />
            ) : data.length === 0 ? (
              <TableEmptyState
                colSpan={columns.length}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={resolveRowKey(rowKey, row, index)}
                  className={cn(
                    typeof rowClassName === "function"
                      ? rowClassName(row, index)
                      : rowClassName
                  )}
                >
                  {" "}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName}
                    >
                      {resolveCellValue(column, row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {lastPage} with {totalRecords} total
            records
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {onPageSizeChange ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows</span>
                <select
                  value={pageSize}
                  onChange={(event) =>
                    onPageSizeChange(Number(event.target.value))
                  }
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {onPageChange ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPageChange(Math.min(lastPage, currentPage + 1))
                  }
                  disabled={currentPage >= lastPage}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type TableEmptyStateProps = {
  colSpan: number
  title?: string
  description?: string
}

function TableEmptyState({
  colSpan,
  title = "No data found",
  description = "There is nothing to display right now.",
}: TableEmptyStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-40">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}

type TableSkeletonLoaderProps = {
  columns: number
  rows?: number
}

function TableSkeletonLoader({ columns, rows = 5 }: TableSkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={`skeleton-row-${rowIndex}`}
          className="hover:bg-transparent"
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default DataTable
export { TableEmptyState, TableSkeletonLoader }
