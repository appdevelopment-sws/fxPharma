export const SUPPLIER_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "companyName", label: "Company Name" },
  { key: "gstNumber", label: "GST Number" },
  { key: "contactPersonName", label: "Contact Person" },
  { key: "phone", label: "Phone" },
  { key: "isPreferred", label: "Preferred" },
  { key: "action", label: "Actions" },
]

export const INITIAL_SUPPLIER_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
}

export const SUPPLIER_FORM_INITIAL_DATA = {
  companyName: "",
  gstNumber: "",
  officeAddress: "",
  contactPersonName: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  isPreferred: false,
  autoGeneratePO: false,
  registrationDocuments: null,
}
