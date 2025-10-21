# AI Coding Agent Instructions for School Appointment System

This document guides AI agents in being productive contributors to the Teacher-Parent Meeting Scheduler codebase.

## 🎯 Project Overview

**Purpose**: A full-stack web application enabling teachers and parents to schedule meetings efficiently.

**Architecture**: 
- **Backend**: FastAPI (Python) with PostgreSQL and SQLAlchemy ORM
- **Frontend**: React 19 + TypeScript with Vite, TanStack Query, Zustand, and TailwindCSS
- **Deployment**: Dockerized backend + separate frontend hosting

**Key Flows**:
1. **Parent Booking**: Select class → student → teacher → pick available slot → book appointment
2. **Teacher Management**: Admin creates/manages teachers, assigns to classes, sets availability
3. **Appointment Approval**: Teachers review pending appointments, approve or reject

## 🏗️ Architecture Patterns

### Backend (FastAPI) Structure

**File Organization**:
- `app/core/` - Configuration, security, dependency injection
- `app/models/` - SQLAlchemy ORM models (User, Class, Student, Appointment, AvailableSlot, TeacherClass)
- `app/schemas/` - Pydantic validation schemas (separate from models)
- `app/routers/` - API endpoint handlers (auth, classes, slots, appointments, admin)
- `app/db/` - Database connection and session management
- `migrations/` - Alembic version control for schema changes

**Key Pattern - Dependency Injection**:
```python
# app/core/dependencies.py defines:
- get_current_user() - JWT verification from HTTPBearer token
- get_current_admin() - Role check for admin endpoints
- get_current_teacher() - Role check for teacher endpoints
```
Use these in route signatures: `async def endpoint(current_user: User = Depends(get_current_admin))`

**Middleware Stack** (order matters - see main.py):
1. TrustedHostMiddleware - Host validation
2. GZIPMiddleware - Response compression
3. CORSMiddleware - Cross-origin requests
4. RateLimitMiddleware - Request throttling (60/min default, 10/min for booking)
5. ValidationMiddleware - Request/response validation

**Security Model**:
- JWT tokens expire in 30 minutes (configurable)
- Passwords hashed with bcrypt via passlib
- Role-based access: `UserRole.ADMIN | UserRole.TEACHER`
- Public endpoints: class/student/teacher info, appointment booking
- Protected endpoints: slot management, appointment viewing
- Admin-only endpoints: user management, approval workflows

### Frontend (React) Structure

**File Organization**:
- `src/hooks/` - TanStack Query hooks organized by domain (useAuth, useClasses, useSlots, etc.)
- `src/store/` - Zustand stores (currently: auth.ts with token + user persistence)
- `src/api/` - Fetch client with token injection
- `src/types/` - TypeScript interfaces and Zod schemas
- `src/components/` - React components (TeacherDashboard, etc.)

**Hook Pattern** (TanStack Query + Zustand):
```typescript
// Query keys centralized in queryKeys.ts
export const queryKeys = {
  all: ['api'] as const,
  classes: () => ['api', 'classes'],
  class: (id) => ['api', 'classes', id],
  // ...
};

// Hooks handle cache invalidation on mutations
export const useCreateClassMutation = () =>
  useMutation({
    mutationFn: (data) => api.post('/classes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.classes() }),
  });
```

**Token Management**:
- Stored in Zustand with localStorage persistence (`useAuthStore`)
- Automatically injected into all requests: `Authorization: Bearer {token}`
- Extracted from localStorage when needed

**State Management**:
- Auth state: Zustand (centralized token + user)
- Server state: TanStack Query (with automatic cache invalidation)
- Component state: React hooks (local, transient UI state)

## 📋 Key Developer Workflows

### Backend - Database Migrations
```bash
# Create auto-detected schema change
alembic revision --autogenerate -m "Add column to users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Pattern**: SQLAlchemy models in `app/models/` are auto-detected by Alembic. Always generate migrations after model changes.

### Backend - Adding New Endpoints
1. Create schema in `app/schemas/{domain}.py` (Pydantic models for request/response)
2. Add route in `app/routers/{domain}.py`
3. Import dependencies for auth: `get_current_user`, `get_current_admin`
4. Implement business logic, catch conflicts (e.g., duplicate appointments)
5. Return appropriate status code (201 for creation, 400 for validation errors)

### Backend - Development Server
```bash
cd backend
python main.py  # Hot-reload enabled when DEBUG=True
# API docs: http://localhost:8000/docs (Swagger UI)
```

### Frontend - Adding New Feature
1. Create hook in `src/hooks/` using TanStack Query pattern
2. Add query keys to `src/hooks/queryKeys.ts`
3. Build React component importing the hook
4. Handle loading/error/success states
5. Component automatically re-renders when cache updates

### Frontend - Development Server
```bash
cd frontend
npm run dev  # Vite with HMR
# App runs on http://localhost:5173
```

### Docker Development
```bash
docker-compose up -d  # Start backend + PostgreSQL
# Backend: http://localhost:8000
# Database: localhost:5432 (psql credentials in .env.docker)
```

## 🔄 Common Patterns to Follow

### Backend Patterns

**1. Route Handlers - Standard Structure**:
```python
@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,  # Pydantic schema
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Auth dependency
):
    """Create new item with ownership validation."""
    # Business logic
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item
```

**2. Error Handling**:
```python
# Use HTTPException with descriptive detail
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Email already registered"
)
```

**3. Conflict Prevention** (Appointments):
- Check: Does appointment overlap with existing ones?
- Check: Does teacher have availability slot for requested time?
- Store times in UTC, display in user's timezone

### Frontend Patterns

**1. Hook Usage in Components**:
```typescript
export function MyComponent() {
  const { data, isLoading, isError, error } = useMyQuery();
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  
  return <div>{/* render data */}</div>;
}
```

**2. Mutation with Error Handling**:
```typescript
const mutation = useCreateMutation();

const handleCreate = async (data) => {
  try {
    await mutation.mutateAsync(data);
    // Cache auto-invalidated, component re-renders
  } catch (error) {
    if (error instanceof APIError) {
      setError(error.data?.detail || 'Operation failed');
    }
  }
};

<button onClick={() => handleCreate(data)} disabled={mutation.isPending}>
  {mutation.isPending ? 'Creating...' : 'Create'}
</button>
```

**3. Zod Schema Validation**:
- Define schemas in `src/lib/schemas.ts`
- Use for both runtime validation and TypeScript type extraction
- Example: `type User = z.infer<typeof userSchema>`

## 🚨 Critical Implementation Details

### Appointment Booking Logic
- **No double-booking**: Check existing appointments before confirming
- **Slot validation**: Teacher must have AvailableSlot for the time window
- **Status workflow**: 
  - If `teacher.require_approval = true` → appointment status = "pending"
  - Otherwise → appointment status = "confirmed"
- **Times**: Always store in UTC, convert for display

### Role-Based Access
- **Public**: Anyone can view classes, students, teacher availability, book appointments (rate-limited 10/min)
- **Teacher**: Can manage own slots, view own appointments, approve/reject bookings
- **Admin**: Can manage teachers, classes, students; view system-wide statistics

### Database Relationships
- **TeacherClass** (many-to-many): Links teachers to classes they teach
- **AvailableSlot**: Recurring weekly slots (teacher_id, day_of_week, start_time, end_time, is_active)
- **Appointment**: Booking instance with conflict prevention via database constraints

## 📁 Critical Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `backend/main.py` | FastAPI app entry, middleware stack | Adding routers or changing middleware order |
| `backend/app/core/security.py` | JWT/password utilities | JWT expiry, hashing algorithm changes |
| `backend/app/core/dependencies.py` | Auth decorators (get_current_user, etc.) | Adding new role types or auth logic |
| `backend/app/models/*.py` | SQLAlchemy ORM definitions | Changing database schema (then run migrations) |
| `backend/app/routers/*.py` | API endpoints | Adding new endpoints or business logic |
| `frontend/src/hooks/queryKeys.ts` | Cache key factory | Adding new query keys before new hooks |
| `frontend/src/store/auth.ts` | Authentication state | Token/user storage logic |
| `frontend/src/api/client.ts` | HTTP client | Token injection, base URL, headers |

## ⚡ Environment & Configuration

**Backend** (`.env` or `.env.docker`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/school_appointment_db
SECRET_KEY=your-secret-key-here
DEBUG=True/False
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend** (Vite imports from `src/lib/config.ts`):
- API base URL should match backend (http://localhost:8000 for dev)
- Token stored in Zustand with localStorage persistence key `auth-storage`

**Docker** (docker-compose.yml):
- Backend container: Exposes port 8000
- PostgreSQL: Port 5432 (credentials in `.env.docker`)
- Volumes: Database persisted across container restarts

## 🔍 Code Quality Standards

- **Type Safety**: Full TypeScript in frontend, type hints in Python backend
- **Error Messages**: User-friendly detail in HTTPException responses
- **Testing**: (Not yet implemented - future work)
- **Linting**: Frontend uses ESLint (run `npm run lint`), Python uses implicit standards
- **Documentation**: Docstrings on routers and utilities, inline comments for complex logic

## 📚 Repository Structure Quick Reference

```
├── backend/                    # FastAPI server
│   ├── main.py                # Entry point
│   ├── requirements.txt        # Python dependencies
│   ├── app/
│   │   ├── core/              # Security, config, dependencies
│   │   ├── db/                # Database session
│   │   ├── models/            # SQLAlchemy ORM
│   │   ├── routers/           # API endpoints
│   │   └── schemas/           # Pydantic validation
│   └── migrations/            # Alembic schema versions
├── frontend/                   # React + TypeScript
│   ├── package.json           # Dependencies
│   ├── vite.config.ts         # Build config
│   └── src/
│       ├── hooks/             # TanStack Query + Zustand
│       ├── store/             # Auth state
│       ├── api/               # HTTP client
│       ├── types/             # TypeScript + Zod
│       └── components/        # React components
├── docker-compose.yml         # Multi-container orchestration
└── .github/copilot-instructions.md  # This file
```

## ✅ Checklist for New Contributors

- [ ] Read ARCHITECTURE.md and this file completely
- [ ] Understand the request/response cycle (main.py middleware stack)
- [ ] Review an example router (e.g., auth.py) to see patterns
- [ ] Review an example hook (e.g., useAuth.ts) to see frontend patterns
- [ ] Set up .env from .env.example or .env.docker
- [ ] Run migrations: `alembic upgrade head`
- [ ] Start backend: `python main.py`
- [ ] Start frontend: `npm run dev`
- [ ] Verify both servers running and can make API calls

---

**Last Updated**: October 2025  
**Branches**: Main development on `v2`  
**Questions?** Check ARCHITECTURE.md, HOOKS_DOCUMENTATION.md, or API_QUICK_REFERENCE.md in respective folders.
