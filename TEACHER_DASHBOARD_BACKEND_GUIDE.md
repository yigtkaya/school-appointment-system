# Teacher Dashboard Backend Understanding

## 🎯 Overview
The teacher dashboard enables teachers to:
1. **View appointments** with parents (pending/confirmed/rejected)
2. **Manage availability slots** (create/edit/delete weekly time slots)
3. **Approve or reject** appointments if `require_approval` is enabled
4. **View profile** and manage settings

---

## 📊 Database Models (Backend)

### 1. **User Model** (`app/models/user.py`)
```
id (PK)
name: string
email: string (unique)
password_hash: string (bcrypt)
branch: string (e.g., "Mathematics", "English")
role: enum ["admin", "teacher"]
require_approval: boolean (0/1) ← KEY: If true, appointments start as "pending"
created_at: datetime
```

**Key Point**: `require_approval` controls appointment workflow:
- If `true` → Appointments auto-created as "pending", teacher must approve
- If `false` → Appointments auto-created as "confirmed", no action needed

---

### 2. **Appointment Model** (`app/models/appointment.py`)
```
id (PK)
teacher_id (FK) → User
class_id (FK) → Class
student_id (FK) → Student
appointment_start: datetime (UTC)
appointment_end: datetime (UTC)
parent_name: string
parent_email: string
parent_phone: optional string
note: optional string
status: enum ["pending", "confirmed", "cancelled", "rejected"]
created_at: datetime
```

**Status Workflow**:
- `pending` → Initial state if teacher.require_approval = true (teacher action needed)
- `confirmed` → Approved by teacher or default if no approval required
- `rejected` → Teacher rejected the booking
- `cancelled` → Either party cancelled

---

### 3. **AvailableSlot Model** (`app/models/available_slot.py`)
```
id (PK)
teacher_id (FK) → User
day_of_week: integer (0=Mon, 1=Tue, ..., 6=Sun)
date: optional datetime (specific override if needed)
start_time: time (e.g., 09:00:00)
end_time: time (e.g., 12:00:00)
timezone: string (e.g., "UTC", "EST")
is_active: boolean (true = available, false = disabled)
created_at: datetime
```

**Key Point**: Recurring weekly slots. One record per time slot per teacher per day.

Example:
```
ID  teacher  day  start     end       active
1   1        1    09:00     12:00     true     ← Tuesday 9am-12pm
2   1        3    14:00     16:00     true     ← Thursday 2pm-4pm
3   1        1    13:00     15:00     true     ← Tuesday 1pm-3pm (another slot same day)
```

---

### 4. **TeacherClass Model** (`app/models/teacher_class.py`)
```
id (PK)
teacher_id (FK) → User
class_id (FK) → Class
UNIQUE(teacher_id, class_id)
```

**Purpose**: Links teacher to classes they teach. Many-to-many relationship.

---

## 🔌 API Endpoints for Teacher Dashboard

### Authentication (already implemented)
```
POST   /api/auth/login              → Get JWT token
GET    /api/auth/me                 → Get current user profile
```

### Appointments
```
GET    /api/appointments/teachers/{teacherId}/appointments
         ↓ Response: List[Appointment]
         - Returns ALL appointments for teacher (pending, confirmed, rejected, cancelled)

PATCH  /api/appointments/{appointmentId}
         - Body: { "status": "confirmed" | "rejected" | "cancelled" }
         - Response: Updated Appointment
         
DELETE /api/appointments/{appointmentId}
         - Soft-deletes (sets status = "cancelled")
```

### Available Slots
```
GET    /api/teachers/{teacherId}/slots
         ↓ Response: List[AvailableSlot]
         - Returns all ACTIVE slots for teacher

POST   /api/teachers/{teacherId}/slots
         - Body: {
             "day_of_week": 1,
             "start_time": "09:00:00",
             "end_time": "12:00:00",
             "timezone": "UTC",
             "is_active": true
           }
         - Response: Created AvailableSlot

PUT    /api/teachers/{teacherId}/slots/{slotId}
         - Body: Partial update (any field can be omitted)
         - Response: Updated AvailableSlot

DELETE /api/teachers/{teacherId}/slots/{slotId}
         - Response: 204 No Content (hard delete)
```

---

## 🔄 Frontend Data Flow for Teacher Dashboard

### 1. Load Teacher Dashboard
```
Teacher logs in
  ↓
GET /api/auth/me → Get current user (id, name, role, require_approval)
  ↓
GET /api/appointments/teachers/{myId}/appointments
  ↓
GET /api/teachers/{myId}/slots
  ↓
Dashboard renders with:
  - Appointments list (with action buttons)
  - Slots list
  - Profile info
```

### 2. Approve Appointment
```
User clicks "Approve" button on appointment
  ↓
PATCH /api/appointments/{appointmentId}
  Body: { "status": "confirmed" }
  ↓
Appointment state updates locally
  ↓
Cache invalidates → List re-fetches
```

### 3. Add New Slot
```
User fills form:
  - day_of_week: 1 (Tuesday)
  - start_time: 09:00:00
  - end_time: 12:00:00
  ↓
POST /api/teachers/{myId}/slots
  ↓
New slot created in DB
  ↓
Slots list updates
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow
```
POST /api/auth/login
  ← access_token: "eyJhbGc..." (expires in 30 min)

Store token in localStorage (Zustand)
  ↓
All subsequent requests include:
  Authorization: Bearer eyJhbGc...

GET /api/auth/me
  ↓ Validates token from header
  ← { id, name, email, role, require_approval }
```

### Role-Based Access
```
app/core/dependencies.py:

get_current_user() 
  - Validates JWT token from Authorization header
  - Returns User object
  - Used for protected endpoints

get_current_teacher()
  - Calls get_current_user()
  - Verifies role is "teacher" or "admin"
  - Used for teacher-specific endpoints

get_current_admin()
  - Calls get_current_user()
  - Verifies role is "admin"
  - Used for admin-only endpoints
```

**Key Point**: Teachers can only modify/view their own data
```python
# In slots.py
if current_user.id != teacher_id and current_user.role.value != "admin":
    raise HTTPException(status_code=403, detail="Cannot create slots for other teachers")
```

---

## 💾 Data Validation (Pydantic Schemas)

### Request/Response Schemas

**AppointmentUpdate** (PATCH endpoint)
```python
{
  "status": "confirmed" | "rejected" | "cancelled"
}
```

**AvailableSlotCreate** (POST endpoint)
```python
{
  "day_of_week": 0-6,           # Required
  "start_time": "HH:MM:SS",     # Required
  "end_time": "HH:MM:SS",       # Required
  "timezone": "UTC",             # Optional, default "UTC"
  "is_active": true,             # Optional, default true
}
```

**AvailableSlotUpdate** (PUT endpoint)
```python
{
  "day_of_week": 0-6,            # Optional
  "start_time": "HH:MM:SS",      # Optional
  "end_time": "HH:MM:SS",        # Optional
  "timezone": "UTC",             # Optional
  "is_active": true,             # Optional
}
```

---

## ⚠️ Business Logic & Constraints

### 1. Appointment Conflict Prevention
```
Before creating appointment, backend checks:
- Does teacher already have appointment in this time slot?
- If yes → 409 Conflict error

Query logic:
  SELECT * FROM appointments
  WHERE teacher_id = {id}
    AND status IN ["pending", "confirmed"]
    AND appointment_start < {end}
    AND appointment_end > {start}
```

### 2. Slot Availability Validation
```
When parent books appointment, backend checks:
- Does teacher have AvailableSlot for this time?
- Slot must cover the appointment time

Query logic:
  SELECT * FROM available_slots
  WHERE teacher_id = {id}
    AND day_of_week = {day}
    AND is_active = true
    AND start_time <= {appointment_start.time()}
    AND end_time >= {appointment_end.time()}
```

### 3. Status Workflow Rules
```
Appointment created:
  - If teacher.require_approval = true  → status = "pending"
  - If teacher.require_approval = false → status = "confirmed"

Teacher can transition:
  pending     → confirmed (approve)
  pending     → rejected (reject)
  confirmed   → cancelled (cancel)
  pending     → cancelled (cancel)
  
Any status can go to "cancelled" (soft delete)
```

---

## 📈 Key Metrics & Queries for Dashboard

### Count Pending Appointments
```
Frontend: Filter appointments by status === "pending"

Backend Query:
  SELECT COUNT(*) FROM appointments
  WHERE teacher_id = {id} AND status = "pending"
```

### Count Confirmed Appointments
```
SELECT COUNT(*) FROM appointments
WHERE teacher_id = {id} AND status = "confirmed"
```

### Get Upcoming Appointments (Next 7 days)
```
SELECT * FROM appointments
WHERE teacher_id = {id}
  AND appointment_start >= now()
  AND appointment_start < now() + interval '7 days'
  AND status IN ["confirmed", "pending"]
ORDER BY appointment_start ASC
```

### Get Available Days This Week
```
Already implemented in slots.py:
GET /api/teachers/{id}/available-days
  ← Response: [1, 3, 5]  (Monday, Wednesday, Friday)
```

---

## 🔄 Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (POST success)
- `204` - No Content (DELETE success)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (double-booking)
- `429` - Rate Limited (too many requests)

### Example Error Response
```json
{
  "detail": "Cannot create slots for other teachers"
}
```

---

## 📚 Frontend Hook Patterns (Already Built)

### Available Hooks for Teacher Dashboard

```typescript
// Authentication
useProfile()                                    // Get current user
useAuthToken()                                  // Get JWT token
useIsAuthenticated()                            // Check if logged in

// Appointments
useTeacherAppointments(teacherId)              // Get all appointments
useUpdateAppointmentMutation(appointmentId)    // Approve/reject/cancel
useDeleteAppointmentMutation()                 // Cancel (soft delete)

// Slots
useTeacherSlots(teacherId)                     // Get all slots
useCreateSlotMutation(teacherId)               // Create new slot
useUpdateSlotMutation(teacherId, slotId)       // Edit slot
useDeleteSlotMutation(teacherId)               // Delete slot
useTeacherAvailableDays(teacherId)             // Get available days
useTeacherAvailableTimes(teacherId, date)      // Get available times for date
```

---

## 🚀 Summary: What Teacher Dashboard Needs

1. **Fetch current user** → Get teacher ID and require_approval setting
2. **Fetch appointments** → Use `useTeacherAppointments(userId)`
3. **Fetch slots** → Use `useTeacherSlots(userId)`
4. **Show tabs**:
   - **Appointments**: List with approve/reject/cancel buttons
   - **Slots**: Weekly calendar view with add/edit/delete
   - **Profile**: Teacher info (name, email, branch, require_approval toggle)
5. **Handle mutations**:
   - Approve appointment: `useUpdateAppointmentMutation()` with status="confirmed"
   - Reject: status="rejected"
   - Create slot: `useCreateSlotMutation()`
   - Delete slot: `useDeleteSlotMutation()`

---

## 🔗 References

**Backend Files**:
- Models: `backend/app/models/` (user, appointment, available_slot, teacher_class)
- Routers: `backend/app/routers/slots.py`, `appointments.py`, `auth.py`
- Schemas: `backend/app/schemas/` (slot, appointment, user)
- Security: `backend/app/core/dependencies.py` (role-based access)

**Frontend Files**:
- Hooks: `frontend/src/hooks/` (useTeacherAppointments, useTeacherSlots, etc.)
- Auth Store: `frontend/src/store/auth.ts` (token + user persistence)
- Types: `frontend/src/types/schemas.ts` (TypeScript interfaces)

---

**Created**: October 2025
**Status**: Backend fully understood, ready for frontend implementation
