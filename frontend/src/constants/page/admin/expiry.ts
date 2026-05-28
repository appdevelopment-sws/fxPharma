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
  status: "all",
  category: "all",
}

export const EXPIRY_STATUS_OPTIONS = [
  { label: "All Stock", value: "all" },
  { label: "Expired Only", value: "EXPIRED" },
  { label: "Expiring < 15 Days", value: "EXPIRING_15" },
  { label: "Expiring < 30 Days", value: "EXPIRING_30" },
  { label: "Expiring < 90 Days", value: "EXPIRING_90" },
  { label: "Healthy Stock", value: "ACTIVE" },
]
