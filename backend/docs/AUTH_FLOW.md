# Production Auth, RBAC & Workflow Architecture

This document provides a comprehensive overview of the Scoped Authentication and Permission system implemented in the backend.

## 1. Core Architecture

The system is designed for multi-tenancy with a hierarchical structure:
**Organization** > **Branch** > **User**.

Unlike traditional RBAC where a user has one role, this system supports **Scoped Roles**. A user can be an `Admin` in Branch A but only a `Staff` in Branch B.

### Data Models
- **Organization**: The top-level entity (e.g., a Pharmacy Chain).
- **Branch**: A specific location (e.g., Downtown Pharmacy).
- **User**: The identity (Email/Password).
- **Role**: A template of permissions and levels (e.g., `super_admin`, `branch_admin`).
- **Permission**: A granular action key (e.g., `users.create`, `inventory.view`).
- **Workflow**: A collection of permissions representing a business process (e.g., "Full Administrative Flow").

---

## 2. Scoped Assignments (The Magic)

Permissions are assigned via three pivot tables, all of which support `scopeType` ('global' or 'branch') and `scopeId`:

1.  **UserRole**: Assigns a role to a user.
    - Example: Assign `branch_admin` to John Doe for Branch `XYZ`.
2.  **UserWorkflow**: Assigns a group of permissions directly to a user for a scope.
3.  **UserPermission (Overrides)**: Explicitly **Grant** or **Revoke** a single permission for a user.
    - *Revokes always take precedence.*

---

## 3. The Permission Resolution Pipeline

The **`PermissionResolverService`** calculates a user's "Effective Permissions" for a specific branch context.

### Order of Resolution:
1.  **Super Admin Bypass**: If the user has any Role with `level >= 100` or key `super_admin`, they automatically get all permissions in the system.
2.  **Role Collection**: Collects all permissions linked to the user's roles that match the current scope (Branch ID) or are assigned `GLOBAL`.
3.  **Workflow Collection**: Adds permissions from workflows assigned directly to the user in that scope.
4.  **Overrides**: 
    - Applies **Direct Grants** (adds permissions).
    - Applies **Direct Revokes** (removes permissions, even if granted by a role).

---

## 4. Implementation Guide

### Enforcing Permissions in Routes
Use the `ensurePermission` middleware. It automatically looks for the `x-branch-id` header in the request to determine the scope.

```typescript
import { ensurePermission } from "@/middlewares/ensurePermission";

// Scoped check (Branch level)
router.get("/inventory", ensurePermission("inventory.view"), controller);

// Global check (If x-branch-id is missing, it checks global assignments)
router.get("/settings", ensurePermission("organizations.manage"), controller);
```

### JWT Token Strategy
The JWT token is deliberately kept **stateless and lean**. It only contains the `userId` and `email`. 
- **WHY?** Because a user's permissions change depending on which branch they selected in the UI. Storing all permissions for all branches in one token would crash the browser/header limits and cause security lag.

---

## 5. Demo Flow

1.  **Register**: `POST /api/v1/auth/register` creates an Org, a Branch, and an Admin user.
2.  **Login**: `POST /api/v1/auth/login` returns a token and the list of branches the user belongs to.
3.  **Access Data**: 
    - `GET /api/v1/demo/inventory`
    - Make sure to pass `x-branch-id: <YOUR_BRANCH_ID>` in the headers.

---

## 6. Maintenance
- **New Permissions**: Add them to the `Permission` table via a migration or the seed file.
- **Hierarchies**: Control power levels using the `level` field in the `Role` model.
