# Frontend API Hooks - Quick Reference

## File Structure

```
frontend/src/
├── api/
│   └── client.ts              # Fetch-based API client
├── lib/
│   └── config.ts              # API endpoints configuration
├── store/
│   └── auth.ts                # Zustand auth store
├── types/
│   └── schemas.ts             # Zod validation schemas
└── hooks/                      # Modular API hooks
    ├── index.ts               # Central exports
    ├── queryKeys.ts           # Query key factory
    ├── useAuth.ts             # Auth hooks (login, register, profile)
    ├── useAuth.utils.tsx      # Auth utilities (ProtectedRoute, role checks)
    ├── useClasses.ts          # Class CRUD hooks
    ├── useStudents.ts         # Student CRUD hooks
    ├── useSlots.ts            # Teacher slot management hooks
    ├── useAppointments.ts     # Appointment management hooks
    └── useAdminUsers.ts       # User management hooks
```

## Import Everything from One Place

```typescript
// All imports from @/hooks
import {
  // Auth
  useProfile,
  useLoginMutation,
  useRegisterMutation,
  
  // Classes
  useClasses,
  useCreateClassMutation,
  
  // Appointments
  useAppointments,
  useCreateAppointmentMutation,
  
  // Utilities
  ProtectedRoute,
  useHasRole,
  useCurrentUser,
  
  // Query keys
  queryKeys,
} from '@/hooks';
```

## Separate Files by Feature

| Feature | File | Hooks |
|---------|------|-------|
| **Authentication** | `useAuth.ts` | `useProfile`, `useLoginMutation`, `useRegisterMutation` |
| **Auth Utils** | `useAuth.utils.tsx` | `ProtectedRoute`, `useHasRole`, `useCurrentUser`, `useAuthToken`, `useIsAuthenticated` |
| **Classes** | `useClasses.ts` | `useClasses`, `useClass`, `useCreateClassMutation`, `useUpdateClassMutation`, `useDeleteClassMutation` |
| **Students** | `useStudents.ts` | `useStudents`, `useStudent`, `useCreateStudentMutation`, `useUpdateStudentMutation`, `useDeleteStudentMutation` |
| **Slots** | `useSlots.ts` | `useTeacherSlots`, `useCreateSlotMutation`, `useUpdateSlotMutation`, `useDeleteSlotMutation`, `useTeacherAvailableDays`, `useTeacherAvailableTimes` |
| **Appointments** | `useAppointments.ts` | `useAppointments`, `useTeacherAppointments`, `useAppointment`, `useCreateAppointmentMutation`, `useUpdateAppointmentMutation`, `useDeleteAppointmentMutation` |
| **Admin Users** | `useAdminUsers.ts` | `useUsers`, `useUser`, `useCreateUserMutation`, `useUpdateUserMutation`, `useDeleteUserMutation` |
| **Query Keys** | `queryKeys.ts` | `queryKeys` factory object |

## Key Technologies

- **API Calls:** Native Fetch API (in `src/api/client.ts`)
- **State Management:** TanStack React Query for server state
- **Client State:** Zustand (auth store)
- **Validation:** Zod schemas
- **Token Management:** localStorage + Zustand persistence

## Token Injection

All hooks automatically:
1. Read token from `localStorage` (Zustand persisted state)
2. Inject as `Authorization: Bearer {token}` header
3. Only execute when token exists (`enabled: !!token`)

```typescript
// Each hook internally does this:
const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};
```

## Error Handling

All hooks return `APIError` with status and data:

```typescript
import { APIError } from '@/api/client';

try {
  await mutation.mutateAsync(data);
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.status, error.data); // Backend response
  }
}
```

## Cache Management

Query keys are centralized in `queryKeys.ts` for automatic cache invalidation:

```typescript
queryKeys.classes();              // ['api', 'classes']
queryKeys.class(1);              // ['api', 'classes', 1]
queryKeys.teacherAppointments(2);// ['api', 'appointments', 'teacher', 2]
```

When mutations succeed, related queries are invalidated:
- Create → Invalidates list query
- Update → Invalidates item + list queries
- Delete → Invalidates list query

## Usage Examples

### Fetch Data with Loading/Error States
```typescript
const { data, isLoading, isError, error } = useClasses();

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error?.message}</div>;
return <div>{data?.length} classes</div>;
```

### Create with Mutation
```typescript
const mutation = useCreateClassMutation();

return (
  <button 
    onClick={() => mutation.mutateAsync(data)}
    disabled={mutation.isPending}
  >
    {mutation.isPending ? 'Creating...' : 'Create'}
  </button>
);
```

### Protected Admin Route
```typescript
import { ProtectedRoute } from '@/hooks';

function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Dashboard</div>
    </ProtectedRoute>
  );
}
```

### Check User Role
```typescript
const { useHasRole } from '@/hooks';

function ConditionalFeature() {
  const isTeacher = useHasRole('teacher');
  const isAdmin = useHasRole(['admin', 'teacher']);
  
  if (!isTeacher) return <div>Teachers only</div>;
  return <div>Feature</div>;
}
```

## Building

```bash
# Type check and build
npm run build

# Dev server
npm run dev

# Preview production build
npm run preview
```

Build succeeds ✓ with:
- ✅ TypeScript compilation
- ✅ Type-safe hooks
- ✅ Zero unused imports
- ✅ All 9 hook files organized
