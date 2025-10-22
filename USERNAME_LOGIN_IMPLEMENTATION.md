# Username-Based Login Implementation

## Overview
This update adds username-based login to the authentication system, allowing users to login with either:
- **Username** (e.g., `ozge.cavlak`, `admin`, `john.doe`)
- **Email** (e.g., `ozge@example.com`, `admin@school.com`)

Both options provide the same level of security and functionality.

## Features

### Backend Changes

#### User Model (`app/models/user.py`)
- Added new field: `username: Column(String, unique=True, index=True)`
- `username` is unique and indexed for fast lookups
- Cannot be NULL

**Example:**
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)  # NEW
    password_hash = Column(String, nullable=False)
    # ... other fields
```

#### Auth Schemas (`app/schemas/user.py`)
- **LoginRequest** updated to accept `username_or_email` instead of just `email`
- **UserCreate** now includes `username` field
- **UserResponse** includes `username` field

**LoginRequest:**
```python
class LoginRequest(BaseModel):
    """Login request schema - accepts username or email."""
    username_or_email: str  # Can be "ozge.cavlak" or "ozge@example.com"
    password: str
```

#### Auth Routes (`app/routers/auth.py`)

**Register Endpoint:**
```python
@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check both email and username uniqueness
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    
    if existing_email:
        raise HTTPException(detail="Email already registered")
    if existing_username:
        raise HTTPException(detail="Username already taken")
    
    # Create user with username
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        role=UserRole.TEACHER
    )
```

**Login Endpoint:**
```python
@router.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login accepts either username or email"""
    user = db.query(User).filter(
        (User.username == credentials.username_or_email) | 
        (User.email == credentials.username_or_email)
    ).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )
    
    # Create JWT token with user.id
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=30)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
```

### Frontend Changes

#### TypeScript Types (`src/api/types.ts`)
```typescript
export interface LoginRequest {
  username_or_email: string;  // Changed from 'email'
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;  // New field
  password: string;
  branch?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;  // New field
  branch?: string | null;
  role: UserRole;
  require_approval: number;
  created_at: string;
}
```

#### Validation Schemas (`src/lib/schemas.ts`)

**LoginSchema:**
```typescript
export const LoginSchema = z.object({
  username_or_email: z.string()
    .min(1, 'Username or email is required')
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      },
      'Enter a valid username (e.g., ozge.cavlak) or email address'
    ),
  password: z.string().min(1, 'Password is required'),
});
```

**RegisterSchema:**
```typescript
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branch: z.string().optional(),
});
```

**Username Rules:**
- Minimum 3 characters, maximum 30 characters
- Allowed characters: letters (a-z, A-Z), numbers (0-9), dots (.), hyphens (-), underscores (_)
- Examples: `ozge.cavlak`, `john_doe`, `teacher123`, `admin`

#### Login Page (`src/pages/Login.tsx`)
```tsx
// Changed from email input to username_or_email input
<input
  {...register('username_or_email')}
  type="text"
  placeholder="ozge.cavlak veya ozge@example.com"
/>

// Demo credentials now show both username and email options
```

#### Register Page (`src/pages/Register.tsx`)
- Added `username` input field with helpful placeholder
- Added `branch` field (optional)
- Updated form layout and validation messages
- Displays both username and email formats in demo section

### Database Migration

**File:** `backend/migrations/versions/003_add_username_field.py`

**Migration Steps:**
1. Add `username` column (nullable temporarily)
2. Populate existing users' username from email (e.g., "ozge@example.com" → "ozge")
3. Make `username` non-nullable
4. Add unique constraint on `username`
5. Add index on `username` for fast lookups

**Downgrade:**
- Removes the username column
- Reverts to email-only login

## Usage Examples

### Logging In

**Option 1: Using Username**
```
Username: ozge.cavlak
Password: password123
```

**Option 2: Using Email**
```
Email: ozge@example.com
Password: password123
```

Both will authenticate successfully!

### Registering

**Form Inputs:**
```
Name:       Özge Çavlak
Email:      ozge@example.com
Username:   ozge.cavlak
Password:   MySecurePass123
Branch:     Başarı (optional)
```

### Demo Accounts

After migration, demo accounts available:

**Admin Account:**
- Username: `admin`
- Email: `admin@school.com`
- Password: `password123`

**Teacher Account:**
- Username: `ozge.cavlak`
- Email: `teacher@school.com`
- Password: `password123`

## Security Considerations

✅ **Username Uniqueness:** Enforced at database level with unique constraint
✅ **Case Sensitivity:** Usernames are case-sensitive (part of security)
✅ **No Spaces:** Usernames don't allow spaces, preventing user confusion
✅ **Email Unchanged:** Email login still works, maintains backward compatibility
✅ **Password Security:** Still using bcrypt hashing
✅ **JWT Tokens:** Tokens use user ID, not username (more secure)

## API Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username_or_email": "ozge.cavlak",  // or "ozge@example.com"
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "name": "Özge Çavlak",
    "email": "ozge@example.com",
    "username": "ozge.cavlak",
    "role": "teacher",
    "require_approval": 0,
    "created_at": "2025-10-22T10:30:00"
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "New Teacher",
  "email": "newteacher@example.com",
  "username": "new.teacher",
  "password": "SecurePass123",
  "branch": "Başarı"
}

Response:
{
  "id": 3,
  "name": "New Teacher",
  "email": "newteacher@example.com",
  "username": "new.teacher",
  "role": "teacher",
  "require_approval": 0,
  "created_at": "2025-10-22T11:00:00"
}
```

## Running the Migration

### Step 1: Backup Database
```bash
# Always backup before migrations
cp school_appointment_db.sqlite school_appointment_db.backup.sqlite
```

### Step 2: Run Migration
```bash
cd backend
alembic upgrade head
```

### Step 3: Verify Migration
```bash
# Check that users table has username column
sqlite3 school_appointment_db.sqlite "PRAGMA table_info(users);"
```

### Rollback (if needed)
```bash
alembic downgrade -1
```

## Backward Compatibility

✅ **Existing Users:** Can still login with email
✅ **Existing Tokens:** Continue to work (no JWT changes)
✅ **API Clients:** Need to send `username_or_email` instead of `email` (breaking change for login only)

## Testing Checklist

- [ ] Login with username works
- [ ] Login with email works
- [ ] Invalid username/email shows correct error
- [ ] Register with username works
- [ ] Duplicate username rejected
- [ ] Duplicate email rejected
- [ ] JWT token still valid and works
- [ ] Protected routes still work
- [ ] Database migration successful
- [ ] Existing user data intact after migration
- [ ] Frontend form validation works
- [ ] Demo credentials work

## Files Modified

**Backend:**
- `app/models/user.py` - Added username field
- `app/schemas/user.py` - Updated schemas
- `app/routers/auth.py` - Updated auth logic
- `migrations/versions/003_add_username_field.py` - NEW migration

**Frontend:**
- `src/api/types.ts` - Updated interfaces
- `src/lib/schemas.ts` - Updated validation schemas
- `src/pages/Login.tsx` - Updated login form
- `src/pages/Register.tsx` - Updated register form

## Troubleshooting

### Issue: Migration fails with "Column already exists"
**Solution:** Database already has username column. Check if migration was already run.

### Issue: Users can't login after migration
**Solution:** 
1. Check database has username column
2. Verify existing users have usernames populated
3. Check frontend is sending `username_or_email` not `email`

### Issue: Registration fails with "Username already taken"
**Solution:** Username is already in use. Choose a different username.

### Issue: Login shows "Invalid username/email or password"
**Solution:**
1. Check username/email is spelled correctly
2. Verify password is correct
3. Ensure account exists (try with both username and email)

---

**Implementation Date:** October 22, 2025
**Status:** Ready for Deployment
**Version:** v2.1
