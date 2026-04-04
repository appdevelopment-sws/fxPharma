# Production-Grade Product Management Architecture

## Overview

This implementation demonstrates a production-grade, reusable pattern for building CRUD interfaces with modals/drawers. It follows best practices from modern React applications with proper separation of concerns.

## Core Components & Patterns

### 1. **useDisclosure Hook** (`/src/hooks/useDisclosure.ts`)

A custom hook for managing disclosure (modal/drawer) state with optional data payload.

**Why it's better:**

- Encapsulates open/close state logic
- Supports holding data while the disclosure is open
- Automatically clears data on close for clean state
- Reusable across all modals/drawers

**Usage:**

```typescript
import { useDisclosure } from "@/hooks/useDisclosure";

// Simple usage
const disclosure = useDisclosure();
disclosure.onOpen();
disclosure.onClose();

// With data payload
interface TicketData {
  id: string;
  name: string;
}
const disclosure = useDisclosure<TicketData>();

// Open with data
disclosure.onOpen({ id: "123", name: "Support Ticket" });

// Access state
if (disclosure.isOpen && disclosure.data) {
  // Render modal with disclosure.data
}
```

### 2. **API Service Layer** (`/src/services/productApi.ts`)

Centralized API client with proper type definitions and error handling.

**Why it's better:**

- Single source of truth for API endpoints
- Type-safe request/response handling
- Easy to mock for testing
- Simple to update API calls across the app

**Structure:**

```typescript
const ProductApi = {
  getProducts: async (filters?) => { ... },
  getProduct: async (id: string) => { ... },
  createProduct: async (data) => { ... },
  updateProduct: async (id, data) => { ... },
  deleteProduct: async (id) => { ... },
}
```

### 3. **Refactored MasterProductDrawer**

A **focused, reusable component** that only handles rendering, not state management.

**Key improvements:**

- Uses `react-hook-form` with `Controller` for proper form management
- Accepts `control` prop from parent (inversion of control pattern)
- Separate field components (`FormField`, `FormSelectField`, `FormTextarea`)
- Cleaner, more testable code
- Supports `isSubmitting` and `isLoading` states

**Before (old pattern):**

```typescript
// Form state management mixed with rendering
const [formValues, setFormValues] = useState(...)
// Updates via updateValue function
// Hard to reuse, hard to test
```

**After (new pattern):**

```typescript
// Form state managed in parent via react-hook-form
const { control, handleSubmit } = useForm()

// Component just renders
<MasterProductDrawer
  control={control}
  onSubmit={handleDrawerSubmit}
  mode="create"
  isSubmitting={isSubmitting}
/>
```

### 4. **React Query Integration**

Proper data fetching and mutation management using `@tanstack/react-query`.

**Why it's better:**

- Automatic caching and deduplication
- Built-in loading/error/success states
- Easy invalidation to refetch data
- Optimistic updates support
- DevTools for debugging

```typescript
// Fetching
const { data, isLoading } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => ProductApi.getProducts(filters),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => ProductApi.createProduct(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Created successfully");
  },
});
```

### 5. **AdminProductsPage Component**

The page component that orchestrates everything together.

**Architecture:**

```
AdminProductsPage (Container/Presenter)
├── State Management
│   ├── useDisclosure (for drawer)
│   ├── useDisclosure (for delete confirmation)
│   └── useState (for filters)
├── Data Fetching
│   └── useQuery (products list)
├── Mutations
│   ├── useMutation (create)
│   ├── useMutation (update)
│   └── useMutation (delete)
├── Event Handlers
│   ├── handleFilterChange
│   ├── handleOpenDrawer
│   ├── handleDrawerSubmit
│   └── handleDeleteConfirm
└── Rendering
    ├── MasterProductDrawer
    ├── ConfirmDialog
    ├── DataTable
    └── FilterBar
```

## Benefits of This Architecture

### ✅ **Separation of Concerns**

- API calls in service layer
- State management in page component
- UI rendering in drawer component
- Form management with react-hook-form

### ✅ **Reusability**

- useDisclosure hook works for any modal/drawer
- API service pattern applies to all resources
- Drawer component can be used in multiple pages
- Easy to duplicate for new features

### ✅ **Maintainability**

- Single responsibility principle
- Changes to one concern don't affect others
- Easy to find and fix bugs
- Clear data flow

### ✅ **Testability**

- Components have clear inputs (props)
- Pure functions for logic
- Easy to mock API/mutations
- No implicit side effects

### ✅ **Type Safety**

- Full TypeScript support
- Proper error handling
- Compile-time checks

## How to Add Similar Features

### 1. Create API Service

```typescript
// src/services/ticketApi.ts
const TicketApi = {
  getTickets: async (filters?) => { ... },
  createTicket: async (data) => { ... },
  // ... other methods
}
```

### 2. Create Drawer/Modal Component

```typescript
// src/components/tickets/TicketDialog.tsx
export default function TicketDialog({
  open,
  onOpenChange,
  control,
  onSubmit,
  mode,
  isSubmitting,
}) {
  // Use Controller for form fields
  // Import and use FormField, FormSelectField components
}
```

### 3. Create Form Hook (optional, for reusability)

```typescript
// src/hooks/useTicketForm.ts
export function useTicketForm() {
  return useForm<TicketFormValues>({
    defaultValues: TICKET_FORM_DEFAULT_VALUES,
  });
}
```

### 4. Create Page Component

```typescript
// src/pages/admin/tickets/index.tsx
export default function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const disclosure = useDisclosure<DrawerState>();

  // ... follow AdminProductsPage pattern
}
```

## File Structure

```
frontend/
├── src/
│   ├── hooks/
│   │   ├── useDisclosure.ts          ✨ NEW - State management hook
│   │   └── authHook.ts
│   ├── services/
│   │   ├── productApi.ts             ✨ NEW - API layer
│   │   ├── api.ts
│   │   └── authApi.ts
│   ├── components/
│   │   └── products/
│   │       └── MasterProductDrawer.tsx (REFACTORED)
│   └── pages/
│       └── admin/
│           └── products/
│               └── index.tsx          ✨ NEW - Page component
```

## Key Differences from Old Pattern

| Aspect               | Old                              | New                            |
| -------------------- | -------------------------------- | ------------------------------ |
| **Form State**       | Local state in drawer            | react-hook-form in parent      |
| **Data Fetching**    | Manual with useState             | React Query with caching       |
| **Modal State**      | Multiple useState calls          | useDisclosure hook             |
| **Code Reusability** | Low - logic coupled to component | High - separated concerns      |
| **API Calls**        | Scattered in components          | Centralized in service layer   |
| **Type Safety**      | Partial                          | Full TypeScript                |
| **Error Handling**   | Basic toast                      | Proper mutation error handling |
| **Loading States**   | Manual management                | Automatic via mutations        |

## Next Steps

1. **Update Routes**: Add the new products page to your routes

```typescript
// adminRoutes.tsx
import AdminProductsPage from "@/pages/admin/products";

export const adminPaths = {
  products: "/admin/products",
  // ...
};
```

2. **Update Navigation**: Add products link to sidebar

```typescript
// sidebar-navigation.ts
{
  label: "Products",
  icon: Package,
  href: "/admin/products",
}
```

3. **Apply to Other Features**: Use the same pattern for:
   - Users management
   - Roles and permissions
   - Support tickets
   - Settings pages

## Common Patterns to Implement

### Auto-save/Draft Pattern

```typescript
const draftDisclosure = useDisclosure<TicketData>();

useEffect(() => {
  if (draftDisclosure.data) {
    // Save to localStorage/DB
  }
}, [draftDisclosure.data]);
```

### Bulk Operations

```typescript
const [selectedRows, setSelectedRows] = useState<string[]>([]);

const bulkDeleteMutation = useMutation({
  mutationFn: (ids: string[]) =>
    Promise.all(ids.map((id) => ProductApi.deleteProduct(id))),
});
```

### Export/Import

```typescript
const handleExport = () => {
  const csv = convertToCSV(productsData?.data || []);
  downloadFile(csv, "products.csv");
};
```

## Troubleshooting

### Issue: Form doesn't update when opening drawer

**Solution**: Ensure you're calling `reset()` with correct initial values before opening:

```typescript
const handleOpenDrawer = (product) => {
  reset({ ...product, price: String(product.price) }); // Convert to string!
  disclosure.onOpen({ mode: "edit", data: product });
};
```

### Issue: Drawer stays open after submit

**Solution**: Make sure to call `drawerDisclosure.onClose()` in mutation `onSuccess`:

```typescript
const mutation = useMutation({
  mutationFn: ...,
  onSuccess: () => {
    drawerDisclosure.onClose() // ✓ Don't forget!
  }
})
```

### Issue: Data doesn't refresh after create/update

**Solution**: Invalidate queries in mutation callback:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["products"] });
};
```

## Performance Considerations

- **Pagination**: Handled via `limit` in API
- **Search Debouncing**: Add to FilterBar if needed
- **Memoization**: Use `useMemo` for expensive computations
- **Table Columns**: Memoized with `useMemo` to prevent re-renders

---

## Questions & Customization

This architecture is flexible. Feel free to:

- Add fields to forms
- Extend API methods
- Add more validations with Zod
- Implement custom hooks for specific logic
- Extract components for code reuse

All changes will maintain the production-grade quality and reusability! 🚀
