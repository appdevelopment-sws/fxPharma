// constants/page/super-admin/categories.ts

export const INITIAL_CATEGORY_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

export const CATEGORY_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "category_info", label: "Category Info" },
  { key: "parent", label: "Parent" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

export const CATEGORY_FORM_INITIAL_DATA = {
  name: "",
  parent_id: "",
  description: "",
  status: "ACTIVE",
}

export const CATEGORY_FORM_DEFAULT_VALUES = {
  name: "",
  parent_id: "",
  description: "",
  status: "ACTIVE",
}
