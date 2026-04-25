import { FORM_TYPE } from "@/constants/shared/form"

export const MANAGE_SUBSCRIPTION_BREADCRUMBS = [
  { title: "Subscription", href: "/super-admin/manage-subscription" },
  { title: "Pricing Tiers", href: "/super-admin/manage-subscription" },
]

export const INITIAL_SUBSCRIPTION_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  status: "",
}

export const MANAGE_SUBSCRIPTION_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "plan_details", label: "Plan Details" },
  { key: "pricing", label: "Pricing" },
  { key: "usage_limits", label: "Usage Limits" },
  { key: "subscribers", label: "Subscribers" },
  { key: "status", label: "Status" },
  { key: "action", label: "Actions" },
]

export const MANAGE_SUBSCRIPTION_FORM_INITIAL_DATA = {
  id: "",
  name: "",
  short_description: "",
  slug: "",

  // Pricing & Billing
  price: "",
  billing_type: "MONTHLY",
  trial_period_days: "",
  setup_fee: "",

  // Usage Limits
  max_staff_users: "",
  max_stores: "",
  storage_limit_gb: "",

  // Advanced Features
  api_access: false,
  white_labeling: false,
  priority_support: false,

  // Core Modules
  inventory: true,
  billing_pos: true,
  staff_management: true,
  suppliers: true,
  analytics: false,
  prescriptions: false,

  // Display & Status
  is_popular: false,
  badge_text: "",
  status: "ACTIVE",
}

export const BILLING_TYPE_OPTIONS = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Quarterly", value: "QUARTERLY" },
]

export const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
]

export const BADGE_OPTIONS = [
  { label: "None", value: "" },
  { label: "Most Popular", value: "MOST POPULAR" },
  { label: "Recommended", value: "RECOMMENDED" },
  { label: "Best Value", value: "BEST VALUE" },
]

export const FORM_MODE = {
  CREATE: FORM_TYPE.CREATE,
  EDIT: FORM_TYPE.EDIT,
  VIEW: FORM_TYPE.VIEW,
}

export const SUBSCRIPTION_STATUS_COLORS = {
  ACTIVE: "success",
  INACTIVE: "warning",
  ARCHIVED: "secondary",
}

export const SUBSCRIPTION_SAMPLE_DATA = [
  {
    id: "1",
    name: "Basic Monthly",
    short_description: "Essential tools for single store pharmacies.",
    price: 499,
    billing_type: "MONTHLY",
    trial_period_days: 7,
    setup_fee: 0,

    max_staff_users: 2,
    max_stores: 1,
    storage_limit_gb: 10,

    api_access: false,
    white_labeling: false,
    priority_support: false,

    inventory: true,
    billing_pos: true,
    staff_management: false,
    suppliers: false,
    analytics: false,
    prescriptions: false,

    subscribers: 842,
    mrr: "₹4.2L",
    is_popular: false,
    status: "ACTIVE",
  },

  {
    id: "2",
    name: "Standard Monthly",
    short_description:
      "Perfect for growing pharmacies with multiple staff members.",
    price: 1299,
    billing_type: "MONTHLY",
    trial_period_days: 14,
    setup_fee: 0,

    max_staff_users: 5,
    max_stores: 2,
    storage_limit_gb: 50,

    api_access: false,
    white_labeling: false,
    priority_support: false,

    inventory: true,
    billing_pos: true,
    staff_management: true,
    suppliers: true,
    analytics: false,
    prescriptions: false,

    subscribers: 315,
    mrr: "₹4.0L",
    is_popular: true,
    badge_text: "MOST POPULAR",
    status: "ACTIVE",
  },

  {
    id: "3",
    name: "Premium Yearly",
    short_description: "All features included for enterprise scale chains.",
    price: 9999,
    billing_type: "YEARLY",
    trial_period_days: 30,
    setup_fee: 0,

    max_staff_users: "Unlimited",
    max_stores: 10,
    storage_limit_gb: 500,

    api_access: true,
    white_labeling: true,
    priority_support: true,

    inventory: true,
    billing_pos: true,
    staff_management: true,
    suppliers: true,
    analytics: true,
    prescriptions: true,

    subscribers: 91,
    mrr: "₹75K",
    is_popular: false,
    status: "ACTIVE",
  },

  {
    id: "4",
    name: "Legacy Early Bird",
    short_description: "Grandfathered plan from 2022 launch.",
    price: 299,
    billing_type: "MONTHLY",
    trial_period_days: 0,
    setup_fee: 0,

    max_staff_users: 1,
    max_stores: 1,
    storage_limit_gb: 5,

    api_access: false,
    white_labeling: false,
    priority_support: false,

    inventory: true,
    billing_pos: false,
    staff_management: false,
    suppliers: false,
    analytics: false,
    prescriptions: false,

    subscribers: 42,
    mrr: "₹12K",
    is_popular: false,
    status: "ARCHIVED",
  },
]
