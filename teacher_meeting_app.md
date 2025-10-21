# Teacher-Parent Meeting Scheduler

## 🎯 Overview
A web-based appointment scheduling system for teachers and parents. Teachers register, define their branches, classes, and available time slots. Parents (no login required) can select a class, student, and teacher to book a meeting slot with an optional note.

---

## 🧱 Tech Stack
- **Frontend:** Vite + React (TypeScript)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Auth:** JWT (Teachers only)
- **Hosting:** Any (e.g., Render, Railway, or self-hosted)
- **Optional:** Supabase for DB hosting & auth

---

## 🧩 Core Entities

### 1. Teacher
- `id`
- `name`
- `email`
- `password_hash`
- `branch`
- `require_approval` (boolean)
- `created_at`

### 2. Class
- `id`
- `grade` (1–12)
- `section` (A–D)

### 3. Teacher-Class Relation
- `teacher_id`
- `class_id`

### 4. Student
- `id`
- `name`
- `class_id`

### 5. AvailableSlot
- `id`
- `teacher_id`
- `day_of_week` (0=Mon .. 6=Sun)
- `date` (optional specific date)
- `start_time`
- `end_time`
- `timezone`
- `is_active`

### 6. Appointment
- `id`
- `teacher_id`
- `class_id`
- `student_id`
- `appointment_start`
- `appointment_end`
- `parent_name`
- `parent_email`
- `parent_phone`
- `note`
- `status` (`pending`, `confirmed`, `cancelled`, `rejected`)
- `created_at`

---

## ⚙️ API Endpoints

### Auth (Teacher)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register` | Register new teacher |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get teacher profile |

### Classes / Students
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/classes` | List all classes |
| GET | `/api/classes/{class_id}/students` | List students in a class |
| GET | `/api/classes/{class_id}/teachers` | List teachers teaching that class |

### Slots (Teacher)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/teachers/{id}/slots` | List teacher slots |
| POST | `/api/teachers/{id}/slots` | Create slot |
| PUT | `/api/teachers/{id}/slots/{slot_id}` | Update slot |
| DELETE | `/api/teachers/{id}/slots/{slot_id}` | Delete slot |

### Appointments
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/teachers/{id}/available-days` | Get days with available slots |
| GET | `/api/teachers/{id}/available-times` | Get available times for a date |
| POST | `/api/appointments` | Create appointment (Parent) |
| GET | `/api/teachers/{id}/appointments` | List teacher appointments |
| PATCH | `/api/appointments/{id}` | Update appointment status |
| DELETE | `/api/appointments/{id}` | Cancel appointment |

---

## 📱 Booking Flow (Parent UI)
1. Choose **Class** → `/api/classes`
2. Choose **Student** → `/api/classes/{id}/students`
3. Choose **Teacher** → `/api/classes/{id}/teachers`
4. See available **days** → `/api/teachers/{id}/available-days`
5. Pick **time** → `/api/teachers/{id}/available-times`
6. Enter parent info + note
7. Confirm → `POST /api/appointments`
8. Show success + details

---

## 👩‍🏫 Teacher Panel
- Dashboard: Upcoming meetings
- Slots: Create / Edit / Delete available slots
- Appointments: View, confirm, reject, or cancel meetings
- Profile: Edit personal info, branch, classes

---

## 🔐 Security & Validation
- Teachers authenticate with JWT.
- Parent booking is public but rate-limited.
- Validate conflicts: no overlapping appointments per teacher.
- Exclusion index in PostgreSQL to prevent double bookings.
- Times stored in UTC, converted for frontend.

---

## 🧰 Future Features
- Email / SMS notifications for new or cancelled meetings
- iCal export for teachers
- Weekly recurring slots
- Admin dashboard
- Multilingual support (EN/TR)

---

## 🚀 Next Steps
1. Initialize Vite + React project structure.
2. Scaffold FastAPI backend with SQLAlchemy models.
3. Set up database migrations (Alembic).
4. Implement teacher auth + CRUD endpoints.
5. Build booking flow on frontend.
6. Add appointment conflict validation and notifications.

