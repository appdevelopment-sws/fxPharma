import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  UserCog,
  BriefcaseMedical,
  type LucideProps,
} from "lucide-react"
import type { AuthUser } from "@/context/authContext"
import {
  flattenNavigationItems,
  getVisibleNavigationGroups,
  isNavigationItemActive,
  type SidebarNavigationGroup,
} from "@/components/navigation/sidebar-navigation"

export const permissionLabels: Record<string, string> = {
  USER_CREATE: "Create tenant users",
  USER_READ: "View tenant users",
  USER_UPDATE: "Update tenant users",
  USER_DELETE: "Delete tenant users",
  ROLE_MANAGE: "Manage tenant roles",
}

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
            permissions: ["USER_READ"],
          },
          {
            title: "Roles & Permissions",
            to: "/admin/roles",
            description: "Role governance and permission matrix",
            icon: ShieldCheck,
            permissions: ["ROLE_MANAGE"],
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
