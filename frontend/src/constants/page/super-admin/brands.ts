// filters
export const INITIAL_BRAND_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  status: "",
}

// table columns
export const BRAND_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "brand_info", label: "Brand Info" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

// form initial data
export const BRAND_FORM_INITIAL_DATA = {
  name: "",
  description: "",
  logo: null as string | File | null,
  status: "ACTIVE", // ACTIVE | INACTIVE
}
