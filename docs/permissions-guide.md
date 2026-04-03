# Permissions Guide

This document explains the permission system in simple terms.

Use it when you want to understand:

- where permissions are defined
- how backend checks them
- how frontend uses them
- how to add a new permission safely

## Quick Idea

This project uses:

- `roles` for broad access boundaries
- `permissions` for feature-level access

Example:

- role decides whether a user belongs in `Admin` or `Super Admin`
- permission decides whether that user can open `Users`, `Roles`, or `Master Product` features

## Current Source Of Truth

Permissions are centralized in two places right now:

- Backend: [backend/src/constants/permissions.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/constants/permissions.ts)
- Frontend: [frontend/src/lib/access.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/lib/access.ts)

Important:

- the backend source is the real enforcement source
- the frontend source is the UI source
- both should stay in sync

## Current Permission Names

- `USER_CREATE`
- `USER_READ`
- `USER_UPDATE`
- `USER_DELETE`
- `ROLE_MANAGE`
- `MASTER_PRODUCT_CREATE`
- `MASTER_PRODUCT_READ`
- `MASTER_PRODUCT_UPDATE`
- `MASTER_PRODUCT_DELETE`

## How It Works

### Backend Flow

### 1. Permission names are defined

Main file:

- [backend/src/constants/permissions.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/constants/permissions.ts)

This file contains:

- `PERMISSIONS`
- `PermissionName`
- `DEFAULT_PERMISSION_SEEDS`

### 2. Permissions are inserted into the database

Main file:

- [backend/prisma/seed.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/seed.ts)

Seed reads from `DEFAULT_PERMISSION_SEEDS` and upserts records into the `Permission` table.

### 3. Roles get those permissions

Main file:

- [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)

When a tenant is created:

- an `Admin` role is created
- a `User` role is created
- default permissions are attached to those roles

### 4. Logged-in user receives permissions in JWT payload

Main file:

- [backend/src/helpers/jwtToken.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/helpers/jwtToken.ts)

The access token includes:

- `id`
- `tenantId`
- `email`
- `role`
- `permissions`

### 5. Backend middleware checks them on protected routes

Main files:

- [backend/src/middlewares/isAuthenticated.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthenticated.ts)
- [backend/src/middlewares/isAuthorized.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthorized.ts)

Typical route protection looks like this:

```ts
router.post(
  "/",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_CREATE),
  masterProduct.createProduct,
)
```

Real example:

- [backend/src/v1/modules/masterProduct/masterProduct.route.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.route.ts)

## Frontend Flow

### 1. Frontend keeps the same permission names

Main file:

- [frontend/src/lib/access.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/lib/access.ts)

This file contains:

- `ROLES`
- `PERMISSIONS`
- `RoleName`
- `PermissionName`
- label maps for display text

### 2. Auth context stores the current user permissions

Main file:

- [frontend/src/context/authContext.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/context/authContext.tsx)

This gives helper methods like:

- `hasRole(...)`
- `hasPermission(...)`

### 3. Protected routes use centralized permissions

Main files:

- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)
- [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx)
- [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx)

Example:

```tsx
<ProtectedRoute allowedPermissions={[PERMISSIONS.USER_READ]} />
```

### 4. Sidebar visibility uses the same permissions

Main files:

- [frontend/src/components/navigation/sidebar-navigation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/sidebar-navigation.ts)
- [frontend/src/components/admin/admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/admin/admin-navigation.tsx)
- [frontend/src/components/super-admin/super-admin-navigation.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/super-admin/super-admin-navigation.tsx)

That means:

- if user lacks permission, sidebar item can be hidden
- if user manually enters URL, route guard still blocks access

## Current Example: Master Product

For `masterProduct`, the permission split is:

- `MASTER_PRODUCT_READ`
- `MASTER_PRODUCT_CREATE`
- `MASTER_PRODUCT_UPDATE`
- `MASTER_PRODUCT_DELETE`

Backend route file:

- [backend/src/v1/modules/masterProduct/masterProduct.route.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.route.ts)

This is intentionally different from future normal product permissions.

So later you can add something like:

- `PRODUCT_CREATE`
- `PRODUCT_READ`
- `PRODUCT_UPDATE`
- `PRODUCT_DELETE`

without mixing it with platform master product access.

## How To Add A New Permission

Example: suppose later you add `PRODUCT_CREATE`.

### Backend steps

1. Add it in [backend/src/constants/permissions.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/constants/permissions.ts)
2. Add it to `DEFAULT_PERMISSION_SEEDS`
3. Decide which default roles should receive it in [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)
4. Protect the API route using `allowPermissions(...)`
5. Re-run seed or update existing role permissions in DB

### Frontend steps

1. Add it in [frontend/src/lib/access.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/lib/access.ts)
2. Add label text if needed
3. Use it in route guards
4. Use it in sidebar config if that page should be hidden without access
5. Use `hasPermission(...)` inside the page for buttons or sections if needed

## Rule Of Thumb

Use `role` when:

- separating major areas like `Admin` vs `Super Admin`

Use `permission` when:

- controlling feature access inside those areas
- protecting specific routes
- hiding or showing sidebar items
- hiding or showing action buttons like create, edit, delete

## Why Centralizing Helps

Without centralization:

- typos are easy
- backend and frontend names drift apart
- routes and sidebar checks become inconsistent

With centralization:

- names are easier to reuse
- TypeScript helps catch mistakes
- adding new modules is simpler

## Important Limitation

Frontend permissions improve UX, but they are not security by themselves.

Real security must always stay in backend route checks.

So:

- frontend hides things
- backend enforces things

## Files You Will Most Often Touch

Backend:

- [backend/src/constants/permissions.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/constants/permissions.ts)
- [backend/prisma/seed.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/seed.ts)
- [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)
- [backend/src/middlewares/isAuthorized.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthorized.ts)

Frontend:

- [frontend/src/lib/access.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/lib/access.ts)
- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)
- [frontend/src/components/navigation/sidebar-navigation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/navigation/sidebar-navigation.ts)
- [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx)
- [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx)

## Recommended Next Improvement

Right now backend and frontend both have centralized permission files, but they are still separate files.

A future improvement would be to move shared permission names into one common package or shared folder used by both apps.
