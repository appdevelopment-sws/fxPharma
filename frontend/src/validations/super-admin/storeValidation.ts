import { z } from "zod"

import {
  CURRENCY_OPTIONS,
  STORE_CATEGORY_OPTIONS,
  STORE_VISIBILITY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/constants/page/super-admin/store"

const MAX_LOGO_SIZE = 2 * 1024 * 1024

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File

const requiredText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)

const optionalText = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""))

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^[0-9+()\s-]{7,20}$/, "Enter a valid phone number")

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")

const optionSchema = (
  label: string,
  options: Array<{ label: string; value: string }>
) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(
      (value) => options.some((option) => option.value === value),
      `Select a valid ${label.toLowerCase()}`
    )

export const createStoreFormSchema = (isEditMode: boolean) =>
  z.object({
    id: z.string().optional(),
    store_name: requiredText("Store name", 120).min(
      2,
      "Store name must be at least 2 characters"
    ),
    description: optionalText("Description", 500),
    store_category: optionSchema("Store category", STORE_CATEGORY_OPTIONS),
    store_logo: z
      .any()
      .optional()
      .nullable()
      .refine(
        (value) => !value || typeof value === "string" || isFile(value),
        "Upload a valid image file"
      )
      .refine(
        (value) => !isFile(value) || value.type.startsWith("image/"),
        "Store logo must be an image"
      )
      .refine(
        (value) => !isFile(value) || value.size <= MAX_LOGO_SIZE,
        "Store logo must be 2MB or smaller"
      ),
    store_visibility: optionSchema(
      "Store visibility",
      STORE_VISIBILITY_OPTIONS
    ),
    subscription_plan_id: z.string().min(1, "Select a subscription plan"),
    first_name: requiredText("First name", 60).regex(
      /^[A-Za-z][A-Za-z\s'.-]*$/,
      "Enter a valid first name"
    ),
    last_name: requiredText("Last name", 60).regex(
      /^[A-Za-z][A-Za-z\s'.-]*$/,
      "Enter a valid last name"
    ),
    email: requiredText("Email address", 120).email(
      "Enter a valid email address"
    ),
    phone: phoneSchema,
    login_email: requiredText("Login email", 120).email(
      "Enter a valid login email"
    ),
    password: isEditMode
      ? z.union([z.literal(""), passwordSchema]).optional()
      : passwordSchema,
    gst_number: optionalText("GST number", 15).refine(
      (value) => !value || /^[0-9A-Za-z]{15}$/.test(value),
      "GST number must be 15 alphanumeric characters"
    ),
    license_number: optionalText("License number", 40).refine(
      (value) => !value || /^[A-Za-z0-9/\s-]{3,40}$/.test(value),
      "Enter a valid license number"
    ),
    street_address: requiredText("Street address", 180),
    city: requiredText("City", 80),
    state: requiredText("State", 80),
    zip_code: requiredText("ZIP / postal code", 20).regex(
      /^[A-Za-z0-9\s-]{3,20}$/,
      "Enter a valid ZIP / postal code"
    ),
    country: requiredText("Country", 80),
    timezone: optionSchema("Timezone", TIMEZONE_OPTIONS),
    currency: optionSchema("Currency", CURRENCY_OPTIONS),
    role_key: z.string().min(1, "Role is required"),
    permissions: z.array(z.string()).default([]),
  })

export type StoreFormSchema = z.infer<ReturnType<typeof createStoreFormSchema>>
