# Security & Admin API Documentation

## 🔐 Security Features

### 1. Authentication
- **JWT (JSON Web Tokens)** for stateless authentication
- **Bearer token** in Authorization header: `Authorization: Bearer <token>`
- Tokens expire after 30 minutes (configurable)
- Password hashing with bcrypt

### 2. Authorization & Role-Based Access Control (RBAC)
Two roles implemented:
- **Admin**: Full system access, user management
- **Teacher**: Can manage own slots, view own appointments

### 3. CORS (Cross-Origin Resource Sharing)
- Whitelist of allowed origins (default: localhost:3000, localhost:5173)
- Credentials allowed for authenticated requests
- Configurable per environment

### 4. Rate Limiting
- **General endpoints**: 60 requests per minute per IP
- **Public booking endpoint**: 10 requests per minute per IP (stricter)
- Returns 429 (Too Many Requests) when exceeded
- Rate limit info in response headers

### 5. Additional Middleware
- **Trusted Host**: Prevents Host header attacks
- **GZIP Compression**: Reduces response size
- **Request Validation**: Adds processing time tracking

### 6. Appointment Conflict Prevention
- Exclusion checks prevent double-booking
- Validates teacher availability before booking

---

## 👨‍💼 Admin Management API

### Base URL
```
/api/admin
```

### Authentication
All endpoints require admin role JWT token.

---

## Teacher Management

### List All Teachers
```http
GET /api/admin/teachers
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu",
    "branch": "Mathematics",
    "role": "teacher",
    "require_approval": false,
    "created_at": "2024-01-01T10:00:00"
  }
]
```

---

### Create Teacher
```http
POST /api/admin/teachers
```

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@school.edu",
  "password": "secure_password",
  "branch": "Science"
}
```

**Response:** Created teacher object (201)

---

### Get Teacher Details
```http
GET /api/admin/teachers/{teacher_id}
```

**Response:** Teacher object or 404

---

### Update Teacher
```http
PUT /api/admin/teachers/{teacher_id}
```

**Request:**
```json
{
  "name": "Jane Smith Updated",
  "branch": "Physics",
  "password": "new_password"  // Optional
}
```

---

### Delete Teacher
```http
DELETE /api/admin/teachers/{teacher_id}
```

**Response:** 204 No Content
*Cascades delete: removes teacher from classes and appointments*

---

### Approve Teacher for Appointments
```http
POST /api/admin/teachers/{teacher_id}/approve
```

Sets `require_approval` to `false` - appointments auto-confirmed.

---

### Set Teacher Approval Requirement
```http
POST /api/admin/teachers/{teacher_id}/require-approval
```

Sets `require_approval` to `true` - new appointments are pending.

---

## Class Management

### Create Class
```http
POST /api/admin/classes
```

**Request:**
```json
{
  "grade": 10,
  "section": "A"
}
```

---

### Update Class
```http
PUT /api/admin/classes/{class_id}
```

**Request:**
```json
{
  "grade": 10,
  "section": "B"
}
```

---

### Delete Class
```http
DELETE /api/admin/classes/{class_id}
```

*Cascades delete: removes all students and appointments*

---

## Student Management

### Create Student
```http
POST /api/admin/students
```

**Request:**
```json
{
  "name": "Alice Johnson",
  "class_id": 1
}
```

---

### Update Student
```http
PUT /api/admin/students/{student_id}
```

**Request:**
```json
{
  "name": "Alice Johnson Updated",
  "class_id": 2
}
```

---

### Delete Student
```http
DELETE /api/admin/students/{student_id}
```

*Cascades delete: removes all appointments*

---

## Appointment Oversight

### List All Appointments (with filtering)
```http
GET /api/admin/appointments
```

**Query Parameters:**
- `status`: Filter by status (pending, confirmed, cancelled, rejected)
- `teacher_id`: Filter by teacher
- `class_id`: Filter by class

**Example:**
```http
GET /api/admin/appointments?status=pending&teacher_id=1
```

---

### Get Appointment Statistics
```http
GET /api/admin/appointments/stats
```

**Response:**
```json
{
  "total_appointments": 45,
  "pending_appointments": 5,
  "confirmed_appointments": 35,
  "cancelled_appointments": 3,
  "rejected_appointments": 2,
  "total_teachers": 8,
  "total_classes": 12,
  "total_students": 150
}
```

---

### Get Appointment Details
```http
GET /api/admin/appointments/{appointment_id}
```

**Response:** Appointment object with all details

---

## Configuration

### Environment Variables

```bash
# CORS Settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=["*"]
CORS_ALLOW_HEADERS=["*"]

# Security
ALLOWED_HOSTS=["*"]
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# JWT
SECRET_KEY=your-very-long-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Production Recommendations

1. **CORS Origins**: Specify exact domains only
   ```python
   CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]
   ```

2. **Allowed Hosts**: Whitelist specific hosts
   ```python
   ALLOWED_HOSTS=["api.yourdomain.com", "yourdomain.com"]
   ```

3. **Rate Limiting**: Adjust based on usage
   ```python
   RATE_LIMIT_REQUESTS_PER_MINUTE=120  # Higher for production
   ```

4. **Secret Key**: Generate strong key
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Debug Mode**: Disable in production
   ```bash
   DEBUG=False
   ```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Teacher not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

---

## Rate Limit Headers

All responses include:
- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests for current window
- `X-Process-Time`: Server processing time

---

## Testing Admin Endpoints

### 1. Register Admin
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@school.edu",
    "password": "admin_password",
    "branch": "Administration"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.edu",
    "password": "admin_password"
  }'
```

*Note: You need to manually set the role in database to "admin" after registration.*

### 3. Use Token
```bash
curl -X GET http://localhost:8000/api/admin/teachers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Access

### Manual Admin User Creation (SQL)
```sql
INSERT INTO users (name, email, password_hash, branch, role, require_approval, created_at)
VALUES ('Admin', 'admin@school.edu', '$2b$12$...hashed_password...', 'Admin', 'admin', 0, NOW());
```

To hash a password:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("your_password")
print(hashed)
```

---

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Rotate SECRET_KEY regularly
3. ✅ Monitor rate limit violations
4. ✅ Log all admin actions
5. ✅ Use strong passwords
6. ✅ Update dependencies regularly
7. ✅ Validate all inputs server-side
8. ✅ Use environment variables for secrets
9. ✅ Implement audit logging for sensitive operations
10. ✅ Enable HTTPS/SSL/TLS

---

## Next Steps

- Implement email notifications for appointments
- Add audit logging for admin actions
- Set up monitoring and alerting
- Implement 2FA for admin accounts
- Add API key support for third-party integrations
