// constants/page/super-admin/orders.ts

export const INITIAL_ORDER_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
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
