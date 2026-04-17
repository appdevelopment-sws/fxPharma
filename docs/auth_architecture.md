# Multi-Tenant Auth & RBAC Architecture Documentation

This document outlines the production-grade authentication and Role-Based Access Control (RBAC) system implemented in the Pharmacy Software. The architecture follows a **Global Identity, Scoped Access** model.

---

## 1. Backend Architecture

### Core Concepts
- **Organizations & Branches**: Multi-tenancy is structured hierarchically. An Organization can have multiple Branches.
- **Global Models**: `User`, `Role`, `Permission`, and `Workflow` are global entities. They are shared across the platform to allow a single user to navigate multiple organizations with one account.
- **Scoped Assignments**: Access is granted through "assignments" that combine a user, a role/workflow, and a **Scope** (Branch ID).
    - `UserRole`: Associates a User with a Role in a specific Branch.
    - `UserWorkflow`: Associates a User with a Workflow in a specific Branch.
    - `UserPermission`: Direct grants or revokes for a User in a specific Branch.

### Permission Resolution
The `PermissionResolverService` computes "Effective Permissions" for a user in a specific scope:
1. **Super Admin Bypass**: Immediate full access if `level >= 100`.
2. **Role Inheritance**: Collects permissions from all assigned Roles and their linked Workflows.
3. **Direct Workflows**: Adds permissions from workflows assigned directly to the user.
4. **Overrides**: Applies direct user permissions (Revoke overrides take priority).

### Multi-Tenant Context
We use `AsyncLocalStorage` to maintain tenant context across the request lifecycle.
- **`attachTenant` Middleware**: Extracts the `x-branch-id` header and sets the context.
- **Prisma Extension**: Any model marked as tenant-scoped in `prisma.ts` will automatically have its queries filtered by the active `tenantId`, preventing cross-tenant data leaks.

#### Example: Protecting a Backend Route
```typescript
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { attachTenant } from "@/middlewares/tenant.js";
import { ensurePermission } from "@/middlewares/ensurePermission.js";
import { PERMISSIONS } from "@/constants/permissions.js";

router.get(
  "/inventory",
  isAuthenticated,
  attachTenant, // 1. Establish scope
  ensurePermission(PERMISSIONS.INVENTORY_READ), // 2. Check resolved permissions
  inventoryController.listItems
);
```

---

## 2. Frontend Architecture

### State Management (`AuthContext`)
The frontend maintains a global identity but views the app through an **Active Branch** lens.
- **`activeBranchId`**: Stored in `localStorage`.
- **`switchBranch(id)`**: Updates storage and invalidates the `user` query, triggering a re-sync of resolved permissions.
- **Resolved User Profile**: The `getuser` call returns the specific `role` and `permissions` resolved for the current `activeBranchId`.

### Header Injection
The API client automatically injects the scope into every request:
```typescript
// services/api.ts
CustomApi.interceptors.request.use((config) => {
  const branchId = localStorage.getItem("activeBranchId");
  if (branchId) {
    config.headers["x-branch-id"] = branchId;
  }
  return config;
});
```

### Access Control in UI

#### A. Protecting Routes
Wrap routes in the `ProtectedRoute` component to restrict entire pages.
```tsx
<Route
  element={
    <ProtectedRoute 
      allowedRoles={[ROLES.BRANCH_ADMIN]} 
      allowedPermissions={[PERMISSIONS.USER_READ]} 
    />
  }
>
  <Route path="users" element={<AdminUsersPage />} />
</Route>
```

#### B. Conditional Rendering (Hiding Elements)
Use `hasPermission` or `hasRole` from `useAuth` to hide buttons or navigation items.
```tsx
const { hasPermission } = useAuth();

return (
  <Card>
    <CardHeader>Inventory</CardHeader>
    {hasPermission(PERMISSIONS.INVENTORY_CREATE) && (
      <Button onClick={addItem}>Add New Item</Button>
    )}
  </Card>
);
```

---

## 3. Best Practices Workflow

### Adding a New Scoped Model
1. **Schema**: Add the model to `schema.prisma` with a `tenantId` field.
2. **Prisma Extension**: Add the model name to `tenantScopedModels` in `lib/prisma.ts`.
3. **Controller**: Ensure the route uses `attachTenant`. Prisma will now handle the multi-tenancy filters for you automatically.

### Adding a New Permission
1. **Define**: Add the key (e.g., `sales.refund`) to `backend/src/constants/permissions.ts` and `frontend/src/lib/access.ts`.
2. **Seed**: Add it to the permissions list in `prisma/seed.ts`.
3. **Enforce**: Apply `ensurePermission` on the backend and `hasPermission` on the frontend.
