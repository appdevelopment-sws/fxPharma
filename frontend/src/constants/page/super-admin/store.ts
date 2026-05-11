import { FORM_TYPE } from "@/constants/shared/form"

export const STORE_BREADCRUMBS = [
  { title: "Store Management", href: "/super-admin/stores" },
  { title: "Create Store", href: "/super-admin/stores/create" },
]

export const INITIAL_STORE_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  status: "",
  subscriptionId: "",
}

export const STORE_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "store_name", label: "Store Name" },
  { key: "owner", label: "Owner" },
  { key: "plan", label: "Subscription Plan" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

export const STORE_FORM_INITIAL_DATA = {
  id: "",
  store_name: "",
  description: "",
  store_category: "",
  store_logo: null,

  store_visibility: "ACTIVE",

  subscription_plan_id: "2",

  first_name: "",
  last_name: "",
  email: "",
  phone: "",

  login_email: "",
  password: "",
  gst_number: "",
  license_number: "",

  timezone: "EST",
  currency: "USD",
  role_key: "ORG_ADMIN",
  permissions: [] as string[],

  street_address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "United States",
}

export const FORM_MODE = {
  CREATE: FORM_TYPE.CREATE,
  EDIT: FORM_TYPE.EDIT,
  VIEW: FORM_TYPE.VIEW,
}

export const STORE_STATUS_COLORS = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "danger",
}

export const STORE_VISIBILITY_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

export const TIMEZONE_OPTIONS = [
  {
    label: "(UTC-05:00) Eastern Time (US & Canada)",
    value: "EST",
  },
  {
    label: "(UTC+05:30) India Standard Time",
    value: "IST",
  },
  {
    label: "(UTC+00:00) London",
    value: "GMT",
  },
]

export const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "INR (₹)", value: "INR" },
  { label: "EUR (€)", value: "EUR" },
]

export const STORE_CATEGORY_OPTIONS = [
  { label: "Retail", value: "RETAIL" },
  { label: "Wholesale", value: "WHOLESALE" },
  { label: "Hospital", value: "HOSPITAL" },
  { label: "Clinic", value: "CLINIC" },
]

export const STORE_SUBSCRIPTION_OPTIONS = [
  {
    id: "1",
    name: "Basic Monthly",
    users: "2 Staff Users",
    stores: "1 Store",
    price: "₹499",
    billing: "/month",
    badge: "",
  },
  {
    id: "2",
    name: "Standard",
    users: "5 Staff Users",
    stores: "2 Stores",
    price: "₹1,299",
    billing: "/month",
    badge: "POPULAR",
  },
  {
    id: "3",
    name: "Premium Yearly",
    users: "Unlimited Users",
    stores: "10 Stores",
    price: "₹9,999",
    billing: "/year",
    badge: "",
  },
]

export const STORE_SAMPLE_DATA = [
  {
    id: "1",
    store_name: "Medicare Plus Pharmacy",
    owner: "John Carter",
    plan: "Standard",
    city: "New York",
    status: "ACTIVE",
  },
  {
    id: "2",
    store_name: "Apollo Medicos",
    owner: "Harsh Raj",
    plan: "Premium Yearly",
    city: "Patna",
    status: "ACTIVE",
  },
  {
    id: "3",
    store_name: "HealthCare Drugs",
    owner: "Sarah Smith",
    plan: "Basic Monthly",
    city: "Chicago",
    status: "INACTIVE",
  },
]
