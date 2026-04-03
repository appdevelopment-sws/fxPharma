import * as React from "react"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import SectionCard from "@/components/SectionCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ProductRow = {
  id: string
  name: string
  category: string
  manufacturer: string
  status: "active" | "inactive"
  stock: number
}

const PRODUCT_ROWS: ProductRow[] = [
  {
    id: "PRD-1001",
    name: "Paracetamol 500mg",
    category: "Tablet",
    manufacturer: "MediCore Labs",
    status: "active",
    stock: 180,
  },
  {
    id: "PRD-1002",
    name: "Amoxicillin 250mg",
    category: "Capsule",
    manufacturer: "NovaCure Pharma",
    status: "active",
    stock: 92,
  },
  {
    id: "PRD-1003",
    name: "Cough Relief Syrup",
    category: "Syrup",
    manufacturer: "WellSpring Health",
    status: "inactive",
    stock: 24,
  },
  {
    id: "PRD-1004",
    name: "Vitamin D3 Drops",
    category: "Drops",
    manufacturer: "Sunline Remedies",
    status: "active",
    stock: 58,
  },
  {
    id: "PRD-1005",
    name: "Ibuprofen 400mg",
    category: "Tablet",
    manufacturer: "Apex Therapeutics",
    status: "inactive",
    stock: 0,
  },
]

const CATEGORY_OPTIONS = [
  { label: "Tablet", value: "Tablet" },
  { label: "Capsule", value: "Capsule" },
  { label: "Syrup", value: "Syrup" },
  { label: "Drops", value: "Drops" },
]

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const PRODUCT_COLUMNS: DataTableColumn<ProductRow>[] = [
  {
    key: "id",
    header: "Product ID",
    accessor: "id",
    cellClassName: "font-medium text-foreground",
  },
  {
    key: "name",
    header: "Product Name",
    accessor: "name",
  },
  {
    key: "category",
    header: "Category",
    accessor: "category",
  },
  {
    key: "manufacturer",
    header: "Manufacturer",
    accessor: "manufacturer",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant={row.status === "active" ? "default" : "outline"}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "stock",
    header: "Stock",
    render: (row) => `${row.stock} units`,
    cellClassName: "text-right",
    className: "text-right",
  },
]

export default function SuperAdminProductsNewPage() {
  const [filters, setFilters] = React.useState({
    category: "",
    status: "",
    search: "",
    page: 1,
    perPage: 5,
  })

  const filteredRows = React.useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return PRODUCT_ROWS.filter((product) => {
      const matchesCategory =
        !filters.category || product.category === filters.category
      const matchesStatus = !filters.status || product.status === filters.status
      const matchesSearch =
        !search ||
        product.id.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search) ||
        product.manufacturer.toLowerCase().includes(search)

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [filters.category, filters.search, filters.status])

  const lastPage = Math.max(1, Math.ceil(filteredRows.length / filters.perPage))
  const currentPage = Math.min(filters.page, lastPage)
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * filters.perPage
    return filteredRows.slice(start, start + filters.perPage)
  }, [currentPage, filteredRows, filters.perPage])

  const handleFilterChange = (updates: Record<string, string>) => {
    setFilters((current) => ({
      ...current,
      ...updates,
      page: 1,
    }))
  }

  return (
    <div>
      <SectionCard
        title="Products"
        description="Reusable filter and table pattern for product, tenant, user, or ticket listing pages."
        action={<Button>Add Product</Button>}
      >
        <div className="space-y-4">
          <FilterBar values={filters} onChange={handleFilterChange}>
            <FilterBar.Select
              name="category"
              options={CATEGORY_OPTIONS}
              placeholder="All Categories"
            />
            <FilterBar.Select
              name="status"
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <FilterBar.Search
              name="search"
              placeholder="Search by product id, name, or manufacturer"
            />
          </FilterBar>

          <DataTable
            columns={PRODUCT_COLUMNS}
            data={paginatedRows}
            rowKey="id"
            currentPage={currentPage}
            lastPage={lastPage}
            pageSize={filters.perPage}
            totalRecords={filteredRows.length}
            onPageChange={(page) =>
              setFilters((current) => ({ ...current, page }))
            }
            onPageSizeChange={(perPage) =>
              setFilters((current) => ({ ...current, perPage, page: 1 }))
            }
            emptyTitle="No products matched these filters"
            emptyDescription="Try changing category, status, or search terms to see matching products."
          />
        </div>
      </SectionCard>
    </div>
  )
}
