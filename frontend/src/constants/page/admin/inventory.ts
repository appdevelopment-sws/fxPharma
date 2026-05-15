import { FORM_TYPE } from "@/constants/shared/form"

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
}

export const MEDICINE_STOCK_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "medicine_salt", label: "Medicine & Salt" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

export const MEDICINE_STOCK_FORM_INITIAL_DATA = {
  id: "",

  /* Product Identification */
  product_name: "",
  status: "CONTINUE",
  company: "",
  salt_composition: "",
  category: "TAB",

  /* Classification & Units */
  packing: "",
  unit_1st: "",
  unit_2nd: "",
  pack_qty_1: "",
  pack_qty_2: "",
  pack_qty_3: "",
  hsn_code: "",
  temperature_limit: "",
  item_type: "NORMAL",
  color_type: "NORMAL",
  decimal: "NO",
  type: "NORMAL",

  /* Pricing & Taxation */
  local_tax: "Taxable",
  central_tax: "Taxable",
  sgst: "",
  cgst: "",
  mrp: "",
  purchase_rate: "",
  cost_unit: "",
  igst: "",
  rate_a: "",
  rate_b: "",
  rate_c: "",
  cer: "",

  /* Inventory Thresholds */
  minimum_qty: "0",
  maximum_qty: "0",
  reorder_qty: "0",
  days_limit: "",
  conv_stri: "",
  conv_cas: "",
  manufacturer: "",
  /* Discounts & Margins */
  volume_discount: "",
  item_discount: "",
  maximum_discount: "",
  minimum_margin: "",
  special_discount: "",
  purchase_discount: "",

  /* Flags */
  is_narcotic: false,
  is_schedule_h: false,
  is_schedule_h1: false,
  hide_product: false,
  negative_stock: false,
  edit_rates: true,
}

export const PRODUCT_STATUS_OPTIONS = [
  { label: "CONTINUE", value: "CONTINUE" },
  { label: "DISCONTINUE", value: "DISCONTINUE" },
]

export const CATEGORY_OPTIONS = [
  { label: "TAB", value: "TAB" },
  { label: "CAP", value: "CAP" },
  { label: "SYRUP", value: "SYRUP" },
  { label: "INJ", value: "INJ" },
]

export const PACKAGING_TYPE_OPTIONS = [
  { label: "Strip", value: "strip" },
  { label: "Bottle", value: "bottle" },
  { label: "Sachet", value: "sachet" },
  { label: "Vial", value: "vial" },
  { label: "Ampoule", value: "ampoule" },
  { label: "Tube", value: "tube" },
  { label: "Pouch", value: "pouch" },
  { label: "Blister Pack", value: "Blister Pack" },
]
export const BOX_TYPE_OPTIONS = [{ label: "Box", value: "box" }]

export const STRIP_CONTENT_OPTIONS = [
  { label: "Tablets", value: "Tablets" },
  { label: "Capsules", value: "Capsules" },
]

export const TAX_OPTIONS = [
  { label: "Taxable", value: "Taxable" },
  { label: "Non Taxable", value: "Non Taxable" },
]

export const NORMAL_OPTIONS = [{ label: "NORMAL", value: "NORMAL" }]

export const YES_NO_OPTIONS = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
]

export const FORM_MODE = {
  CREATE: FORM_TYPE.CREATE,
  EDIT: FORM_TYPE.EDIT,
  VIEW: FORM_TYPE.VIEW,
}

export const STOCK_STATUS_COLORS = {
  CONTINUE: "success",
  DISCONTINUE: "danger",
}

export const MEDICINE_STOCK_SAMPLE_DATA = [
  {
    id: "1",
    product_name: "CROSIN 20GM",
    medicine_salt: "CROSIN 20GM / CETIRIZINE",
    category: "TAB",
    total_stock: 240,
    batches: 3,
    status: "CONTINUE",
  },
  {
    id: "2",
    product_name: "DOLO 650",
    medicine_salt: "DOLO 650 / PARACETAMOL",
    category: "TAB",
    total_stock: 520,
    batches: 5,
    status: "CONTINUE",
  },
  {
    id: "3",
    product_name: "AUGMENTIN",
    medicine_salt: "AUGMENTIN / AMOXICILLIN",
    category: "CAP",
    total_stock: 110,
    batches: 2,
    status: "CONTINUE",
  },
]
