export const EXPIRY_COLUMNS = [
  { key: "product_details", label: "PRODUCT DETAILS" },
  { key: "batch_info", label: "BATCH INFO" },
  { key: "expiry_timeline", label: "EXPIRY TIMELINE" },
  { key: "stock_level", label: "STOCK LEVEL" },
  { key: "value", label: "VALUE (₹)" },
  { key: "status", label: "STATUS" },
  { key: "action", label: "ACTIONS" },
]

export const INITIAL_EXPIRY_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  timeline: "all",
  status: "all",
}

export const EXPIRY_STATUS_OPTIONS = [
  { label: "Expired Only", value: "EXPIRED" },
  { label: "Near Expire", value: "EXPIRING_SOON" },

]

export const SUPPLIER_OPTIONS = [
  { label: "Supplier 1", value: "supplier1" },
  { label: "Supplier 2", value: "supplier2" },
  { label: "Supplier 3", value: "supplier3" },
]

export const CATEGORY_OPTIONS = [
  { label: "Tablets", value: "tablets" },
  { label: "Capsules", value: "capsules" },
  { label: "Syrups", value: "syrups" },
  { label: "Injections", value: "injections" },
]

