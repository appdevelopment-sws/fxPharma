import { Eye, PencilLine, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DataTableColumn } from "@/components/data-table"
import type {
  GetProductsResponse,
  MasterProduct,
  MasterProductReferences,
} from "@/services/masterProductApi"
import type { ColumnActions, Mode } from "@/constants/constant"

export type ProductFilters = {
  companyId: string
  productTypeId: string
  hsnCodeId: string
  search: string
  page: number
  limit: number
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  companyId: "",
  productTypeId: "",
  hsnCodeId: "",
  search: "",
  page: 1,
  limit: 10,
}

const toOption = (value: string | number, label: string) => ({
  value: String(value),
  label,
})

export const getMasterProductReferenceOptions = (
  references?: MasterProductReferences
) => ({
  companyOptions: (references?.companies ?? []).map((company) =>
    toOption(
      company.id,
      company.gstin ? `${company.name} (${company.gstin})` : company.name
    )
  ),
  productTypeOptions: (references?.productTypes ?? []).map((productType) =>
    toOption(productType.id, `${productType.name} (${productType.unit_type})`)
  ),
  hsnOptions: (references?.hsnCodes ?? []).map((hsnCode) =>
    toOption(hsnCode.id, hsnCode.code)
  ),
})

export const getMasterProductTablePagination = (
  productsData: GetProductsResponse | undefined,
  pageSize: number
) => {
  const totalRecords =
    productsData?.meta?.total ?? productsData?.data.length ?? 0
  const lastPage =
    productsData?.meta?.pages ?? Math.max(1, Math.ceil(totalRecords / pageSize))

  return {
    totalRecords,
    lastPage,
  }
}

export const createHsnColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): DataTableColumn<MasterProduct>[] => [
  {
    key: "id",
    header: "ID",
    accessor: "id",
    cellClassName: "font-medium text-foreground",
  },
  {
    key: "name",
    header: "Product",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-foreground">{row.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.generic_name || "-"}
        </p>
      </div>
    ),
  },
  {
    key: "brand",
    header: "Brand / Strength",
    render: (row) => (
      <div className="space-y-1">
        <p>{row.brand_name || "-"}</p>
        <p className="text-xs text-muted-foreground">{row.strength || "-"}</p>
      </div>
    ),
  },
  {
    key: "company",
    header: "Company",
    render: (row) => row.company?.name || `#${row.company_id}`,
  },
  {
    key: "productType",
    header: "Product Type",
    render: (row) => row.product_type?.name || `#${row.product_type_id}`,
  },
  {
    key: "hsn",
    header: "HSN",
    render: (row) => row.hsnCode?.code || `#${row.hsnCodeId}`,
  },
  {
    key: "schedule",
    header: "Schedule",
    render: (row) => row.scheduleType || "-",
  },
  {
    key: "rx",
    header: "Rx",
    render: (row) => (row.isPrescriptionRequired ? "Yes" : "No"),
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
          onClick={() => onView(row)}
        >
          <Eye className="size-3.5" />
          View
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(row)}
        >
          <PencilLine className="size-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDelete(row)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    ),
  },
]
