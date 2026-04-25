import { FORM_TYPE } from "@/constants/shared/form"

export const COMPOUNDING_BREADCRUMBS = [
  { title: "Pharmacy", href: "/super-admin/compounding" },
  { title: "Prescription Compounding", href: "/super-admin/compounding" },
]

export const INITIAL_COMPOUNDING_FILTERS = {
  page: 1,
  perPage: 10,
  search: "",
  patient: "",
  provider: "",
  status: "",
}

export const COMPOUNDING_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "compound_name", label: "Compound Name" },
  { key: "patient", label: "Patient" },
  { key: "provider", label: "Prescriber" },
  { key: "total_qty", label: "Total Qty" },
  { key: "action", label: "Actions" },
]

export const COMPOUNDING_FORM_INITIAL_DATA = {
  id: "",

  /* Prescription Details */
  compound_name: "Ketamine / Gabapentin Cream",
  dosage_form: "Cream",
  total_qty: "100",
  total_unit: "g",
  days_supply: "30",
  beyond_use_date: "180",
  beyond_use_unit: "Days",

  patient: "",
  provider: "",

  sig_directions:
    "Apply 1-2 pumps to affected area up to 4 times daily as needed for pain.",

  /* Ingredients */
  ingredients: [
    {
      ingredient: "Ketamine HCl",
      type: "Active",
      quantity: "10",
      unit: "%",
    },
    {
      ingredient: "Gabapentin",
      type: "Active",
      quantity: "5",
      unit: "%",
    },
    {
      ingredient: "VersaBase Cream",
      type: "Base",
      quantity: "QS",
      unit: "g",
    },
  ],

  total_compound_volume: "100 g",

  /* Preparation */
  instructions:
    "Enter step-by-step compounding instructions, mixing procedures, and equipment needed...",

  requires_homogenizer: false,
  requires_unguator: true,
  light_sensitive: false,
}

export const DOSAGE_FORM_OPTIONS = [
  { label: "Cream", value: "Cream" },
  { label: "Gel", value: "Gel" },
  { label: "Ointment", value: "Ointment" },
  { label: "Solution", value: "Solution" },
]

export const UNIT_OPTIONS = [
  { label: "g", value: "g" },
  { label: "mg", value: "mg" },
  { label: "ml", value: "ml" },
  { label: "%", value: "%" },
]

export const BUD_OPTIONS = [
  { label: "Days", value: "Days" },
  { label: "Weeks", value: "Weeks" },
  { label: "Months", value: "Months" },
]

export const INGREDIENT_TYPE_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Base", value: "Base" },
]

export const FORM_MODE = {
  CREATE: FORM_TYPE.CREATE,
  EDIT: FORM_TYPE.EDIT,
  VIEW: FORM_TYPE.VIEW,
}

export const COMPOUNDING_STATUS_COLORS = {
  ACTIVE: "success",
  DRAFT: "secondary",
}

export const COMPOUNDING_SAMPLE_DATA = [
  {
    id: "1",
    compound_name: "Ketamine / Gabapentin Cream",
    patient: "John Carter",
    provider: "Dr. Smith",
    total_qty: "100 g",
    status: "ACTIVE",
  },
  {
    id: "2",
    compound_name: "Diclofenac Pain Gel",
    patient: "Sarah Lee",
    provider: "Dr. Adams",
    total_qty: "60 g",
    status: "ACTIVE",
  },
  {
    id: "3",
    compound_name: "Hydrocortisone Ointment",
    patient: "Michael Ray",
    provider: "Dr. Watson",
    total_qty: "30 g",
    status: "DRAFT",
  },
]
