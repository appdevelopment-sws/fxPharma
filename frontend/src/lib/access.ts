export const ROLES = {
  STAFF: "staff",
  BRANCH_ADMIN: "branch_admin",
  SUPER_ADMIN: "super_admin",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

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
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const permissionLabels: Record<PermissionName, string> = {
  [PERMISSIONS.USER_CREATE]: "Create tenant users",
  [PERMISSIONS.USER_READ]: "View tenant users",
  [PERMISSIONS.USER_UPDATE]: "Update tenant users",
  [PERMISSIONS.USER_DELETE]: "Delete tenant users",
  [PERMISSIONS.ROLE_MANAGE]: "Manage tenant roles",
  [PERMISSIONS.MASTER_PRODUCT_CREATE]: "Create master products",
  [PERMISSIONS.MASTER_PRODUCT_READ]: "View master products",
  [PERMISSIONS.MASTER_PRODUCT_UPDATE]: "Update master products",
  [PERMISSIONS.MASTER_PRODUCT_DELETE]: "Delete master products",
}

export const superAdminPermissionLabels: Record<PermissionName, string> = {
  [PERMISSIONS.USER_CREATE]: "Provision tenant administrators",
  [PERMISSIONS.USER_READ]: "Review tenant users and platform scope",
  [PERMISSIONS.USER_UPDATE]: "Update tenant access assignments",
  [PERMISSIONS.USER_DELETE]: "Disable users across tenants",
  [PERMISSIONS.ROLE_MANAGE]: "Govern platform and tenant roles",
  [PERMISSIONS.MASTER_PRODUCT_CREATE]: "Create platform master products",
  [PERMISSIONS.MASTER_PRODUCT_READ]: "Review platform master products",
  [PERMISSIONS.MASTER_PRODUCT_UPDATE]: "Update platform master products",
  [PERMISSIONS.MASTER_PRODUCT_DELETE]: "Delete platform master products",
}

export const userManagementCapabilities = [
  {
    permission: PERMISSIONS.USER_CREATE,
    label: "Invite and create users",
  },
  {
    permission: PERMISSIONS.USER_READ,
    label: "Read user directory data",
  },
  {
    permission: PERMISSIONS.USER_UPDATE,
    label: "Edit existing users",
  },
  {
    permission: PERMISSIONS.USER_DELETE,
    label: "Deactivate or remove users",
  },
] as const

export const platformTenantCapabilities = [
  {
    permission: PERMISSIONS.USER_READ,
    label: "Read tenant users and tenant health",
  },
  {
    permission: PERMISSIONS.USER_UPDATE,
    label: "Adjust tenant-owned access records",
  },
  {
    permission: PERMISSIONS.USER_DELETE,
    label: "Disable accounts across tenant scope",
  },
] as const
