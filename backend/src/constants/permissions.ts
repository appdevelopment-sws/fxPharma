export const PERMISSIONS = {
  USER_CREATE: "USER_CREATE",
  USER_READ: "USER_READ",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  ROLE_MANAGE: "ROLE_MANAGE",
  MASTER_PRODUCT_CREATE: "MASTER_PRODUCT_CREATE",
  MASTER_PRODUCT_READ: "MASTER_PRODUCT_READ",
  MASTER_PRODUCT_UPDATE: "MASTER_PRODUCT_UPDATE",
  MASTER_PRODUCT_DELETE: "MASTER_PRODUCT_DELETE",
} as const;

export type PermissionName =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_PERMISSION_SEEDS = [
  {
    name: PERMISSIONS.USER_CREATE,
    description: "Create tenant users",
  },
  {
    name: PERMISSIONS.USER_READ,
    description: "Read tenant users",
  },
  {
    name: PERMISSIONS.USER_UPDATE,
    description: "Update tenant users",
  },
  {
    name: PERMISSIONS.USER_DELETE,
    description: "Delete tenant users",
  },
  {
    name: PERMISSIONS.ROLE_MANAGE,
    description: "Manage tenant roles",
  },
  {
    name: PERMISSIONS.MASTER_PRODUCT_CREATE,
    description: "Create master products",
  },
  {
    name: PERMISSIONS.MASTER_PRODUCT_READ,
    description: "Read master products",
  },
  {
    name: PERMISSIONS.MASTER_PRODUCT_UPDATE,
    description: "Update master products",
  },
  {
    name: PERMISSIONS.MASTER_PRODUCT_DELETE,
    description: "Delete master products",
  },
] as const;
