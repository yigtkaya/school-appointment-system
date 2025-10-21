# Backend Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)                  │
│                   (To be built - Tasks 1-16)                     │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                                                                   │
│                    FastAPI Backend (Complete ✅)                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Security Middleware                      │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │   │
│  │  │  Rate   │ │  CORS    │ │ Trusted  │ │   GZIP      │ │   │
│  │  │ Limit   │ │  Policy  │ │  Host    │ │ Compression │ │   │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              Route Handlers (5 Routers)                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Auth    │ │ Classes  │ │  Slots   │ │ Appt.    │  │   │
│  │  │  (3 ep)  │ │  (9 ep)  │ │  (6 ep)  │ │ (4 ep)   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Admin Router (20+ endpoints)                   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              Data Models & Validation                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  User    │ │  Class   │ │ Student  │ │ Slot     │  │   │
│  │  │ (roles)  │ │          │ │          │ │ (avail)  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Appointment (with conflict prevention)        │   │   │
│  │  │  TeacherClass (many-to-many relationship)      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
└────────────────────────────┬──────────────────────────────────────┘
                             │ SQL
                             │
         ┌───────────────────┴────────────────────┐
         │                                        │
┌────────▼──────┐                      ┌─────────▼────────┐
│   PostgreSQL  │                      │ Alembic          │
│   Database    │                      │ Migrations       │
└───────────────┘                      └──────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                   │
│ ├─ CORS: Whitelist frontend origins                         │
│ ├─ Trusted Host: Validate Host header                       │
│ └─ HTTPS/TLS: Secure transport (production)                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Rate Limiting                                      │
│ ├─ General: 60 requests/minute per IP                       │
│ ├─ Public booking: 10 requests/minute per IP                │
│ └─ Sliding window: 60-second reset                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Authentication                                     │
│ ├─ JWT tokens: 30-minute expiry                             │
│ ├─ Password hashing: bcrypt algorithm                       │
│ └─ Secure secret key: Production-specific                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Authorization                                      │
│ ├─ Role-Based Access Control (RBAC)                         │
│ ├─ Endpoint-level protection                                │
│ ├─ Resource ownership validation                            │
│ └─ Admin-only endpoint enforcement                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Business Logic Security                            │
│ ├─ Conflict prevention: No double-booking                   │
│ ├─ Cascade delete: Orphan prevention                        │
│ ├─ Status validation: Only valid states                     │
│ └─ Timezone handling: UTC storage, local display            │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Parent Booking Flow
```
Parent Browser
     │
     ├─→ GET /api/classes (no auth)
     │   ↓ [List of classes]
     │
     ├─→ GET /api/classes/1/students (no auth)
     │   ↓ [List of students]
     │
     ├─→ GET /api/classes/1/teachers (no auth)
     │   ↓ [List of teachers]
     │
     ├─→ GET /api/teachers/1/available-days (no auth)
     │   ↓ [Available weekdays]
     │
     ├─→ GET /api/teachers/1/available-times?date=... (no auth)
     │   ↓ [Available time slots]
     │
     └─→ POST /api/appointments (rate limited: 10/min)
         ├─ Check conflict: No existing appointment?
         ├─ Check slot: Teacher has slot?
         ├─ Set status: Pending (if require_approval) or Confirmed
         └─ Return: Appointment created
```

### Teacher Management (Admin) Flow
```
Admin Dashboard
     │
     ├─→ POST /api/auth/login
     │   └─ JWT token (with admin role)
     │
     ├─→ POST /api/admin/teachers (auth: Bearer token, role: admin)
     │   └─ Create new teacher
     │
     ├─→ POST /api/teacher-classes (auth required)
     │   └─ Assign teacher to classes
     │
     ├─→ POST /api/admin/teachers/{id}/require-approval
     │   └─ Set approval requirement
     │
     └─→ GET /api/admin/appointments/stats
         └─ Dashboard statistics
```

### Appointment Approval Flow
```
Teacher receives booking (status: pending)
     │
     ├─→ Teacher logs in → GET /api/auth/me
     │
     ├─→ GET /api/appointments/teachers/{id}/appointments
     │   └─ View all pending appointments
     │
     └─→ PATCH /api/appointments/{id}
         ├─ Update status: "confirmed" or "rejected"
         └─ Parent notified (email - future feature)
```

---

## Database Schema

```
┌─────────────────────────────────┐
│            USERS                │
├─────────────────────────────────┤
│ id (PK)                         │
│ name                            │
│ email (UNIQUE)                  │
│ password_hash                   │
│ branch                          │
│ role (admin/teacher)            │ ◄──────┐
│ require_approval                │       │
│ created_at                      │       │
└─────────────────────────────────┘       │
         │                                │
         ├──────────┬──────────┬──────┐   │
         │          │          │      │   │
    ┌────▼───┐ ┌───▼────┐ ┌───▼──┐  │   │
    │CLASSES │ │STUDENTS│ │SLOTS │  │   │
    ├────────┤ ├────────┤ ├──────┤  │   │
    │id (PK) │ │id (PK) │ │id(PK)│  │   │
    │grade   │ │name    │ │day_of│  │   │
    │section │ │class_id│─│week  │  │   │
    └────┬───┘ │        │ │start │  │   │
         │     │        │ │time  │  │   │
         │     │        │ │end   │  │   │
         │     │        │ │time  │  │   │
         │     │        │ │tzinfo│  │   │
         │     │        │ │active│  │   │
         │     └────────┘ └──┬───┘  │   │
         │                   │      │   │
    ┌────▼──────────┐  teacher_id──┘   │
    │TEACHER_CLASSES│          (FK)    │
    ├───────────────┤                  │
    │id (PK)        │                  │
    │teacher_id (FK)├──────────────────┘
    │class_id (FK)  │──┘
    │UNIQUE(teacher │
    │    ,class)    │
    └───────────────┘
         │
         └──── Many-to-Many ────┐
                               │
    ┌──────────────────────────▼──┐
    │   APPOINTMENTS               │
    ├──────────────────────────────┤
    │ id (PK)                      │
    │ teacher_id (FK)              │
    │ class_id (FK)                │
    │ student_id (FK)              │
    │ appointment_start            │
    │ appointment_end              │
    │ parent_name                  │
    │ parent_email                 │
    │ parent_phone                 │
    │ note                         │
    │ status (enum)                │
    │ created_at                   │
    └──────────────────────────────┘
```

---

## Endpoint Grouping

```
PUBLIC ENDPOINTS (Rate: 60/min)
├── GET    /api/classes
├── GET    /api/classes/{id}
├── GET    /api/classes/{id}/students
├── GET    /api/classes/{id}/teachers
├── GET    /api/students/{id}
├── GET    /api/teachers/{id}/available-days
├── GET    /api/teachers/{id}/available-times
├── POST   /api/appointments (Rate: 10/min)
└── GET    /health

AUTHENTICATED ENDPOINTS (Requires JWT)
├── GET    /api/auth/me
├── GET    /api/teachers/{id}/slots
├── POST   /api/teachers/{id}/slots
├── PUT    /api/teachers/{id}/slots/{slot_id}
├── DELETE /api/teachers/{id}/slots/{slot_id}
├── GET    /api/appointments/teachers/{id}/appointments
├── PATCH  /api/appointments/{id}
└── DELETE /api/appointments/{id}

ADMIN ONLY ENDPOINTS (Requires JWT + Admin Role)
├── GET    /api/admin/teachers
├── POST   /api/admin/teachers
├── GET    /api/admin/teachers/{id}
├── PUT    /api/admin/teachers/{id}
├── DELETE /api/admin/teachers/{id}
├── POST   /api/admin/teachers/{id}/approve
├── POST   /api/admin/teachers/{id}/require-approval
├── POST   /api/admin/classes
├── PUT    /api/admin/classes/{id}
├── DELETE /api/admin/classes/{id}
├── POST   /api/admin/students
├── PUT    /api/admin/students/{id}
├── DELETE /api/admin/students/{id}
├── GET    /api/admin/appointments
├── GET    /api/admin/appointments/stats
├── GET    /api/admin/appointments/{id}
├── POST   /api/auth/register
└── POST   /api/auth/login
```

---

## Request/Response Cycle

```
Client Request
    │
    ├─→ Middleware Stack
    │   ├─ Trusted Host Check
    │   ├─ Rate Limit Check
    │   ├─ CORS Validation
    │   └─ Compression Setup
    │
    ├─→ Route Handler
    │   ├─ Parse Request
    │   ├─ Validate Schemas (Pydantic)
    │   ├─ Check Authentication (JWT)
    │   ├─ Verify Authorization (RBAC)
    │   ├─ Business Logic
    │   │   ├─ Database Query/Update
    │   │   ├─ Conflict Check
    │   │   └─ Validation
    │   └─ Generate Response
    │
    ├─→ Middleware Stack (Response)
    │   ├─ Add Rate Limit Headers
    │   ├─ Add Processing Time
    │   ├─ Compress Response
    │   └─ Apply CORS Headers
    │
    └─→ Client Response (JSON)
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────┐
│         Frontend (Static Hosting)          │
│    (Vercel/Netlify) - Tasks 19            │
└──────────────────┬─────────────────────────┘
                   │ HTTPS
                   │
┌──────────────────▼─────────────────────────┐
│       API Gateway / Load Balancer           │
│         (Render/Railway)                    │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│      Docker Container (FastAPI)             │
│    ├─ FastAPI Application                  │
│    ├─ Environment Configuration            │
│    └─ Health Checks                        │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│      PostgreSQL Database (Docker)           │
│    ├─ Tables & Indexes                     │
│    ├─ Persistent Volume                    │
│    └─ Backups                              │
└─────────────────────────────────────────────┘
```

---

## Configuration Management

```
Environment Variables
    │
    ├─ Development (.env)
    │  └─ DEBUG=True, localhost URLs, rate limits
    │
    ├─ Docker (.env.docker)
    │  └─ DEBUG=False, container URLs, optimized
    │
    └─ Production
       └─ HTTPS, prod domains, enhanced security
```

---

## Summary

This architecture provides:
- ✅ **Scalable**: Stateless API, database driven
- ✅ **Secure**: Multi-layer security
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Observable**: Monitoring headers & health checks
- ✅ **Production Ready**: Docker, environment config
- ✅ **Well Documented**: API docs & security guides
