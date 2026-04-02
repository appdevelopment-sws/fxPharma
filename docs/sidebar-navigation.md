# Sidebar Navigation Guide

This project now uses one shared sidebar/navigation system for both:

- `Admin`
- `Super Admin`

That means the behavior is the same in both areas:

- responsive sidebar
- nested sidebar items
- active route highlighting
- auto-expand when a child route is active
- role-based visibility
- permission-based visibility
- route-level protection with `ProtectedRoute`

Use this document whenever you want to add, edit, or troubleshoot sidebar items.

## Quick Answer

Yes, admin and super admin use the same sidebar engine.

The difference is only in the navigation config files:

- Admin config: [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx)
- Super admin config: [frontend/src/components/super-admin/super-admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/super-admin/super-admin-navigation.tsx)

The shared engine lives in:

- [frontend/src/components/navigation/sidebar-navigation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/sidebar-navigation.ts)
- [frontend/src/components/navigation/WorkspaceShell.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/WorkspaceShell.tsx)

## Architecture

### 1. Shared Navigation Types

The shared navigation item shape is defined in [frontend/src/components/navigation/sidebar-navigation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/sidebar-navigation.ts):

```ts
type SidebarNavigationItem = {
  title: string
  to?: string
  description: string
  icon: LucideIcon
  permissions?: string[]
  roles?: string[]
  children?: SidebarNavigationItem[]
}
```

Meaning:

- `title`: label shown in the sidebar
- `to`: route path; optional for parent-only expandable items
- `description`: secondary text shown under the title
- `icon`: `lucide-react` icon
- `permissions`: required permissions to see the item
- `roles`: required roles to see the item
- `children`: nested submenu items

### 2. Shared Navigation Logic

These shared helpers control how items behave:

- `canAccessNavigationItem(...)`
- `getVisibleNavigationGroups(...)`
- `flattenNavigationItems(...)`
- `isNavigationItemActive(...)`

What they do:

- filter items based on role and permission
- filter child items independently
- hide parent items if none of their children are visible
- detect active items for styling
- auto-open a parent when one of its children is active

### 3. Shared Layout Shell

The actual sidebar UI is rendered by [frontend/src/components/navigation/WorkspaceShell.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/WorkspaceShell.tsx).

This component is shared by:

- [frontend/src/layout/AdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/AdminLayout.tsx)
- [frontend/src/layout/SuperAdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/SuperAdminLayout.tsx)

So if you want to change sidebar behavior globally, edit `WorkspaceShell.tsx`.

Examples:

- change expand/collapse behavior
- change mobile sidebar behavior
- change styling for all dashboards
- change footer/logout section

## Where To Add Sidebar Items

### Admin Sidebar

Add or edit items in:

- [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx)

Main export:

```ts
export const adminNavigationGroups: SidebarNavigationGroup[] = [...]
```

### Super Admin Sidebar

Add or edit items in:

- [frontend/src/components/super-admin/super-admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/super-admin/super-admin-navigation.tsx)

Main export:

```ts
export const superAdminNavigationGroups: SidebarNavigationGroup[] = [...]
```

## Important Rule

Adding a sidebar item is not enough by itself.

Whenever you add a new item, you usually need to update all of these:

1. navigation config
2. route definition
3. page component
4. permission or role protection

If you skip the route, the sidebar link will exist but the page will not.

If you skip route protection, the page may still be accessible by direct URL even if the sidebar hides it.

## How To Add A New Admin Sidebar Item

Example: add a new admin page called `Reports`.

### Step 1. Create the page

Create a page file, for example:

- `frontend/src/pages/admin/reports/AdminReportsPage.tsx`

### Step 2. Add the route

Update [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx).

Simple example:

```tsx
<Route path="reports" element={<AdminReportsPage />} />
```

Permission-protected example:

```tsx
<Route
  element={<ProtectedRoute allowedPermissions={["REPORT_READ"]} />}
>
  <Route path="reports" element={<AdminReportsPage />} />
</Route>
```

### Step 3. Add the sidebar item

Update [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx).

Flat item example:

```ts
{
  title: "Reports",
  to: "/admin/reports",
  description: "Inventory, sales, and usage reports",
  icon: BarChart3,
  permissions: ["REPORT_READ"],
}
```

### Step 4. If needed, add backend permission support

If the permission does not already exist, you will also need backend support:

- permission seed/update
- role assignment
- API enforcement if needed

## How To Add A Nested Admin Sidebar Item

Example: put `Reports` under a parent menu called `Analytics`.

In [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx):

```ts
{
  title: "Analytics",
  description: "Business reporting and insights",
  icon: BarChart3,
  children: [
    {
      title: "Reports",
      to: "/admin/reports",
      description: "Inventory, sales, and usage reports",
      icon: FileText,
      permissions: ["REPORT_READ"],
    },
    {
      title: "Forecasts",
      to: "/admin/forecasts",
      description: "Demand and reorder forecasting",
      icon: TrendingUp,
      permissions: ["REPORT_READ"],
    },
  ],
}
```

Notes:

- Parent items can omit `to`
- Parent becomes expandable/collapsible
- Parent shows only if at least one child is visible
- Parent auto-expands when a child route is active

## How To Add A New Super Admin Sidebar Item

Same pattern as admin.

### Step 1. Create the page

Example:

- `frontend/src/pages/super-admin/audit/SuperAdminAuditPage.tsx`

### Step 2. Add the route

Update [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx).

Example:

```tsx
<Route
  element={
    <ProtectedRoute
      allowedRoles={["Super Admin"]}
      allowedPermissions={["AUDIT_READ"]}
    />
  }
>
  <Route path="audit" element={<SuperAdminAuditPage />} />
</Route>
```

### Step 3. Add the sidebar item

Update [frontend/src/components/super-admin/super-admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/super-admin/super-admin-navigation.tsx).

Example:

```ts
{
  title: "Audit Logs",
  to: "/super-admin/audit",
  description: "Platform-level audit history and security traceability",
  icon: ClipboardList,
  roles: ["Super Admin"],
  permissions: ["AUDIT_READ"],
}
```

## Are Admin And Super Admin The Same?

Yes in structure, no in config.

They are the same in:

- sidebar engine
- nested menu behavior
- visibility logic
- active state logic
- mobile behavior
- logout footer
- route protection pattern

They are different in:

- navigation config file
- route file
- page components
- role and permission requirements
- branding/title text in layout

## Roles vs Permissions

### Sidebar Visibility

Sidebar visibility is controlled by the navigation item itself:

```ts
roles: ["Super Admin"]
permissions: ["ROLE_MANAGE"]
```

This means the item only appears if the logged-in user satisfies both:

- role requirement
- permission requirement

### Route Access

Actual page access is controlled in route files through [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx).

Examples:

```tsx
<ProtectedRoute allowedRoles={["Admin", "User"]} />
```

```tsx
<ProtectedRoute allowedPermissions={["USER_READ"]} />
```

```tsx
<ProtectedRoute
  allowedRoles={["Super Admin"]}
  allowedPermissions={["ROLE_MANAGE"]}
/>
```

Best practice:

- use navigation config to control visibility
- use route protection to control actual access
- keep both aligned

## Current Files To Know

### Shared

- [frontend/src/components/navigation/sidebar-navigation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/sidebar-navigation.ts)
- [frontend/src/components/navigation/WorkspaceShell.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/WorkspaceShell.tsx)
- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)

### Admin

- [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx)
- [frontend/src/layout/AdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/AdminLayout.tsx)
- [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx)

### Super Admin

- [frontend/src/components/super-admin/super-admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/super-admin/super-admin-navigation.tsx)
- [frontend/src/layout/SuperAdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/SuperAdminLayout.tsx)
- [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx)

## Common Patterns

### Simple Visible To Everyone In That Area

Admin example:

```ts
{
  title: "Profile",
  to: "/admin/profile",
  description: "Account details and tenant context",
  icon: UserCog,
}
```

This appears for any authenticated admin/user already allowed into the admin area.

### Restricted By Permission

```ts
{
  title: "Users",
  to: "/admin/users",
  description: "Tenant users directory and access control",
  icon: Users,
  permissions: ["USER_READ"],
}
```

### Restricted By Role

```ts
{
  title: "Platform Dashboard",
  to: "/super-admin",
  description: "Platform overview",
  icon: LayoutDashboard,
  roles: ["Super Admin"],
}
```

### Restricted By Role And Permission

```ts
{
  title: "Roles & Permissions",
  to: "/super-admin/access",
  description: "Platform access policy and super admin controls",
  icon: ShieldCheck,
  roles: ["Super Admin"],
  permissions: ["ROLE_MANAGE"],
}
```

## Troubleshooting

### Sidebar item does not show

Check:

1. Is the item added to the correct navigation config file?
2. Does the current user have the required `role`?
3. Does the current user have the required `permissions`?
4. If it is a parent item, does at least one child remain visible?

### Sidebar item shows but route fails

Check:

1. Is the route added in the correct route file?
2. Is the page component exported correctly?
3. Is `ProtectedRoute` rejecting the current user?

### Route works by URL but sidebar item is hidden

Check whether:

- route protection and sidebar config are out of sync
- item has stricter `roles` or `permissions` than the route

### Parent item shows but children do not

Check each child item:

- `to`
- `permissions`
- `roles`
- route existence

## Recommended Workflow For New Navigation

When adding a new page, follow this order:

1. Create the page component.
2. Add the route with `ProtectedRoute` if needed.
3. Add the sidebar item in the correct navigation config.
4. Add backend permission support if the permission is new.
5. Test with a user that has access.
6. Test with a user that should not have access.

## Future Extension Ideas

This system is ready for:

- more nested groups
- backend-driven nav configs
- feature flag support
- badge counts on sidebar items
- collapsible accordion mode
- tenant-specific menu generation

If you add those later, keep the shared engine in `sidebar-navigation.ts` as the main source of truth instead of duplicating logic separately for admin and super admin.
