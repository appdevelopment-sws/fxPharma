import * as React from "react"
import { useForm } from "react-hook-form"
import { Eye, PencilLine, Plus } from "lucide-react"
import { toast } from "sonner"

import DataTable, { type DataTableColumn } from "@/components/data-table"
import { FilterBar } from "@/components/filter-bar"
import MasterProductDrawer, {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_FORM_DEFAULT_VALUES,
  type MasterProductFormValues,
} from "@/components/products/MasterProductDrawer"
import SectionCard from "@/components/SectionCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ProductRow = {
  id: string
  name: string
  genericName: string
  category: string
  manufacturer: string
  unit: string
  sku: string
  status: "active" | "inactive"
  stock: number
  reorderLevel: number
  purchasePrice: number
  sellingPrice: number
  description: string
}

const PRODUCT_ROWS: ProductRow[] = [
  {
    id: "PRD-1001",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Tablet",
    manufacturer: "MediCore Labs",
    unit: "Box of 10 tablets",
    sku: "PCM-500-TAB",
    status: "active",
    stock: 180,
    reorderLevel: 40,
    purchasePrice: 2.2,
    sellingPrice: 3.75,
    description:
      "Fast moving pain relief tablet used for mild fever and aches.",
  },
  {
    id: "PRD-1002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Capsule",
    manufacturer: "NovaCure Pharma",
    unit: "Strip of 15 capsules",
    sku: "AMX-250-CAP",
    status: "active",
    stock: 92,
    reorderLevel: 25,
    purchasePrice: 4.45,
    sellingPrice: 6.25,
    description:
      "Broad-spectrum antibiotic packed in shelf-ready capsule strips.",
  },
  {
    id: "PRD-1003",
    name: "Cough Relief Syrup",
    genericName: "Dextromethorphan",
    category: "Syrup",
    manufacturer: "WellSpring Health",
    unit: "100ml bottle",
    sku: "CRS-100-SYP",
    status: "inactive",
    stock: 24,
    reorderLevel: 12,
    purchasePrice: 3.15,
    sellingPrice: 5.1,
    description: "Non-drowsy syrup bottle for dry cough management.",
  },
  {
    id: "PRD-1004",
    name: "Vitamin D3 Drops",
    genericName: "Cholecalciferol",
    category: "Drops",
    manufacturer: "Sunline Remedies",
    unit: "30ml dropper bottle",
    sku: "VD3-DRP-30",
    status: "active",
    stock: 58,
    reorderLevel: 20,
    purchasePrice: 5.2,
    sellingPrice: 8.35,
    description:
      "Daily supplement drops with calibrated child-safe applicator.",
  },
  {
    id: "PRD-1005",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Tablet",
    manufacturer: "Apex Therapeutics",
    unit: "Box of 10 tablets",
    sku: "IBU-400-TAB",
    status: "inactive",
    stock: 0,
    reorderLevel: 18,
    purchasePrice: 2.85,
    sellingPrice: 4.5,
    description:
      "Anti-inflammatory tablet temporarily paused for vendor refresh.",
  },
]

type DrawerState =
  | { open: false; mode: "create" | "edit" | "view"; product: null }
  | { open: true; mode: "create" | "edit" | "view"; product: ProductRow | null }

export default function SuperAdminProductsNewPage() {
  const [products, setProducts] = React.useState(PRODUCT_ROWS)
  const [filters, setFilters] = React.useState({
    category: "",
    status: "",
    search: "",
    page: 1,
    perPage: 5,
  })
  const [drawerState, setDrawerState] = React.useState<DrawerState>({
    open: false,
    mode: "create",
    product: null,
  })

  // Form management
  const { control, handleSubmit, reset } = useForm<MasterProductFormValues>({
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  })

  const filteredRows = React.useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        !filters.category || product.category === filters.category
      const matchesStatus = !filters.status || product.status === filters.status
      const matchesSearch =
        !search ||
        product.id.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search) ||
        product.manufacturer.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search)

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [filters.category, filters.search, filters.status, products])

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

  const openDrawer = (
    mode: DrawerState["mode"],
    product: ProductRow | null = null
  ) => {
    if (mode === "create") {
      reset(PRODUCT_FORM_DEFAULT_VALUES)
      setDrawerState({
        open: true,
        mode,
        product: null,
      })
    } else if (product) {
      const formValues: MasterProductFormValues = {
        name: product.name,
        genericName: product.genericName,
        category: product.category,
        manufacturer: product.manufacturer,
        unit: product.unit,
        sku: product.sku,
        purchasePrice: String(product.purchasePrice),
        sellingPrice: String(product.sellingPrice),
        stock: String(product.stock),
        reorderLevel: String(product.reorderLevel),
        status: product.status,
        description: product.description,
      }
      reset(formValues)
      setDrawerState({
        open: true,
        mode,
        product,
      })
    }
  }

  const handleDrawerChange = (open: boolean) => {
    if (!open) {
      setDrawerState({
        open: false,
        mode: drawerState.mode,
        product: null,
      })
      reset(PRODUCT_FORM_DEFAULT_VALUES)
    }
  }

  const buildProductFromForm = (
    values: MasterProductFormValues,
    existingId?: string
  ): ProductRow => ({
    id: existingId ?? getNextProductId(products),
    name: values.name.trim(),
    genericName: values.genericName.trim(),
    category: values.category,
    manufacturer: values.manufacturer.trim(),
    unit: values.unit.trim(),
    sku: values.sku.trim(),
    status: values.status,
    stock: Number(values.stock),
    reorderLevel: Number(values.reorderLevel),
    purchasePrice: Number(values.purchasePrice),
    sellingPrice: Number(values.sellingPrice),
    description: values.description.trim(),
  })

  const handleDrawerSubmit = async () => {
    await handleSubmit(async (values) => {
      if (drawerState.mode === "edit" && drawerState.product) {
        const updatedProduct = buildProductFromForm(
          values,
          drawerState.product.id
        )
        setProducts((current) =>
          current.map((product) =>
            product.id === drawerState.product?.id ? updatedProduct : product
          )
        )
        toast.success("Master product updated successfully.")
      } else if (drawerState.mode === "create") {
        const newProduct = buildProductFromForm(values)
        setProducts((current) => [newProduct, ...current])
        toast.success("Master product added successfully.")
      }
      handleDrawerChange(false)
    })()
  }

  const productColumns = React.useMemo<DataTableColumn<ProductRow>[]>(
    () => [
      {
        key: "id",
        header: "Product ID",
        accessor: "id",
        cellClassName: "font-medium text-foreground",
      },
      {
        key: "name",
        header: "Product Name",
        render: (row) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.sku}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (row) => (
          <div className="space-y-1">
            <p>{row.category}</p>
            <p className="text-xs text-muted-foreground">{row.unit}</p>
          </div>
        ),
      },
      {
        key: "manufacturer",
        header: "Manufacturer",
        accessor: "manufacturer",
      },
      {
        key: "price",
        header: "Price",
        render: (row) => `₹${row.sellingPrice.toFixed(2)}`,
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
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cellClassName: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openDrawer("view", row)}
            >
              <Eye className="size-3.5" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openDrawer("edit", row)}
            >
              <PencilLine className="size-3.5" />
              Edit
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div>
      <MasterProductDrawer
        open={drawerState.open}
        onOpenChange={handleDrawerChange}
        control={control}
        onSubmit={(e) => {
          e.preventDefault()
          handleDrawerSubmit()
        }}
        mode={drawerState.mode}
      />

      <SectionCard
        title="Products"
        description="Master product listing with a reusable drawer flow for add, edit, and view operations."
        action={
          <Button type="button" onClick={() => openDrawer("create")}>
            <Plus className="size-4" />
            Add Product
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar values={filters} onChange={handleFilterChange}>
            <FilterBar.Select
              name="category"
              options={PRODUCT_CATEGORY_OPTIONS}
              placeholder="All Categories"
            />
            <FilterBar.Select
              name="status"
              options={PRODUCT_STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <FilterBar.Search
              name="search"
              placeholder="Search by product id, name, SKU, or manufacturer"
            />
          </FilterBar>

          <DataTable
            columns={productColumns}
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
            emptyDescription="Try changing category, status, or search terms to see matching master products."
          />
        </div>
      </SectionCard>
    </div>
  )
}

function getNextProductId(products: ProductRow[]) {
  const nextNumber =
    products.reduce((highest, product) => {
      const productNumber = Number(product.id.replace("PRD-", ""))

      return Number.isNaN(productNumber)
        ? highest
        : Math.max(highest, productNumber)
    }, 1000) + 1

  return `PRD-${String(nextNumber).padStart(4, "0")}`
}
