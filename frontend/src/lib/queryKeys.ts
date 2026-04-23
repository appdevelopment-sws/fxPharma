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
}
