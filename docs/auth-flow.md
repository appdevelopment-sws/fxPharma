# Auth Flow Documentation

## Overview

This project uses cookie-based authentication with role-aware frontend routing.

Current roles:

- `Super Admin`
- `Admin`
- `User`

Current login flow:

- User logs in with `email` and `password`
- Backend validates the user and role
- Backend sets `accessToken` and `refreshToken` as HTTP-only cookies
- Frontend loads the authenticated user from `/api/v1/auth/getuser`
- Frontend redirects based on role
- UI visibility inside the tenant dashboard is driven by permissions

There is no `username` flow and no `slug` flow in the current implementation.

## High-Level Flow

### 1. Register

Route:

- `POST /api/v1/auth/register`

What happens:

- Frontend submits `companyName`, `name`, `email`, and `password`
- Backend creates a new `Tenant`
- Backend creates default tenant roles: `Admin` and `User`
- Backend assigns permissions to those roles
- Backend creates the first tenant user as the tenant `Admin`

Main files:

- [backend/src/v1/modules/auth/auth.routes.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.routes.ts)
- [backend/src/v1/modules/auth/auth.controllers.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.controllers.ts)
- [backend/src/v1/modules/auth/auth.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.service.ts)
- [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)
- [backend/src/v1/modules/auth/auth.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.validation.ts)
- [frontend/src/pages/admin/auth/register.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/auth/register.tsx)
- [frontend/src/validations/admin/registerValidation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/validations/admin/registerValidation.ts)
- [frontend/src/services/authApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/authApi.ts)

### 2. Login

Route:

- `POST /api/v1/auth/login`

What happens:

- Frontend submits `email` and `password`
- Backend finds the user
- Backend verifies:
  - user exists
  - password is valid
  - user is active
  - tenant is active
- Backend returns the user payload and sets auth cookies
- Frontend invalidates auth queries and redirects:
  - `Super Admin` -> `/super-admin`
  - `Admin` or `User` -> `/admin/dashboard`

Main files:

- [backend/src/v1/modules/auth/auth.controllers.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.controllers.ts)
- [backend/src/v1/modules/auth/auth.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.service.ts)
- [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)
- [backend/src/helpers/jwtToken.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/helpers/jwtToken.ts)
- [frontend/src/pages/admin/auth/login.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/auth/login.tsx)
- [frontend/src/validations/admin/loginValidation.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/validations/admin/loginValidation.ts)
- [frontend/src/hooks/authHook.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/hooks/authHook.ts)

### 3. Session Restore

Route:

- `GET /api/v1/auth/getuser`

What happens:

- Frontend app starts
- `AuthProvider` requests the current user
- Backend reads `accessToken` from cookies
- Backend verifies JWT
- Backend attaches `req.user`
- Backend attaches tenant context
- Backend loads the full user with role and permissions
- Frontend stores the result in auth context

Main files:

- [backend/src/middlewares/isAuthenticated.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthenticated.ts)
- [backend/src/middlewares/tenant.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/tenant.ts)
- [backend/src/lib/tenantContext.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/tenantContext.ts)
- [backend/src/lib/prisma.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/prisma.ts)
- [frontend/src/context/authContext.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/context/authContext.tsx)
- [frontend/src/services/authApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/authApi.ts)
- [frontend/src/main.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/main.tsx)

### 4. Logout

Route:

- `POST /api/v1/auth/logout`

What happens:

- Backend clears `accessToken` and `refreshToken` cookies
- Frontend can invalidate auth queries and return the user to login

Main files:

- [backend/src/v1/modules/auth/auth.controllers.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.controllers.ts)
- [backend/src/v1/modules/auth/auth.routes.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.routes.ts)
- [frontend/src/services/authApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/authApi.ts)

## Role-Based Frontend Routing

### Public auth pages

These pages should only be visible when there is no active session.

- `/admin/login`
- `/admin/register`

Guard file:

- [frontend/src/components/auth/PublicOnlyRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/PublicOnlyRoute.tsx)

Behavior:

- If user is already authenticated:
  - `Super Admin` is redirected to `/super-admin`
  - others are redirected to `/admin/dashboard`

### Protected tenant pages

Protected by role:

- `Admin`
- `User`

Main files:

- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)
- [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx)
- [frontend/src/layout/AdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/AdminLayout.tsx)
- [frontend/src/pages/admin/dashboard/AdminDashboard.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/dashboard/AdminDashboard.tsx)

Behavior:

- Only `Admin` and `User` can enter these routes
- Dashboard content is permission-driven

### Protected super admin pages

Protected by role:

- `Super Admin`

Main files:

- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)
- [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx)
- [frontend/src/layout/SuperAdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/SuperAdminLayout.tsx)
- [frontend/src/pages/super-admin/dashboard/SuperAdminDashboard.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/dashboard/SuperAdminDashboard.tsx)

Behavior:

- Only `Super Admin` can enter `/super-admin`

### Unauthorized page

Main file:

- [frontend/src/pages/shared/UnauthorizedPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/shared/UnauthorizedPage.tsx)

Behavior:

- Authenticated users who fail the role check are redirected here

## Permission-Based UI

Inside the tenant dashboard, UI is controlled by permissions.

Current helper:

- `hasPermission(...permissions)` from [frontend/src/context/authContext.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/context/authContext.tsx)

Current dashboard example:

- [frontend/src/pages/admin/dashboard/AdminDashboard.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/dashboard/AdminDashboard.tsx)

Current permission names:

- `USER_CREATE`
- `USER_READ`
- `USER_UPDATE`
- `USER_DELETE`
- `ROLE_MANAGE`

Recommended pattern:

- Use role checks for route-level separation
- Use permission checks for feature-level UI inside the allowed area

## Backend Authentication Details

### JWT and cookies

Main file:

- [backend/src/helpers/jwtToken.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/helpers/jwtToken.ts)

Access token contains:

- `id`
- `tenantId`
- `email`
- `role`
- `permissions`

Cookies:

- `accessToken`
- `refreshToken`

Both are set as:

- `httpOnly`
- `sameSite: "strict"`
- `secure` in production

### Auth middleware

Main file:

- [backend/src/middlewares/isAuthenticated.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthenticated.ts)

Responsibilities:

- read token from cookie or auth header
- verify JWT
- populate `req.user`
- expose `req.tenantId`

### Tenant isolation

Main files:

- [backend/src/middlewares/tenant.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/tenant.ts)
- [backend/src/lib/tenantContext.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/tenantContext.ts)
- [backend/src/lib/prisma.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/prisma.ts)

Responsibilities:

- bind tenant context to the current request
- automatically scope tenant-owned Prisma models
- prevent cross-tenant writes with a mismatched `tenantId`

## Data Model

Main schema file:

- [backend/prisma/schema.prisma](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/schema.prisma)

Core models:

- `Tenant`
- `User`
- `Role`
- `Permission`
- `RolePermission`

Important relationships:

- each `User` belongs to one `Tenant`
- each `User` belongs to one `Role`
- each `Role` belongs to one `Tenant`
- each `Role` has many permissions through `RolePermission`

## Seeding

Main file:

- [backend/prisma/seed.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/seed.ts)

What seed currently does:

- creates permissions
- creates the `Platform` tenant
- creates the `Super Admin` role
- assigns all permissions to `Super Admin`
- creates the default super admin user

Current super admin seed account:

- email: `superadmin@platform.local`
- password: `supersecurepassword`

## File Map

### Backend

- [backend/src/v1/modules/auth/auth.routes.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.routes.ts)
- [backend/src/v1/modules/auth/auth.controllers.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.controllers.ts)
- [backend/src/v1/modules/auth/auth.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.service.ts)
- [backend/src/v1/modules/auth/auth.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.repository.ts)
- [backend/src/v1/modules/auth/auth.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/auth/auth.validation.ts)
- [backend/src/helpers/jwtToken.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/helpers/jwtToken.ts)
- [backend/src/middlewares/isAuthenticated.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/isAuthenticated.ts)
- [backend/src/middlewares/tenant.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/middlewares/tenant.ts)
- [backend/src/lib/tenantContext.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/tenantContext.ts)
- [backend/src/lib/prisma.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/lib/prisma.ts)
- [backend/prisma/schema.prisma](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/schema.prisma)
- [backend/prisma/seed.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/prisma/seed.ts)

### Frontend

- [frontend/src/context/authContext.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/context/authContext.tsx)
- [frontend/src/hooks/authHook.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/hooks/authHook.ts)
- [frontend/src/services/authApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/authApi.ts)
- [frontend/src/routes/AppRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/AppRoutes.tsx)
- [frontend/src/routes/adminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/adminRoutes.tsx)
- [frontend/src/routes/superAdminRoutes.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/routes/superAdminRoutes.tsx)
- [frontend/src/components/auth/ProtectedRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/ProtectedRoute.tsx)
- [frontend/src/components/auth/PublicOnlyRoute.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/auth/PublicOnlyRoute.tsx)
- [frontend/src/layout/AdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/AdminLayout.tsx)
- [frontend/src/layout/SuperAdminLayout.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/layout/SuperAdminLayout.tsx)
- [frontend/src/pages/admin/auth/login.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/auth/login.tsx)
- [frontend/src/pages/admin/auth/register.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/auth/register.tsx)
- [frontend/src/pages/admin/dashboard/AdminDashboard.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/admin/dashboard/AdminDashboard.tsx)
- [frontend/src/pages/super-admin/dashboard/SuperAdminDashboard.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/dashboard/SuperAdminDashboard.tsx)
- [frontend/src/pages/shared/UnauthorizedPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/shared/UnauthorizedPage.tsx)

## Extension Notes

When adding a new protected feature:

1. Decide whether it is:
   - super admin only
   - tenant-only
   - shared but permission-gated
2. Add or reuse permissions in seed and role assignment logic
3. Protect the route with `ProtectedRoute`
4. Use `hasPermission()` for UI actions and sections
5. Keep backend checks in place for any sensitive API

Do not rely on frontend visibility alone for security.
