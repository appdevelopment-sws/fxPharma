import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  UserCog,
  BriefcaseMedical,
  type LucideProps,
  Barcode,
  Box,
  RotateCcw,
} from "lucide-react"
import type { AuthUser } from "@/context/authContext"
import {
  flattenNavigationItems,
  getVisibleNavigationGroups,
  isNavigationItemActive,
  type SidebarNavigationGroup,
} from "@/components/navigation/sidebar-navigation"
import { PERMISSIONS, ROLES, permissionLabels } from "@/lib/access"

export const adminNavigationGroups: SidebarNavigationGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        to: "/admin/dashboard",
        description: "Workspace summary and permission overview",
        icon: LayoutDashboard,
      },
      {
        title: "Profile",
        to: "/admin/profile",
        description: "Account details and tenant context",
        icon: UserCog,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Inventory",
        description: "View, Search, and Filter Inventory across all Stores",
        icon: ShieldCheck,
        children: [
          {
            title: "All Inventory",
            to: "/admin/all-inventory",
            description: "View, Search, and Filter Inventory across all Stores",
            icon: Box,
          },
          {
            title: "Import Inventory",
            to: "/admin/import-inventory",
            description: "Import Inventory from csv/excel file.",
            icon: Box,
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
  {
    title: "Orders",
    items: [
      {
        title: "Orders",
        to: "/admin/orders",
        description: "Order management system for pharmacies",
        icon: LayoutDashboard,
      },
      {
        title: "Sales Returns",
        to: "/admin/returns",
        description: "Manage customer returns and refunds",
        icon: RotateCcw,
      },
    ],
  },
  {
    title: "Suppliers",
    items: [
      {
        title: "Suppliers",
        to: "/admin/suppliers",
        description: "Supplier management system for pharmacies",
        icon: Users,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Access Control",
        description: "Govern workspace members, roles, and permissions",
        icon: BriefcaseMedical,
        children: [
          {
            title: "Users",
            to: "/admin/users",
            description: "Tenant users directory and access control",
            icon: Users,
            permissions: [PERMISSIONS.USER_READ],
          },
          {
            title: "Roles & Permissions",
            to: "/admin/roles",
            description: "Role governance and permission matrix",
            icon: ShieldCheck,
            permissions: [PERMISSIONS.ROLE_MANAGE],
          },
        ],
      },
    ],
  },
]

export function getVisibleAdminNavigation(user: AuthUser | null) {
  return getVisibleNavigationGroups(adminNavigationGroups, user)
}

export const flattenAdminNavigationItems = flattenNavigationItems
export const isAdminItemActive = isNavigationItemActive

export function getPermissionSummary(user: AuthUser | null) {
  if (!user) return []

  return user.permissions.map((permission) => ({
    permission,
    label: permissionLabels[permission] ?? permission,
  }))
}

export function PharmacyCrossIcon(props: LucideProps) {
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
      <path d="M12 4v16" />
      <path d="M4 12h16" />
      <path d="M7 7l10 10" />
      <path d="M17 7L7 17" />
    </svg>
  )
}
