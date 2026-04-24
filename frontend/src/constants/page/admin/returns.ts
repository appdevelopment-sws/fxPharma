export const RETURN_COLUMNS = [
  { key: "return_id", label: "RETURN ID" },
  { key: "original_invoice", label: "ORIGINAL INVOICE" },
  { key: "customer_info", label: "CUSTOMER INFO" },
  { key: "return_value", label: "RETURN VALUE" },
  { key: "reason", label: "REASON" },
  { key: "status", label: "STATUS" },
  { key: "action", label: "ACTIONS" },
]

export const INITIAL_RETURN_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  reason: "all",
  status: "all",
}

export const RETURN_REASON_OPTIONS = [
  { label: "Wrong Item Dispensed", value: "wrong_item" },
  { label: "Doctor Changed Prescription", value: "doctor_changed" },
  { label: "Damaged Packaging", value: "damaged" },
  { label: "Near Expiry Date", value: "near_expiry" },
  { label: "Customer Changed Mind", value: "customer_changed" },
]

export const RETURN_STATUS_OPTIONS = [
  { label: "Refunded", value: "REFUNDED" },
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
]

export const REFUND_METHOD_OPTIONS = [
  { label: "Original Payment Method (UPI)", value: "upi" },
  { label: "Cash", value: "cash" },
  { label: "Store Credit", value: "store_credit" },
]
