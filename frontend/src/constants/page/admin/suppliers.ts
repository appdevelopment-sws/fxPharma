export const SUPPLIER_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "company_name", label: "Company Name" },
  { key: "gstin", label: "GST Number" },
  { key: "contact_person", label: "Contact Person" },
  { key: "phone", label: "Phone" },
  { key: "is_preferred", label: "Preferred" },
  { key: "action", label: "Actions" },
]

export const INITIAL_SUPPLIER_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

export const SUPPLIER_FORM_INITIAL_DATA = {
  company_name: "",
  gstin: "",
  address: "",
  contact_person: "",
  email: "",
  phone: "",
  whatsapp: "",
  is_preferred: false,
  auto_generate_po: false,
  registration_docs: null,
}
