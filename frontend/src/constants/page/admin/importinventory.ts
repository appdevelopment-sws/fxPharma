import { FORM_TYPE } from "@/constants/shared/form"
import { MEDICINE_STOCK_FORM_INITIAL_DATA } from "@/constants/page/admin/inventory"

export const ACTIVE_MASTER_PRODUCT_STATUS = "CONTINUE"

export const INITIAL_MASTER_PRODUCT_IMPORT_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  status: ACTIVE_MASTER_PRODUCT_STATUS,
}

export const MEDICINE_STOCK_BREADCRUMBS = [
  { title: "Inventory", href: "/super-admin/medicine-stock" },
  { title: "Medicine Stock", href: "/super-admin/medicine-stock" },
]

export const INITIAL_MEDICINE_STOCK_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  category: "",
  status: "",
  medicineType: "all",
  formFactor: "",
  therapeuticCategory: "",
  manufacturer: "",
  rx_required: false,
  otc: false,
}

export const MEDICINE_IMPORT_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "medicine_details", label: "Medicine Details" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "action", label: "Import" },
]

export const MEDICINE_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "RX Required", value: "rx_required" },
  { label: "OTC (Over the Counter)", value: "otc" },
]

export const FORM_FACTOR_OPTIONS = [
  { label: "Tablet", value: "tablet", count: 1204 },
  { label: "Capsule", value: "capsule", count: 843 },
  { label: "Syrup/Suspension", value: "syrup", count: 452 },
  { label: "Injection", value: "injection", count: 321 },
  { label: "Drops", value: "drops", count: 189 },
  { label: "Cream/Ointment", value: "cream", count: 276 },
]

export const THERAPEUTIC_CATEGORY_OPTIONS = [
  { label: "Antibiotics", value: "antibiotics" },
  { label: "Analgesics", value: "analgesics" },
  { label: "Antacids", value: "antacids" },
  { label: "Antifungal", value: "antifungal" },
]

export const MANUFACTURER_OPTIONS = [
  {
    label: "GlaxoSmithKline Pharmaceuticals",
    value: "glaxosmithkline",
  },
  {
    label: "Sun Pharmaceutical Industries",
    value: "sun_pharma",
  },
  {
    label: "Cipla Ltd",
    value: "cipla",
  },
  {
    label: "Dr. Reddy's Laboratories",
    value: "dr_reddy",
  },
]

export const MEDICINE_STOCK_FORM_TYPE = [
  { label: "Tablet", value: FORM_TYPE.TABLET },
  { label: "Capsule", value: FORM_TYPE.CAPSULE },
  { label: "Syrup", value: FORM_TYPE.SYRUP },
  { label: "Injection", value: FORM_TYPE.INJECTION },
]

const getRelationLabel = (value: any, keys: string[]) => {
  if (!value) return ""

  if (typeof value === "string") return value

  for (const key of keys) {
    if (value?.[key]) {
      return value[key]
    }
  }

  return ""
}

export const mapMasterProductToInventoryDraft = (product: any) => ({
  ...MEDICINE_STOCK_FORM_INITIAL_DATA,
  id: "",
  imageUrl: product?.imageUrl || "",
  product_name: product?.name || "",
  status: product?.status || "CONTINUE",
  company: getRelationLabel(product?.brands, ["name"]) || product?.brands || "",
  manufacturer:
    getRelationLabel(product?.manufacturers, ["name"]) ||
    product?.manufacturers ||
    product?.manufacturer ||
    "",
  salt_composition: product?.salt || "",
  category: product?.categoryType || product?.category_type || "TAB",
  packing: "",
  unit_1st: "",
  unit_2nd: "",
  hsn_code:
    getRelationLabel(product?.hsn, ["hsncode", "code", "name"]) ||
    product?.hsnCode ||
    "",
  item_type: "NORMAL",
  color_type: product?.colorType || product?.color_type || "NORMAL",
  decimal: "NO",
  type: "NORMAL",
  local_tax: "Taxable",
  central_tax: "Taxable",
  is_narcotic: !!(product?.isNarcotic ?? product?.is_narcotic),
  is_schedule_h: !!(product?.isScheduleH ?? product?.is_schedule_h),
  is_schedule_h1: !!(product?.isScheduleH1 ?? product?.is_schedule_h1),
})
