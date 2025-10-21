# Frontend API Hooks Structure

## Overview

The frontend uses organized, modular API hooks built with **TanStack React Query** and the **native Fetch API**. All hooks are organized by endpoint groups for maintainability and scalability.

## Architecture

### Query Client Setup

The hooks use TanStack Query's `useQuery` and `useMutation` patterns with:
- Centralized query key factory in `queryKeys.ts`
- Automatic cache invalidation on mutations
- Token management via localStorage (Zustand store)
- Type-safe data fetching with TypeScript

### File Organization

```
src/hooks/
├── index.ts              # Central export point
├── queryKeys.ts          # Query key factory (cache management)
├── useAuth.ts            # Authentication hooks
├── useClasses.ts         # Class management hooks
├── useStudents.ts        # Student management hooks
├── useSlots.ts           # Teacher availability slots hooks
├── useAppointments.ts    # Appointment management hooks
└── useAdminUsers.ts      # Admin user management hooks
```

## Hook Groups

### 1. Authentication (`useAuth.ts`)

Handles user authentication and profile management.

**Hooks:**
- `useProfile()` - Get current authenticated user
- `useRegisterMutation()` - Register new user
- `useLoginMutation()` - User login

**Usage:**
```typescript
import { useProfile, useLoginMutation } from '@/hooks';

function Login() {
  const loginMutation = useLoginMutation();
  
  const handleLogin = async (email: string, password: string) => {
    const { access_token } = await loginMutation.mutateAsync({ email, password });
    localStorage.setItem('auth-token', access_token);
  };
}
```

### 2. Classes (`useClasses.ts`)

Manage class information (admin operations).

**Hooks:**
- `useClasses()` - Get all classes
- `useClass(id)` - Get specific class
- `useCreateClassMutation()` - Create new class (admin)
- `useUpdateClassMutation(id)` - Update class (admin)
- `useDeleteClassMutation()` - Delete class (admin)

**Usage:**
```typescript
import { useClasses, useCreateClassMutation } from '@/hooks';

function ClassManager() {
  const { data: classes } = useClasses();
  const createMutation = useCreateClassMutation();
  
  const handleCreate = async (classData: CreateClass) => {
    await createMutation.mutateAsync(classData);
    // Cache automatically invalidated
  };
}
```

### 3. Students (`useStudents.ts`)

Manage student information (admin operations).

**Hooks:**
- `useStudents()` - Get all students
- `useStudent(id)` - Get specific student
- `useCreateStudentMutation()` - Create student (admin)
- `useUpdateStudentMutation(id)` - Update student (admin)
- `useDeleteStudentMutation()` - Delete student (admin)

### 4. Available Slots (`useSlots.ts`)

Manage teacher availability slots.

**Hooks:**
- `useTeacherSlots(teacherId)` - Get teacher's availability slots
- `useCreateSlotMutation(teacherId)` - Create new slot
- `useUpdateSlotMutation(teacherId, slotId)` - Update slot
- `useDeleteSlotMutation(teacherId)` - Delete slot
- `useTeacherAvailableDays(teacherId)` - Get available days
- `useTeacherAvailableTimes(teacherId, date)` - Get available times for date

**Usage:**
```typescript
import { useTeacherSlots, useCreateSlotMutation } from '@/hooks';

function TeacherSlots({ teacherId }: { teacherId: number }) {
  const { data: slots } = useTeacherSlots(teacherId);
  const createMutation = useCreateSlotMutation(teacherId);
  
  const handleAddSlot = async (slot: CreateAvailableSlot) => {
    await createMutation.mutateAsync(slot);
    // Slots automatically refetched
  };
}
```

### 5. Appointments (`useAppointments.ts`)

Manage appointment scheduling and tracking.

**Hooks:**
- `useAppointments()` - Get all appointments (admin)
- `useTeacherAppointments(teacherId)` - Get teacher's appointments
- `useAppointment(id)` - Get specific appointment
- `useCreateAppointmentMutation()` - Book new appointment
- `useUpdateAppointmentMutation(id)` - Update appointment (status, notes)
- `useDeleteAppointmentMutation()` - Cancel appointment

**Usage:**
```typescript
import { useCreateAppointmentMutation, useTeacherAppointments } from '@/hooks';

function BookAppointment({ teacherId }: { teacherId: number }) {
  const { data: appointments } = useTeacherAppointments(teacherId);
  const bookMutation = useCreateAppointmentMutation();
  
  const handleBook = async (appointmentData: CreateAppointment) => {
    await bookMutation.mutateAsync(appointmentData);
  };
}
```

### 6. Admin Users (`useAdminUsers.ts`)

Admin-only user management operations.

**Hooks:**
- `useUsers()` - Get all users (admin)
- `useUser(id)` - Get specific user
- `useCreateUserMutation()` - Create user (admin)
- `useUpdateUserMutation(id)` - Update user (admin)
- `useDeleteUserMutation()` - Delete user (admin)

## Query Keys (`queryKeys.ts`)

Centralized query key factory ensures consistent cache management:

```typescript
export const queryKeys = {
  all: ['api'] as const,
  auth: () => ['api', 'auth'],
  users: () => ['api', 'users'],
  user: (id) => ['api', 'users', id],
  classes: () => ['api', 'classes'],
  // ... etc
};
```

**Benefits:**
- Consistent cache keys across the app
- Easy to invalidate related queries
- Type-safe query references

## Token Management

All hooks automatically fetch the token from localStorage (Zustand storage):

```typescript
const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};
```

**Token is automatically:**
- Injected into request headers as `Authorization: Bearer {token}`
- Retrieved from Zustand store persistence
- Used to conditionally enable/disable queries

## Error Handling

All hooks use the custom `APIError` class:

```typescript
export class APIError extends Error {
  status: number;
  data: unknown;
  // ...
}

// In components
try {
  await mutation.mutateAsync(data);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`Error ${error.status}: ${error.message}`);
    console.error(error.data); // Backend error details
  }
}
```

## Usage Pattern

### Basic Query
```typescript
const { data, isLoading, isError, error } = useClasses();

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error?.message}</div>;
return <div>{data?.length} classes found</div>;
```

### Mutation with Error Handling
```typescript
const mutation = useCreateClassMutation();

const handleCreate = async (classData: CreateClass) => {
  try {
    await mutation.mutateAsync(classData);
    // Success - cache automatically updated
  } catch (error) {
    if (error instanceof APIError) {
      setError(error.data?.detail || 'Failed to create class');
    }
  }
};

return (
  <button 
    onClick={() => handleCreate(data)}
    disabled={mutation.isPending}
  >
    {mutation.isPending ? 'Creating...' : 'Create'}
  </button>
);
```

### Multiple Queries
```typescript
const classesQuery = useClasses();
const studentsQuery = useStudents();
const appointmentsQuery = useAppointments();

const isLoading = classesQuery.isLoading || 
                  studentsQuery.isLoading || 
                  appointmentsQuery.isLoading;

if (isLoading) return <div>Loading...</div>;
```

## Benefits of This Structure

✅ **Modularity** - Each endpoint group in separate file  
✅ **Reusability** - Import only needed hooks  
✅ **Testability** - Easy to mock individual hooks  
✅ **Scalability** - Add new endpoint groups without complexity  
✅ **Type Safety** - Full TypeScript support with Zod schemas  
✅ **Cache Management** - Centralized query keys prevent duplication  
✅ **DRY Principle** - No repeated fetch logic  
✅ **Error Handling** - Consistent error handling across hooks  

## Next Steps

The hooks are ready to use in React components. Next, we'll implement:
1. **Authentication pages** - Login/Register components
2. **Protected routes** - Route guarding with auth state
3. **Admin dashboard** - CRUD interfaces for all admin operations
4. **Teacher dashboard** - Appointment and slot management UI
5. **Parent booking flow** - End-to-end booking experience
