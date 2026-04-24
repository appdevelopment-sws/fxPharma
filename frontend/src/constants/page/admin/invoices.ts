export const INVOICE_COLUMNS = [
  { key: "invoice_details", label: "INVOICE DETAILS" },
  { key: "customer_info", label: "CUSTOMER INFO" },
  { key: "items", label: "ITEMS" },
  { key: "total_amount", label: "TOTAL AMOUNT" },
  { key: "payment_mode", label: "PAYMENT MODE" },
  { key: "status", label: "STATUS" },
  { key: "action", label: "ACTIONS" },
]

export const INITIAL_INVOICE_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  payment_mode: "all",
  status: "all",
}

export const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
]

export const INVOICE_STATUS_OPTIONS = [
  { label: "Paid", value: "PAID" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Cancelled", value: "CANCELLED" },
]
