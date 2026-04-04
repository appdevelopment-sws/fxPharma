import {
  Barcode,
  Box,
  Building2,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  type LucideProps,
} from "lucide-react"
import type { AuthUser } from "@/context/authContext"
import {
  flattenNavigationItems,
  getVisibleNavigationGroups,
  isNavigationItemActive,
  type SidebarNavigationGroup,
} from "@/components/navigation/sidebar-navigation"
import { PERMISSIONS, ROLES, superAdminPermissionLabels } from "@/lib/access"

export const superAdminNavigationGroups: SidebarNavigationGroup[] = [
  {
    title: "Platform",
    items: [
      {
        title: "Dashboard",
        to: "/super-admin/dashboard",
        description: "Platform visibility, session scope, and access summary",
        icon: LayoutDashboard,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        title: "Profile",
        to: "/super-admin/profile",
        description: "Authenticated account and platform tenant context",
        icon: UserCog,
        roles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    title: "Governance",
    items: [
      {
        title: "Platform Access",
        description: "Manage tenants, users, and platform role boundaries",
        icon: ShieldCheck,
        roles: [ROLES.SUPER_ADMIN],
        children: [
          {
            title: "Tenants",
            to: "/super-admin/tenants",
            description: "Platform-wide tenant oversight and health monitoring",
            icon: Building2,
            roles: [ROLES.SUPER_ADMIN],
            permissions: [PERMISSIONS.USER_READ],
          },
          {
            title: "Roles & Permissions",
            to: "/super-admin/access",
            description: "Platform access policy and super admin controls",
            icon: ShieldCheck,
            roles: [ROLES.SUPER_ADMIN],
            permissions: [PERMISSIONS.ROLE_MANAGE],
          },
        ],
      },
    ],
  },
  {
    title: "Master Product",
    items: [
      {
        title: "Products",
        description: "Manage tenants, users, and platform role boundaries",
        icon: ShieldCheck,
        roles: [ROLES.SUPER_ADMIN],
        children: [
          {
            title: "Master Product",
            to: "/super-admin/products/new",
            description: "Platform-wide tenant oversight and health monitoring",
            icon: Box,
            roles: [ROLES.SUPER_ADMIN],
          },
          {
            title: "HSN",
            to: "/super-admin/products/new",
            description: "Platform-wide tenant oversight and health monitoring",
            icon: Barcode,
            roles: [ROLES.SUPER_ADMIN],
          },
          // {
          //   title: "Roles & Permissions",
          //   to: "/super-admin/access",
          //   description: "Platform access policy and super admin controls",
          //   icon: ShieldCheck,
          //   roles: ["Super Admin"],
          //   // permissions: ["ROLE_MANAGE"],
          // },
        ],
      },
    ],
  },
]

export function getVisibleSuperAdminNavigation(user: AuthUser | null) {
  return getVisibleNavigationGroups(superAdminNavigationGroups, user)
}

export const flattenSuperAdminNavigationItems = flattenNavigationItems
export const isSuperAdminItemActive = isNavigationItemActive

export function getSuperAdminPermissionSummary(user: AuthUser | null) {
  if (!user) return []

  return user.permissions.map((permission) => ({
    permission,
    label: superAdminPermissionLabels[permission] ?? permission,
  }))
}

export function PlatformShieldIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 5 6v5c0 5 3.5 8.7 7 10 3.5-1.3 7-5 7-10V6l-7-3Z" />
      <path d="M9.5 12 11 13.5 14.5 10" />
    </svg>
  )
}
