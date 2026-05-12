import { api } from "./api"

const BASE_URL = "/compound"

export interface CompoundingIngredient {
  id?: string
  name: string
  type: string
  quantity: string | number
  unit: string
}

export interface CompoundingFormValues {
  id?: string
  name: string
  dosageForm: string
  totalQty: string | number
  totalQtyUnit: string
  daysSupply: string | number
  budValue: string | number
  budUnit: string
  patientId?: string
  providerId?: string
  instructions: string
  sig: string
  requiresHomogenizer: boolean
  requiresUnguator: boolean
  isLightSensitive: boolean
  ingredients: CompoundingIngredient[]
}

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapToApi = (data: any): CompoundingFormValues => {
  return {
    name: data.compound_name,
    dosageForm: data.dosage_form,
    totalQty: toNumber(data.total_qty),
    totalQtyUnit: data.total_unit,
    daysSupply: toNumber(data.days_supply),
    budValue: toNumber(data.beyond_use_date),
    budUnit: data.beyond_use_unit,
    patientId: data.patient || null,
    providerId: data.provider || null,
    instructions: data.instructions,
    sig: data.sig_directions,
    requiresHomogenizer: !!data.requires_homogenizer,
    requiresUnguator: !!data.requires_unguator,
    isLightSensitive: !!data.light_sensitive,
    ingredients: (data.ingredients || []).map((ing: any) => ({
      name: ing.ingredient,
      type: ing.type,
      quantity: toNumber(ing.quantity),
      unit: ing.unit,
    })),
  }
}

const mapFromApi = (data: any) => {
  return {
    ...data,
    compound_name: data.name,
    dosage_form: data.dosageForm,
    total_qty: data.totalQty,
    total_unit: data.totalQtyUnit,
    days_supply: data.daysSupply,
    beyond_use_date: data.budValue,
    beyond_use_unit: data.budUnit,
    patient: data.patientId,
    provider: data.providerId,
    sig_directions: data.sig,
    requires_homogenizer: data.requiresHomogenizer,
    requires_unguator: data.requiresUnguator,
    light_sensitive: data.isLightSensitive,
    ingredients: (data.ingredients || []).map((ing: any) => ({
      ingredient: ing.name,
      type: ing.type,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
  }
}

export const compoundingApi = {
  getAll: async (params?: any) => {
    const res = await api.get<any>(BASE_URL, { params })
    return {
      data: (res.data || []).map(mapFromApi),
      meta: res.meta,
    }
  },

  getById: async (id: string) => {
    const res = await api.get<any>(`${BASE_URL}/${id}`)
    return { data: mapFromApi(res.data) }
  },

  create: async (data: any) => {
    const payload = mapToApi(data)
    const res = await api.post<any>(BASE_URL, payload)
    return { data: mapFromApi(res.data) }
  },

  update: async (id: string, data: any) => {
    const payload = mapToApi(data)
    const res = await api.put<any>(`${BASE_URL}/${id}`, payload)
    return { data: mapFromApi(res.data) }
  },

  delete: async (id: string) => {
    return await api.delete(`${BASE_URL}/${id}`)
  },
}
