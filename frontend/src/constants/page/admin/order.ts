// constants/page/super-admin/orders.ts

export const INITIAL_ORDER_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  supplier: "",
  status: "",
  unit: "",
}

export const ORDER_COLUMNS = [
  { key: "product", label: "Product Details" },
  { key: "qty", label: "Ord Qty" },
  { key: "free", label: "Free" },
  { key: "batch", label: "Batch No." },
  { key: "expiry", label: "Expiry" },
  { key: "purchase", label: "Purchase" },
  { key: "mrp", label: "MRP/Sell" },
  { key: "rate1", label: "Rate 1" },
  { key: "rate2", label: "Rate 2" },
  { key: "rate3", label: "Rate 3" },
  { key: "action", label: "Actions" },
]

export const SUPPLIER_OPTIONS = [
  { label: "Apollo Distributors", value: "apollo_distributors" },
  { label: "MedLife Wholesale", value: "medlife_wholesale" },
]

export const ORDER_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING" },
  { label: "Sent", value: "SENT" },
  { label: "Delivered", value: "DELIVERED" },
]

export const UNIT_OPTIONS = [
  { label: "Strips", value: "strips" },
  { label: "Box", value: "box" },
  { label: "Bottle", value: "bottle" },
  { label: "Piece", value: "piece" },
]

export const SUGGESTED_ORDER_ITEMS = [
  {
    name: "Amoxicillin 500mg",
    status: "Out of Stock",
    note: "Min Req: 100",
  },
  {
    name: "Vitamin C 1000mg",
    status: "Critically Low",
    note: "Curr: 15 / Min: 50",
  },
  {
    name: "Augmentin 625 Duo",
    status: "Low Stock",
    note: "Predicted demand ↑",
  },
]

export const SUPPLIER_ACCOUNT_SUMMARY = {
  supplier: "Apollo Distributors",
  paid: 4000,
  remaining: 1400,
  total: 5400,
}

export const ORDER_FORM_INITIAL_DATA = {
  supplierId: "",
  status: "DRAFT",
  items: [],
}

export const RECENT_ORDERS = [
  {
    date: "Oct 12, 2023",
    amount: 450,
    status: "Delivered",
  },
  {
    date: "Oct 05, 2023",
    amount: 1200.5,
    status: "Delivered",
  },
]
