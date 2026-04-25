import { FORM_TYPE } from "@/constants/shared/form"

export const MASTER_PRODUCT_BREADCRUMBS = [
  { title: "Products Directory", href: "/super-admin/master-products" },
  { title: "Master Products", href: "/super-admin/master-products" },
]

export const INITIAL_PRODUCT_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  companyId: "",
  productTypeId: "",
  hsnCodeId: "",
}

export const MASTER_PRODUCT_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "name", label: "Product Name" },
  { key: "salt", label: "Salt Composition" },
  { key: "company", label: "Company" },
  { key: "product_type", label: "Type" },
  { key: "hsn", label: "HSN Code" },
  { key: "action", label: "Actions" },
]

export const MASTER_PRODUCT_FORM_INITIAL_DATA = {
  name: "",
  industry_segment: "1",
  category_id: "",
  brand_id: "",
  manufacturer_id: "",
  salt_id: "",
  category_type: "TAB",
  status: "CONTINUE",
  hsn_code_id: "",
  color_type: "NORMAL",
  is_narcotic: false,
  is_schedule_h: false,
  is_schedule_h1: false,
  barcodes: [{ value: "" }],
  image_url: null as string | File | null,
}

export const INDUSTRY_SEGMENT_OPTIONS = [
  { label: "Medicine (Pharma)", value: "1" },
]

export const CATEGORY_TYPE_OPTIONS = [
  { label: "TAB", value: "TAB" },
  { label: "CAP", value: "CAP" },
  { label: "SYP", value: "SYP" },
  { label: "INJ", value: "INJ" },
]

export const PRODUCT_STATUS_OPTIONS = [
  { label: "CONTINUE", value: "CONTINUE" },
  { label: "DISCONTINUE", value: "DISCONTINUE" },
]

export const COLOR_TYPE_OPTIONS = [
  { label: "NORMAL", value: "NORMAL" },
  { label: "SCHEDULE H", value: "SCHEDULE_H" },
  { label: "SCHEDULE H1", value: "SCHEDULE_H1" },
  { label: "NARCOTIC", value: "NARCOTIC" },
]
