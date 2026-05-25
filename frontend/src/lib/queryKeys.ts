// src/lib/queryKeys.ts

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (filters?: any) => [...queryKeys.users.all, filters] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
  masterProducts: {
    all: ["masterProducts"] as const,
    list: (filters?: any) =>
      [...queryKeys.masterProducts.all, filters] as const,
    detail: (id: string) => [...queryKeys.masterProducts.all, id] as const,
    references: () => [...queryKeys.masterProducts.all, "references"] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (filters?: any) => [...queryKeys.inventory.all, filters] as const,
    detail: (id: string) => [...queryKeys.inventory.all, id] as const,
    expiryReport: (filters?: any) =>
      [...queryKeys.inventory.all, "expiry-report", filters] as const,
  },
  taxes: {
    all: ["taxes"] as const,
    list: (filters?: any) => [...queryKeys.taxes.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.taxes.all, id] as const,
  },
  hsnCodes: {
    all: ["hsnCodes"] as const,
    list: (filters?: any) => [...queryKeys.hsnCodes.all, filters] as const,
  },
  hsnMappings: {
    all: ["hsnMappings"] as const,
    list: (filters?: any) => [...queryKeys.hsnMappings.all, filters] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: (filters?: any) => [...queryKeys.brands.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.brands.all, id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (filters?: any) => [...queryKeys.categories.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.categories.all, id] as const,
  },
  manufacturers: {
    all: ["manufacturers"] as const,
    list: (filters?: any) => [...queryKeys.manufacturers.all, filters] as const,
    detail: (id: string | number) =>
      [...queryKeys.manufacturers.all, id] as const,
  },
  units: {
    all: ["units"] as const,
    list: (filters?: any) => [...queryKeys.units.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.units.all, id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: any) => [...queryKeys.orders.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.orders.all, id] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: (filters?: any) => [...queryKeys.suppliers.all, filters] as const,
    detail: (id: string | number) => [...queryKeys.suppliers.all, id] as const,
  },
  returns: {
    all: ["returns"] as const,
    list: (filters?: any) => [...queryKeys.returns.all, filters] as const,
    stats: () => [...queryKeys.returns.all, "stats"] as const,
    detail: (id: string) => [...queryKeys.returns.all, id] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (filters?: any) => [...queryKeys.invoices.all, filters] as const,
    stats: () => [...queryKeys.invoices.all, "stats"] as const,
    detail: (id: string) => [...queryKeys.invoices.all, id] as const,
  },
  storeList: {
    all: ["storeList"] as const,
    list: (filters?: any) => [...queryKeys.storeList.all, filters] as const,
    detail: (id: string) => [...queryKeys.storeList.all, id] as const,
    meta: () => [...queryKeys.storeList.all, "meta"] as const,
  },
  compounding: {
    all: ["compounding"] as const,
    list: (filters?: any) => [...queryKeys.compounding.all, filters] as const,
    detail: (id: string) => [...queryKeys.compounding.all, id] as const,
  },
  transfers: {
    all: ["transfers"] as const,
    list: (filters?: any) => [...queryKeys.transfers.all, filters] as const,
    detail: (id: string) => [...queryKeys.transfers.all, id] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: (filters?: any) => [...queryKeys.plans.all, filters] as const,
    detail: (id: string) => [...queryKeys.plans.all, id] as const,
  },
  features: {
    all: ["features"] as const,
    list: (filters?: any) => [...queryKeys.features.all, filters] as const,
    detail: (id: string) => [...queryKeys.features.all, id] as const,
  },
  branches: {
    all: ["branches"] as const,
    list: (filters?: any) => [...queryKeys.branches.all, filters] as const,
    detail: (id: string) => [...queryKeys.branches.all, id] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: (filters?: any) => [...queryKeys.roles.all, filters] as const,
    detail: (id: string) => [...queryKeys.roles.all, id] as const,
  },
}
