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
  FileText,
  LineChart,
  Building2,
  Boxes,
  FlaskConical,
  ArrowLeftRight,
  UploadCloud,
  Tag,
  Receipt,
  CalendarX,
  KeyRound,
  Layers,
} from "lucide-react"
import type { AuthUser } from "@/context/authContext"
import {
  flattenNavigationItems,
  getVisibleNavigationGroups,
  isNavigationItemActive,
  type SidebarNavigationGroup,
} from "@/components/navigation/sidebar-navigation"
import { PERMISSIONS, ROLES } from "@/lib/access"

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
      {
        title: "Role",
        to: "/admin/role",
        description: "Role management",
        icon: ShieldCheck,
      },
      {
        title: "Branch",
        to: "/admin/branch",
        description: "Manage pharmacy branches",
        icon: Building2,
        permissions: [PERMISSIONS.BRANCH_VIEW],
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Stock Management",
        description: "Manage inventory, compounds, and transfers",
        icon: Box,
        children: [
          {
            title: "All Inventory",
            to: "/admin/all-inventory",
            description: "View and filter inventory across stores",
            icon: Boxes,
            permissions: [PERMISSIONS.INVENTORY_VIEW],
          },
          {
            title: "All Compound",
            to: "/admin/all-compound",
            description: "Manage prescription compounding",
            icon: FlaskConical,
            permissions: [PERMISSIONS.INVENTORY_VIEW],
          },
          {
            title: "Inventory Batch",
            to: "/admin/inventory-batch",
            description: "View inventory batch details",
            icon: Layers,
            permissions: [PERMISSIONS.INVENTORY_VIEW],
          },
          {
            title: "Inter Store Transfer",
            to: "/admin/inter-store-transfer",
            description: "Stock transfers between stores",
            icon: ArrowLeftRight,
            permissions: [PERMISSIONS.INVENTORY_MANAGE],
          },
          {
            title: "Import Inventory",
            to: "/admin/import-inventory",
            description: "Import inventory from CSV/Excel",
            icon: UploadCloud,
            permissions: [PERMISSIONS.INVENTORY_MANAGE],
          },
          {
            title: "Attributes",
            to: "/admin/attributes",
            description: "Master product attributes",
            icon: Tag,
            // permissions: [PERMISSIONS.MASTER_PRODUCT_VIEW],
          },
        ],
      },
    ],
  },
  {
    title: "Orders & Sales",
    items: [
      {
        title: "Orders",
        to: "/admin/orders",
        description: "Order management system",
        icon: FileText,
        permissions: [PERMISSIONS.ORDER_VIEW],
      },
      {
        title: "POS",
        to: "/admin/pos",
        description: "Point of Sale system",
        icon: Barcode,
        permissions: [PERMISSIONS.ORDER_CREATE],
      },
      {
        title: "Sales Returns",
        to: "/admin/returns",
        description: "Customer returns and refunds",
        icon: RotateCcw,
        permissions: [PERMISSIONS.ORDER_MANAGE],
      },
      {
        title: "Recent Invoices",
        to: "/admin/invoices",
        description: "Transaction history",
        icon: FileText,
        permissions: [PERMISSIONS.ORDER_VIEW],
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Suppliers",
        to: "/admin/suppliers",
        description: "Supplier management",
        icon: Users,
        permissions: [PERMISSIONS.INVENTORY_MANAGE],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Analytics",
        description: "Reports and business intelligence",
        icon: LineChart,
        children: [
          {
            title: "Daily Transactions",
            to: "/admin/reports/daily-transaction-report",
            description: "Daily transaction report",
            icon: Receipt,
          },
          {
            title: "Expiry Reports",
            to: "/admin/reports/expiry-reports",
            description: "Identify expiring stock",
            icon: CalendarX,
          },
          {
            title: "GST Report",
            to: "/admin/reports/gst-report",
            description: "Input and Output GST summary",
            icon: FileText,
          },
        ],
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Access Control",
        description: "Govern workspace members, roles, and permissions",
        icon: ShieldCheck,
        children: [
          {
            title: "Users",
            to: "/admin/users",
            description: "Tenant users directory",
            icon: Users,
            permissions: [PERMISSIONS.USER_VIEW],
          },
          {
            title: "Roles & Permissions",
            to: "/admin/roles",
            description: "Role governance and permission matrix",
            icon: KeyRound,
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
    label: permission,
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
