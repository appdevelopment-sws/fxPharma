import { api } from "./api"

export type Store = {
  id: string
  store_name: string
  description?: string | null
  store_category?: string | null
  store_logo?: string | null
  status: "ACTIVE" | "INACTIVE"
  first_name: string
  last_name: string
  email: string
  phone: string
  login_email: string
  gst_number?: string | null
  license_number?: string | null
  street_address: string
  city: string
  state: string
  zip_code: string
  country: string
  timezone?: string | null
  currency?: string | null
  mainBranchId?: string | null
  subscription_plan_id?: string | null
  plan?: {
    id: string
    name: string
    [key: string]: any
  } | null
  role_key?: string | null
  role_name?: string | null
  permissions?: string[]
  owner?: {
    firstName?: string
    lastName?: string
    email?: string
    mobile?: string
    role?: {
      key: string
      name: string
    } | null
    permissions?: Array<{
      granted: boolean
      permission?: {
        key: string
        name: string
      } | null
    }>
  }
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type StoreFormValues = {
  store_name: string
  description?: string | null
  store_category?: string | null
  store_logo?: string | null
  store_visibility?: "ACTIVE" | "INACTIVE"
  first_name: string
  last_name: string
  email: string
  phone: string
  login_email: string
  password?: string
  gst_number?: string | null
  license_number?: string | null
  street_address: string
  city: string
  state: string
  zip_code: string
  country: string
  timezone?: string | null
  currency?: string | null
  subscription_plan_id?: string | null
  isActive?: boolean
  role_key?: string
  permissions?: string[]
}

export type StorePermissionMeta = {
  key: string
  name: string
  description?: string | null
}

export type StoreRoleMeta = {
  key: string
  name: string
  description?: string | null
  permissions: StorePermissionMeta[]
}

export type StoreFormMeta = {
  roles: StoreRoleMeta[]
  permissions: StorePermissionMeta[]
  defaultRoleKey: string
}

export type GetStoresResponse = {
  data: Store[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const BASE_URL = "/storelist"

const mapFormToApi = (data: StoreFormValues) => {
  return {
    storeName: data.store_name,
    description: data.description,
    category: data.store_category,
    logo: data.store_logo,
    status: data.store_visibility || "ACTIVE",
    ownerFirstName: data.first_name,
    ownerLastName: data.last_name,
    ownerEmail: data.email,
    ownerPhone: data.phone,
    loginEmail: data.login_email,
    password: data.password,
    gstNo: data.gst_number,
    licenseNo: data.license_number,
    streetAddress: data.street_address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    country: data.country,
    timezone: data.timezone,
    currency: data.currency,
    planId: data.subscription_plan_id,
    isActive: data.isActive,
    roleKey: data.role_key,
    permissions: data.permissions ?? [],
  }
}

const mapApiToStore = (data: any): Store => {
  return {
    id: data.id,
    store_name: data.storeName,
    description: data.description,
    store_category: data.category,
    store_logo: data.logo,
    status: data.status,
    first_name: data.owner?.firstName || data.ownerFirstName,
    last_name: data.owner?.lastName || data.ownerLastName,
    email: data.owner?.email || data.ownerEmail,
    phone: data.owner?.mobile || data.ownerPhone,
    login_email: data.owner?.email || data.loginEmail,
    gst_number: data.gstNo,
    license_number: data.licenseNo,
    street_address: data.streetAddress,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    country: data.country,
    timezone: data.timezone,
    currency: data.currency,
    mainBranchId: data.mainBranchId,
    subscription_plan_id: data.planId,
    plan: data.plan,
    role_key: data.role_key || data.roleKey || data.owner?.role?.key,
    role_name: data.owner?.role?.name,
    permissions:
      data.owner?.permissions
        ?.filter((permission: any) => permission.granted)
        .map((permission: any) => permission.permission?.key)
        .filter(Boolean) ?? [],
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

const StoreListApi = {
  getStores: async (params?: any): Promise<GetStoresResponse> => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: (res.data ?? []).map(mapApiToStore),
      meta: res.meta,
    }
  },

  getStoreById: async (id: string): Promise<{ data: Store }> => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: mapApiToStore(res.data) }
  },

  getStoreFormMeta: async (): Promise<{ data: StoreFormMeta }> => {
    const res = await api.get<any>(`${BASE_URL}/meta`)
    return { data: res.data }
  },

  createStore: async (data: StoreFormValues): Promise<{ data: Store }> => {
    const apiData = mapFormToApi(data)
    const res = await api.post<any>(BASE_URL, apiData)
    return { data: mapApiToStore(res.data) }
  },

  updateStore: async (
    id: string,
    data: StoreFormValues
  ): Promise<{ data: Store }> => {
    const apiData = mapFormToApi(data)
    const res = await api.put<any>(`${BASE_URL}/${id}`, apiData)
    return { data: mapApiToStore(res.data) }
  },

  updateStatus: async (
    id: string,
    isActive: boolean
  ): Promise<{ data: Store }> => {
    const res = await api.patch<any>(`${BASE_URL}/${id}/status`, { isActive })
    return { data: mapApiToStore(res.data) }
  },

  deleteStore: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}

export default StoreListApi
