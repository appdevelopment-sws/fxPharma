/**
 * PERMISSIONS
 * These keys match exactly the 'key' field in your database 'Permission' table
 * as seen in your backend response.
 */
export const PERMISSIONS = {
  // User Management
  USER_VIEW: "users.view",
  USER_CREATE: "users.create",
  USER_EDIT: "users.edit",
  USER_DELETE: "users.delete",

  // Role & Access Control
  ROLE_VIEW: "roles.view",
  ROLE_MANAGE: "roles.manage",

  // Branch Management
  BRANCH_VIEW: "branches.view",
  BRANCH_CREATE: "branches.create",
  BRANCH_EDIT: "branches.edit",
  BRANCH_DELETE: "branches.delete",

  // Inventory & Pharmacy
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",
  MEDICINE_VIEW: "medicine.view",
  MEDICINE_MANAGE: "medicine.manage",

  // Sales & Orders
  ORDER_VIEW: "orders.view",
  ORDER_CREATE: "orders.create",
  ORDER_MANAGE: "orders.manage",

  // Organization
  ORGANIZATION_VIEW: "organization.view",
  ORGANIZATION_EDIT: "organization.edit",

  // Global Catalog
  MASTER_PRODUCT_VIEW: "master-products.view",
  MASTER_PRODUCT_MANAGE: "master-products.manage",

  REPORTS_VIEW: "reports.view",
  DAILY_TRANSACTION_REPORT_VIEW: "reports.daily-transaction.view",
  EXPIRY_REPORT_VIEW: "reports.expiry-reports",
  GST_REPORT_VIEW: "reports.gst-report",
  //permission for interstore and compount
  INTER_STORE_TRANSFER_VIEW: "inter-store-transfer.view",
  INTER_STORE_TRANSFER_MANAGE: "inter-store-transfer.manage",
  COMPOUND_VIEW: "compound.view",
  COMPOUND_MANAGE: "compound.manage",
  INVENTORY_BATCH_VIEW: "inventory-batch.view",
  INVENTORY_BATCH_MANAGE: "inventory-batch.manage",
  IMPORT_INVENTORY_VIEW: "import-inventory.view",

  // Add more permissions as needed
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * ROLES
 * Dynamic role keys from the backend.
 */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]
