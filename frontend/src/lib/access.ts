export const ROLES = {
  ADMIN: "Admin",
  USER: "User",
  SUPER_ADMIN: "Super Admin",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

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
} as const

export type PermissionName =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

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
