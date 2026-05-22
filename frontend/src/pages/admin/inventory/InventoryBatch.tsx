import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Pill, Building2, MapPin } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import useSearchFilter from "@/hooks/useSearchFilter"
import { queryKeys } from "@/lib/queryKeys"
import InventoryApi from "@/services/inventoryApi"
import { INITIAL_MEDICINE_STOCK_FILTERS } from "@/constants/page/admin/inventory"

const formatExpiry = (value?: string | null) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-IN", {
    month: "2-digit",
    year: "2-digit",
  })
}

const isNearExpiry = (value?: string | null) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false

  const daysUntilExpiry =
    (parsed.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry <= 180
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getRelationName = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value) || "-"
  }

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === "string" || typeof name === "number") {
      return String(name) || "-"
    }
  }

  return "-"
}

export default function InventoryBatchPage() {
  const { filter, handleFilter } = useSearchFilter(
    INITIAL_MEDICINE_STOCK_FILTERS
  )

  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: queryKeys.inventory.list(filter),
    queryFn: () => InventoryApi.getAll(filter),
  })

  const handleFilterChange = useCallback(
    (updates: Record<string, any>) => {
      handleFilter({ ...updates, page: 1 })
    },
    [handleFilter]
  )

  // Flat-map batches for the medicines on the current page
  const batches = useMemo(() => {
    if (!inventoryData?.data) return []

    return inventoryData.data.flatMap((medicine: any) => {
      const medicineBatches = Array.isArray(medicine.batches) ? medicine.batches : []

      // If a medicine has no batches, we can show a placeholder or skip it.
      // Since the request is to view inventory medicines batch-wise, we display the active batches.
      return medicineBatches.map((batch: any) => ({
        ...batch,
        medicineId: medicine.id,
        medicineName: medicine.name,
        saltComposition: medicine.saltComposition,
        manufacturer: medicine.manufacturer,
        category: medicine.category,
        packing: medicine.packing,
        itemType: medicine.itemType || medicine.type,
      }))
    })
  }, [inventoryData])

  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "serial",
        header: "#",
        render: (_, index) => {
          const currentPage = filter.page || 1
          const perPage = filter.perPage || 10
          return (currentPage - 1) * perPage + index + 1
        },
      },
      {
        key: "medicine",
        header: "Medicine & Salt Composition",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
              <Pill size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {row.medicineName}
                </span>
                {row.itemType && row.itemType !== "NORMAL" && (
                  <span className="rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                    {row.itemType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {row.saltComposition || "-"}
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 size={12} className="shrink-0 opacity-70" strokeWidth={1.5} />
                  {getRelationName(row.manufacturer)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="shrink-0 opacity-70" strokeWidth={1.5} />
                  {getRelationName(row.category)} {row.packing ? `(${row.packing})` : ""}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "batchNo",
        header: "Batch No.",
        render: (row) => (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {row.batchNo || row.number || "-"}
          </span>
        ),
      },
      {
        key: "expiry",
        header: "Expiry Date",
        render: (row) => {
          const nearExpiry = isNearExpiry(row.expiryDate || row.expiry)
          return (
            <div
              className={`flex items-center gap-1.5 font-bold ${nearExpiry
                ? "text-red-500 dark:text-red-400"
                : "text-slate-700 dark:text-slate-300"
                }`}
            >
              {nearExpiry && <AlertCircle size={16} className="shrink-0 text-red-500" />}
              {formatExpiry(row.expiryDate || row.expiry)}
              {nearExpiry && (
                <span className="text-[10px] uppercase font-semibold bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200/50 shrink-0">
                  Expiring Soon
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: "qty",
        header: "Available Qty",
        render: (row) => {
          const stock = toNumber(row.availableQty)
          const received = toNumber(row.receivedQty)
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-extrabold ${stock > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                    }`}
                >
                  {stock} units
                </span>
                <span className="text-[11px] text-slate-400">
                  / {received} received
                </span>
              </div>
              <div className="w-24 bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                <div
                  className={`h-1.5 rounded-full ${stock === 0
                    ? "bg-red-500"
                    : stock < 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    }`}
                  style={{
                    width: `${Math.min(100, received > 0 ? (stock / received) * 100 : 0)}%`,
                  }}
                ></div>
              </div>
            </div>
          )
        },
      },
      {
        key: "purchaseRate",
        header: "Purchase Rate",
        render: (row) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            ₹{toNumber(row.purchaseRate).toFixed(2)}
          </span>
        ),
      },
      {
        key: "mrp",
        header: "MRP",
        render: (row) => (
          <span className="font-extrabold text-slate-900 dark:text-white">
            ₹{toNumber(row.mrp).toFixed(2)}
          </span>
        ),
      },
      {
        key: "tax",
        header: "Tax Rate",
        render: (row) => {
          const cgst = toNumber(row.cgst)
          const sgst = toNumber(row.sgst)
          return (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {cgst > 0 || sgst > 0 ? `CGST ${cgst}% + SGST ${sgst}%` : "No Tax"}
            </span>
          )
        },
      },
    ]
  }, [filter.page, filter.perPage])

  return (
    <div className="space-y-6">
      <SectionCard
        title="Inventory Batches"
        description="View and manage pharmacy medicine stock organized batch-wise."
      >
        <div className="space-y-4">
          <FilterBar
            values={{
              search: filter.search || "",
            }}
            onChange={handleFilterChange}
          >
            <FilterBar.Search
              name="search"
              className="w-[35%]"
              placeholder="Search medicine name, salt composition..."
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={batches}
            rowKey="id"
            currentPage={filter.page || 1}
            lastPage={
              inventoryData?.meta?.totalPages ||
              Math.ceil(
                (inventoryData?.meta?.total || 0) / (filter.perPage || 10)
              ) ||
              1
            }
            pageSize={filter.perPage || 10}
            totalRecords={inventoryData?.meta?.total || 0}
            isLoading={isLoadingInventory}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(perPage) =>
              handleFilterChange({ perPage, page: 1 })
            }
            emptyTitle="No inventory batches found"
            emptyDescription="Create an inventory medicine with batches or adjust filters to see matching records."
          />
        </div>
      </SectionCard>
    </div>
  )
}
