# Product Flow Documentation

## Overview

This document explains the current `Master Product` flow used by the Super Admin product screen.

In this codebase, a master product is reusable product metadata that links to:

- a `Company`
- a `Product Type`
- an `HSN Code`

The current frontend entry point is:

- [frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx)

The current backend module is:

- [backend/src/v1/modules/masterProduct/masterProduct.route.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.route.ts)
- [backend/src/v1/modules/masterProduct/masterProduct.controller.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.controller.ts)
- [backend/src/v1/modules/masterProduct/masterProduct.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.service.ts)
- [backend/src/v1/modules/masterProduct/masterProduct.repository.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.repository.ts)
- [backend/src/v1/modules/masterProduct/masterProduct.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.validation.ts)

## High-Level Flow

The product page has 4 main responsibilities:

1. Load master products with filters and pagination.
2. Load reference data needed by the form.
3. Open dialogs for create, edit, view, delete, and create-HSN.
4. Perform mutations and refresh cached data after success.

The page is intentionally split into:

- page orchestration in [frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx)
- reusable page config in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)
- form UI in [frontend/src/components/products/MasterProductDrawer.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/products/MasterProductDrawer.tsx)
- API contract mapping in [frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts)

## Frontend Flow

### 1. Page boot

When [frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx) renders, it creates:

- `deleteDisclosure` for delete confirmation dialog state
- `hsnDisclosure` for create-HSN dialog state
- `filter` state using [frontend/src/hooks/useSearchFilter.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/hooks/useSearchFilter.ts)
- `drawer` state using [frontend/src/hooks/useDisclosureForm.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/hooks/useDisclosureForm.ts)

`useDisclosureForm` is important here because it combines:

- modal open/close state
- selected row data
- react-hook-form state
- submit handling

That is why create, edit, and view all use the same drawer.

### 2. Query loading

The page loads two queries with React Query:

- `queryKeys.masterProducts.list(filter)` for the table data
- `queryKeys.masterProducts.references()` for reference dropdown data

The query keys live in:

- [frontend/src/lib/queryKeys.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/lib/queryKeys.ts)

The API implementation lives in:

- [frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts)

### 3. Filter flow

Filter state starts from:

- `DEFAULT_PRODUCT_FILTERS` in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)

When the user changes company, product type, HSN, search, page, or page size:

- `handleFilterChange(...)` updates local filter state
- page resets to `1` unless the page is explicitly provided
- the query key changes
- React Query refetches the product list

This makes the table flow predictable because the UI is fully driven by the `filter` object.

### 4. Reference option flow

The raw references response contains:

- `companies`
- `productTypes`
- `hsnCodes`

Those arrays are transformed into dropdown-friendly options by:

- `getMasterProductReferenceOptions(...)` in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)

This extraction is useful because any future screen can reuse the same option-shaping logic without copying code from the page component.

### 5. Table flow

The table columns are created by:

- `createMasterProductColumns(...)` in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)

The page passes only three behaviors into that function:

- `onView`
- `onEdit`
- `onDelete`

This keeps the columns reusable and low-coupled. The config file knows how to render the table, but not how the page stores dialog state.

Pagination values are derived by:

- `getMasterProductTablePagination(...)` in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)

### 6. Drawer flow

The drawer uses:

- [frontend/src/components/products/MasterProductDrawer.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/products/MasterProductDrawer.tsx)

This component is intentionally focused on presentation:

- render fields
- render footer buttons
- switch behavior by `mode`
- expose `onAddHsn`

It does not know how queries or mutations work.

Form defaults come from:

- `PRODUCT_FORM_DEFAULT_VALUES`

Form values for edit/view mode come from:

- `getMasterProductFormValues(product)`

That conversion matters because API entities use numeric ids, while form selects use string values.

### 7. Create product flow

When the user clicks `Add Product`:

- `openCreateDrawer()` opens the drawer with `{ mode: "create", product: null }`
- `useDisclosureForm` hydrates the form with `PRODUCT_FORM_DEFAULT_VALUES`
- on submit, `handleDrawerSubmit(...)` calls `createProductMutation`
- `ProductApi.createProduct(...)` normalizes the form payload
- on success, the page invalidates `queryKeys.masterProducts.all`
- the drawer closes
- the table refetches

### 8. Edit product flow

When the user clicks `Edit`:

- `openEditDrawer(product)` opens the drawer with the selected row
- `getMasterProductFormValues(product)` converts entity data to form shape
- on submit, `handleDrawerSubmit(...)` calls `updateProductMutation`
- `ProductApi.updateProduct(...)` sends a normalized patch payload
- on success, all master product queries are invalidated
- the drawer closes and fresh list data is loaded

### 9. View product flow

When the user clicks `View`:

- `openViewDrawer(product)` opens the drawer in `view` mode
- the same form component is reused
- fields become read-only
- submit actions are hidden

This is a good example of high cohesion: one form component supports create, edit, and view without needing three separate UIs.

### 10. Delete product flow

When the user clicks the delete action:

- `openDeleteDialog(product)` stores the selected row in `deleteDisclosure`
- `ConfirmDialog` opens
- `handleDeleteConfirm()` calls `deleteProductMutation`
- on success, product queries are invalidated
- the dialog closes
- the list refreshes

### 11. Create HSN flow inside product form

This is a small nested flow:

- user opens product drawer
- user clicks `Add` near the `HSN Code` select
- `CreateHsnCodeDialog` opens
- on submit, `createHsnMutation` calls `ProductApi.createHsnCode(...)`
- on success, the page invalidates `queryKeys.masterProducts.references()`
- the new HSN id is written back into the form with `setValue("hsnCodeId", ...)`
- the HSN dialog closes

This gives a smooth UX because the user does not need to leave the product form to create a missing reference.

## Frontend File Responsibilities

### Page

[frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx)

Responsibilities:

- own query and mutation wiring
- connect dialogs and form state
- connect filters, table, and pagination
- handle success toasts and cache invalidation

### Page config

[frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)

Responsibilities:

- define filter and drawer types
- provide default filter values
- convert references into select options
- generate table columns
- derive pagination display values

### Drawer UI

[frontend/src/components/products/MasterProductDrawer.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/products/MasterProductDrawer.tsx)

Responsibilities:

- render product form fields
- switch between create, edit, and view modes
- expose HSN add action to the parent

### API layer

[frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts)

Responsibilities:

- define frontend-facing product types
- normalize form payload before requests
- translate backend response shape into simpler frontend objects

## Backend Flow

### Routes

Routes are defined in:

- [backend/src/v1/modules/masterProduct/masterProduct.route.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.route.ts)

Current endpoints:

- `GET /master-products/references`
- `POST /master-products/hsn-codes`
- `GET /master-products`
- `GET /master-products/:id`
- `POST /master-products`
- `PATCH /master-products/:id`
- `DELETE /master-products/:id`

All routes use:

- `isAuthenticated`
- `attachTenant`
- permission middleware via `allowPermissions(...)`

### Controllers

Controllers are defined in:

- [backend/src/v1/modules/masterProduct/masterProduct.controller.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.controller.ts)

Responsibilities:

- parse request params, query, and body
- call service methods
- map success responses
- map request/service errors to HTTP responses

### Validation

Validation is defined in:

- [backend/src/v1/modules/masterProduct/masterProduct.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.validation.ts)

Important rules:

- `name` is required
- optional text fields are trimmed
- `company_id`, `product_type_id`, and `hsnCodeId` must be positive numbers
- list filters support `page`, `limit`, `search`, `companyId`, `productTypeId`, and `hsnCodeId`
- HSN code creation uses its own schema

### Service layer

Business logic is in:

- [backend/src/v1/modules/masterProduct/masterProduct.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.service.ts)

Responsibilities:

- validate reference integrity before create/update
- make sure referenced company exists and is `ACTIVE`
- make sure product type exists
- make sure HSN code exists
- translate Prisma errors into domain-friendly messages

Important service behavior:

- create and update both call `ensureReferenceIntegrity(...)`
- duplicate master product conflicts are mapped to a readable error
- duplicate HSN code conflicts are mapped separately

## Request and Response Shape

### Product list

Frontend sends:

- `companyId`
- `productTypeId`
- `hsnCodeId`
- `search`
- `page`
- `limit`

Frontend receives a simplified response shape from `ProductApi.getMasterProducts(...)`:

- `data`
- `meta.total`
- `meta.page`
- `meta.limit`
- `meta.pages`

### Product create and update

The form uses string ids because selects return strings.

Before request submission, [frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts) converts:

- `hsnCodeId` to number
- `company_id` to number
- `product_type_id` to number

It also trims strings and converts empty optional fields to `null`.

That normalization is important because it keeps the form ergonomic while still sending backend-friendly payloads.

## Cache Invalidation Rules

Current invalidation strategy is simple and safe:

- create product invalidates `queryKeys.masterProducts.all`
- update product invalidates `queryKeys.masterProducts.all`
- delete product invalidates `queryKeys.masterProducts.all`
- create HSN invalidates `queryKeys.masterProducts.references()`

This is not the most granular strategy, but it is easy to reason about and reduces stale-data bugs.

## How To Extend This Flow

### If you add a new product field

Update these places:

- backend validation schema in [backend/src/v1/modules/masterProduct/masterProduct.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.validation.ts)
- backend repository/service if persistence rules change
- frontend form type in [frontend/src/components/products/MasterProductDrawer.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/products/MasterProductDrawer.tsx)
- `PRODUCT_FORM_DEFAULT_VALUES`
- `getMasterProductFormValues(...)`
- payload normalization in [frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts)
- table columns in [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx) if the new field should be shown in the list

### If you add a new filter

Update these places:

- `ProductFilters`
- `DEFAULT_PRODUCT_FILTERS`
- `FilterBar` inputs in [frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx)
- `ProductApi.getMasterProducts(...)`
- backend list query schema in [backend/src/v1/modules/masterProduct/masterProduct.validation.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.validation.ts)
- backend repository list query implementation

### If you want to reuse this screen pattern elsewhere

The copy-friendly pieces are:

- `useDisclosureForm(...)` for modal + form orchestration
- `*.config.tsx` for list columns, filter defaults, and option mapping
- a presentational drawer component that only renders fields
- an API file that owns request/response normalization

That combination keeps coupling low:

- the page knows the workflow
- the config knows view-specific shaping
- the form knows rendering
- the API knows transport details

## Common Developer Notes

- The form select ids are strings in the UI and numbers in the API layer.
- `view` mode reuses the same form component, so changing field behavior there affects create and edit too.
- `references()` is shared by the page and the HSN creation flow.
- The page currently invalidates broad product queries after mutations for simplicity.

## Main Files To Read First

If a new developer only reads 5 files, start here:

- [frontend/src/pages/super-admin/products/MasterProductsPage.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.tsx)
- [frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/pages/super-admin/products/MasterProductsPage.config.tsx)
- [frontend/src/components/products/MasterProductDrawer.tsx](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/components/products/MasterProductDrawer.tsx)
- [frontend/src/services/masterProductApi.ts](/Users/startupwebsupport/Documents/pharmacy-software/frontend/src/services/masterProductApi.ts)
- [backend/src/v1/modules/masterProduct/masterProduct.service.ts](/Users/startupwebsupport/Documents/pharmacy-software/backend/src/v1/modules/masterProduct/masterProduct.service.ts)
