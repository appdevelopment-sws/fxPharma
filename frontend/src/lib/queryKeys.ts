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
}
