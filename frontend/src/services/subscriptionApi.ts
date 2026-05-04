import { api } from "./api"

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM"

export type Plan = {
  id: string
  key: string
  name: string
  short_description?: string | null
  description?: string[] | null
  price: number
  currency: string
  billing_type: BillingCycle
  duration_days: number
  max_staff_users: number
  max_stores: number
  storage_limit_gb: number
  is_popular: boolean
  badge_text?: string | null
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  api_access: boolean
  white_labeling: boolean
  priority_support: boolean
  inventory: boolean
  billing_pos: boolean
  staff_management: boolean
  suppliers: boolean
  analytics: boolean
  prescriptions: boolean
  featureIds: string[]
  createdAt?: string
  updatedAt?: string
}

export type PlanFormValues = {
  name: string
  short_description?: string | null
  slug?: string // maps to key
  price: string | number
  billing_type: BillingCycle
  trial_period_days?: string | number
  setup_fee?: string | number
  max_staff_users: string | number
  max_stores: string | number
  storage_limit_gb?: string | number
  api_access?: boolean
  white_labeling?: boolean
  priority_support?: boolean
  inventory?: boolean
  billing_pos?: boolean
  staff_management?: boolean
  suppliers?: boolean
  analytics?: boolean
  prescriptions?: boolean
  is_popular?: boolean
  badge_text?: string | null
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  featureIds?: string[]
}

export type GetPlansResponse = {
  data: Plan[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const BASE_URL = "/plans"

const mapFormToApi = (data: PlanFormValues) => {
  return {
    key: data.slug || data.name.toUpperCase().replace(/\s+/g, "_"),
    name: data.name,
    shortDescription: data.short_description,
    price: Number(data.price),
    billingCycle: data.billing_type,
    durationDays: data.billing_type === "YEARLY" ? 365 : 30,
    maxStaff: Number(data.max_staff_users) || 1,
    maxBranches: Number(data.max_stores) || 1,
    storageLimit: (Number(data.storage_limit_gb) || 1) * 1024,
    isPopular: data.is_popular,
    badgeText: data.badge_text,
    status: data.status === "ACTIVE" ? 1 : 0,

    featureIds: data.featureIds || [],
  }
}

const mapApiToPlan = (data: any): Plan => {
  const adv = data.advancedFeatures || {}
  const mods = adv.modules || {}

  // Format for the table accessors in Subscription.tsx
  const plan = {
    id: data.id,
    key: data.key,
    name: data.name,
    short_description: data.shortDescription,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    billing_type: data.billingCycle,
    duration_days: data.durationDays,
    max_staff_users: data.maxStaff,
    max_stores: data.maxBranches,
    storage_limit_gb: data.storageLimit / 1024,
    is_popular: data.isPopular,
    badge_text: data.badgeText,
    status: data.status, // Keep as integer (1/0)
    api_access: !!adv.apiAccess,
    white_labeling: !!adv.whiteLabeling,
    priority_support: !!adv.prioritySupport,
    inventory: !!mods.inventory,
    billing_pos: !!mods.billingPos,
    staff_management: !!mods.staffManagement,
    suppliers: !!mods.suppliers,
    analytics: !!mods.analytics,
    prescriptions: !!mods.prescriptions,
    featureIds: (data.features || []).map((f: any) => f.featureId),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,

    // Virtual fields for Subscription.tsx table accessors
    plan_details: data.name,
    pricing: `₹${Number(data.price).toLocaleString()}/${data.billingCycle}`,
    usage_limits: `${data.maxStaff} Users, ${data.maxBranches} Stores`,
    subscribers: 0,
  }

  return plan as any
}

const SubscriptionApi = {
  getPlans: async (params?: any): Promise<GetPlansResponse> => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: (res.data ?? []).map(mapApiToPlan),
      meta: res.meta,
    }
  },

  getPlanById: async (id: string): Promise<{ data: Plan }> => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: mapApiToPlan(res.data) }
  },

  createPlan: async (data: PlanFormValues): Promise<{ data: Plan }> => {
    const apiData = mapFormToApi(data)
    const res = await api.post<any>(BASE_URL, apiData)
    return { data: mapApiToPlan(res.data) }
  },

  updatePlan: async (
    id: string,
    data: Partial<PlanFormValues>
  ): Promise<{ data: Plan }> => {
    const apiData = mapFormToApi(data as PlanFormValues)
    const res = await api.patch<any>(`${BASE_URL}/${id}`, apiData)
    return { data: mapApiToPlan(res.data) }
  },

  updateStatus: async (id: string, status: string): Promise<{ data: Plan }> => {
    const statusInt = status === "ACTIVE" ? 1 : 0
    const res = await api.patch<any>(`${BASE_URL}/${id}/status`, {
      status: statusInt,
    })
    return { data: mapApiToPlan(res.data) }
  },

  deletePlan: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default SubscriptionApi
