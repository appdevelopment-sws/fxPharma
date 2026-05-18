export const BRANCHES_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "branch_name", label: "Branch Name" },
  { key: "address", label: "Address" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

export const INITIAL_BRANCHES_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

export const BRANCH_FORM_INITIAL_DATA = {
  branch_name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  status: "ACTIVE",
}
