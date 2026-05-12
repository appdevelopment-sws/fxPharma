import {
  Barcode,
  Blocks,
  Box,
  Building2,
  LayoutDashboard,
  Percent,
  PercentSquare,
  ShieldCheck,
  Square,
  Store,
  SubscriptIcon,
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
import { PERMISSIONS, ROLES } from "@/lib/access"
import { Checkbox } from "../ui/checkbox"

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
        title: "Store List",
        to: "/super-admin/store-list",
        description: "Store List",
        icon: Store,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        title: "Tax & HSN",
        to: "/super-admin/tax-hsn",
        description: "Tax & HSN",
        icon: Percent,
        roles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  // {
  //   title: "Governance",
  //   items: [
  //     {
  //       title: "Platform Access",
  //       description: "Manage tenants, users, and platform role boundaries",
  //       icon: ShieldCheck,
  //       roles: [ROLES.SUPER_ADMIN],
  //       children: [
  //         {
  //           title: "Tenants",
  //           to: "/super-admin/tenants",
  //           description: "Platform-wide tenant oversight and health monitoring",
  //           icon: Building2,
  //           roles: [ROLES.SUPER_ADMIN],
  //           permissions: [PERMISSIONS.USER_READ],
  //         },
  //         {
  //           title: "Roles & Permissions",
  //           to: "/super-admin/access",
  //           description: "Platform access policy and super admin controls",
  //           icon: ShieldCheck,
  //           roles: [ROLES.SUPER_ADMIN],
  //           permissions: [PERMISSIONS.ROLE_MANAGE],
  //         },
  //       ],
  //     },
  //   ],
  // },
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
            to: "/super-admin/master-products",
            description: "Platform-wide tenant oversight and health monitoring",
            icon: Box,
            roles: [ROLES.SUPER_ADMIN],
          },
          {
            title: "Attributes",
            to: "/super-admin/attributes",
            description: "Attributes management for master products",
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
  {
    title: "Manage Subscription",
    items: [
      {
        title: "Manage Subscription",
        to: "/super-admin/subscription",
        description: "Manage subscription plans and billing cycles",
        icon: SubscriptIcon,
        roles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        title: "Features ",
        to: "/super-admin/features-management",
        description: "Manage subscription plans and billing cycles",
        icon: Blocks,
        roles: [ROLES.SUPER_ADMIN],
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
    label: permission,
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
