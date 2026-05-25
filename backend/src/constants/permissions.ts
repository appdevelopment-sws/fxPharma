export const PERMISSIONS = {
  USER_CREATE: "users.create",
  USER_READ: "users.view",
  USER_UPDATE: "users.edit",
  USER_DELETE: "users.delete",
  ROLE_MANAGE: "roles.manage",
  MASTER_PRODUCT_CREATE: "master-products.create",
  MASTER_PRODUCT_READ: "master-products.view",
  MASTER_PRODUCT_UPDATE: "master-products.edit",
  MASTER_PRODUCT_DELETE: "master-products.delete",

  DAILY_TRANSACTION_REPORT_VIEW: "reports.daily-transaction.view",
  EXPIRY_REPORT_VIEW: "reports.expiry-reports",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

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
  {
    name: PERMISSIONS.DAILY_TRANSACTION_REPORT_VIEW,
    description: "Can view daily transaction report",
  },
  {
    name: PERMISSIONS.EXPIRY_REPORT_VIEW,
    description: "Can view expiry reports",
  },
] as const;
