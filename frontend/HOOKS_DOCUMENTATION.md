# Admin Hooks Documentation

This document provides an overview of all the admin hooks that have been created for managing the school appointment system.

## Hook Files

### 1. `hooks/admin.ts` - CRUD Operations
Contains all mutation hooks for creating, updating, and deleting resources.

#### Teacher Operations
- `useCreateTeacher()` - Create a new teacher
- `useUpdateTeacher()` - Update an existing teacher
- `useDeleteTeacher()` - Delete a teacher

#### Parent Operations
- `useCreateParent()` - Create a new parent
- `useUpdateParent()` - Update an existing parent
- `useDeleteParent()` - Delete a parent

#### Slot Operations
- `useCreateSlot()` - Create a single slot
- `useCreateBulkSlots()` - Create multiple slots at once
- `useCreateSmartSlots()` - Create slots using the smart algorithm
- `useUpdateSlot()` - Update an existing slot
- `useDeleteSlot()` - Delete a slot

#### Notification Operations
- `useSendManualNotification()` - Send a manual notification

---

### 2. `hooks/teachers.ts` - Teacher Data Fetching
Query hooks for retrieving teacher data.

#### Hooks
- `useTeachers(filters?)` - Fetch all teachers with optional filters (subject, branch)
- `useTeacherById(id)` - Fetch a single teacher by ID
- `useTeacherByUserId(userId)` - Fetch a teacher by user ID

#### Query Keys
```typescript
export const teachersKeys = {
  all: ['teachers'],
  list: (filters?) => [...teachersKeys.all, 'list', filters],
  detail: (id) => [...teachersKeys.all, 'detail', id],
  byUserId: (userId) => [...teachersKeys.all, 'byUserId', userId],
}
```

---

### 3. `hooks/parents.ts` - Parent Data Fetching
Query hooks for retrieving parent data.

#### Hooks
- `useParents(filters?)` - Fetch all parents with optional filters (student_class, grade)
- `useParentMe()` - Fetch current user's parent profile
- `useParentById(parentId)` - Fetch a single parent by ID
- `useParentByUserId(userId)` - Fetch a parent by user ID

#### Query Keys
```typescript
export const parentsKeys = {
  all: ['parents'],
  list: (filters?) => [...parentsKeys.all, 'list', filters],
  detail: (id) => [...parentsKeys.all, 'detail', id],
  me: ['parents', 'me'],
  byUserId: (userId) => [...parentsKeys.all, 'byUserId', userId],
}
```

---

### 4. `hooks/slots.ts` - Slot Data Fetching
Query hooks for retrieving slot data and preview functionality.

#### Hooks
- `useSlots(filters?)` - Fetch all slots with optional filters
- `useSlotById(slotId)` - Fetch a single slot by ID
- `useTeacherSchedule(teacherId, weekStart?)` - Fetch a teacher's weekly schedule
- `usePreviewSmartSlots()` - Mutation hook to preview smart slots before creating

#### Query Keys
```typescript
export const slotsKeys = {
  all: ['slots'],
  list: (filters?) => [...slotsKeys.all, 'list', filters],
  detail: (id) => [...slotsKeys.all, 'detail', id],
  schedule: (teacherId, weekStart?) => [...slotsKeys.all, 'schedule', teacherId, weekStart],
}
```

---

### 5. `hooks/appointments.ts` - Appointment Data Fetching and Management
Query and mutation hooks for managing appointments.

#### Query Hooks
- `useAppointments(filters?)` - Fetch all appointments with optional filters
- `useAppointmentById(appointmentId)` - Fetch a single appointment by ID
- `useParentAppointments(parentId)` - Fetch all appointments for a specific parent
- `useTeacherAppointments(teacherId)` - Fetch all appointments for a specific teacher

#### Mutation Hooks
- `useUpdateAppointmentStatus()` - Update appointment status (pending, confirmed, cancelled, completed)
- `useCancelAppointment()` - Cancel an appointment

#### Query Keys
```typescript
export const appointmentsKeys = {
  all: ['appointments'],
  list: (filters?) => [...appointmentsKeys.all, 'list', filters],
  detail: (id) => [...appointmentsKeys.all, 'detail', id],
  parentAppointments: (parentId) => [...appointmentsKeys.all, 'parent', parentId],
  teacherAppointments: (teacherId) => [...appointmentsKeys.all, 'teacher', teacherId],
}
```

---

### 6. `hooks/notifications.ts` - Notification Data Fetching and Management
Query and mutation hooks for managing notifications.

#### Query Hooks
- `useNotifications(filters?)` - Fetch all notifications with optional filters
- `useNotificationById(notificationId)` - Fetch a single notification by ID
- `useNotificationStats(params?)` - Fetch notification statistics

#### Mutation Hooks
- `useResendNotification()` - Resend a failed notification
- `useDeleteNotification()` - Delete a notification

#### Query Keys
```typescript
export const notificationsKeys = {
  all: ['notifications'],
  list: (filters?) => [...notificationsKeys.all, 'list', filters],
  detail: (id) => [...notificationsKeys.all, 'detail', id],
  stats: (params?) => [...notificationsKeys.all, 'stats', params],
}
```

---

## Usage Examples

### Example 1: Creating a Teacher
```typescript
import { useCreateTeacher } from '@/hooks'

function TeacherForm() {
  const { mutate: createTeacher, isPending } = useCreateTeacher()

  const handleSubmit = (data: TeacherCreate) => {
    createTeacher(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Example 2: Fetching and Displaying Teachers
```typescript
import { useTeachers } from '@/hooks'

function TeacherList() {
  const { data: teachers, isLoading, error } = useTeachers({ subject: 'Math' })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading teachers</div>

  return (
    <ul>
      {teachers?.map(teacher => (
        <li key={teacher.id}>{teacher.user.full_name}</li>
      ))}
    </ul>
  )
}
```

### Example 3: Updating Appointment Status
```typescript
import { useUpdateAppointmentStatus } from '@/hooks'

function AppointmentCard({ appointmentId }) {
  const { mutate: updateStatus } = useUpdateAppointmentStatus()

  const handleConfirm = () => {
    updateStatus({
      appointmentId,
      status: 'confirmed'
    })
  }

  return (
    <button onClick={handleConfirm}>Confirm Appointment</button>
  )
}
```

### Example 4: Sending a Notification
```typescript
import { useSendManualNotification } from '@/hooks'

function NotificationForm() {
  const { mutate: sendNotification } = useSendManualNotification()

  const handleSend = () => {
    sendNotification({
      recipient_email: 'parent@example.com',
      subject: 'Appointment Reminder',
      message: 'Your appointment is tomorrow at 2 PM',
      type: 'reminder'
    })
  }

  return (
    <button onClick={handleSend}>Send Notification</button>
  )
}
```

---

## Features

✅ **Centralized Query Keys** - All hooks export their query keys for easy invalidation and prefetching
✅ **Automatic Error Handling** - Toast notifications for success and error states
✅ **Query Invalidation** - Automatic cache invalidation on mutations
✅ **Type Safety** - Full TypeScript support with proper typing
✅ **Flexible Filtering** - Most hooks support optional filters
✅ **Stale Time Configuration** - Optimized stale times for different data types
✅ **Enabled Queries** - Conditional query execution with the `enabled` parameter

---

## Import Patterns

### Import All Hooks
```typescript
import * from '@/hooks'
```

### Import Specific Hooks
```typescript
import { useTeachers, useCreateTeacher, useTeacherById } from '@/hooks'
```

### Import Query Keys
```typescript
import { teachersKeys, parentsKeys, slotsKeys } from '@/hooks'
```

---

## Notes

- All CRUD hooks automatically invalidate relevant queries on success
- Toast notifications provide user feedback for all operations
- Query keys follow a hierarchical pattern for easy debugging
- Stale times are optimized based on data update frequency
- Use the query keys for manual cache management if needed
