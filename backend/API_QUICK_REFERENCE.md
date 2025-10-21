# Backend API Quick Reference

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
python main.py
```

### Using Docker
```bash
docker-compose up -d
```

**API Endpoints:** http://localhost:8000  
**Swagger UI:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---

## 📚 All Available Endpoints

### Health Check
```
GET /           - Welcome message
GET /health     - Health check
```

### Authentication
```
POST   /api/auth/register     - Register new teacher
POST   /api/auth/login        - Get JWT token
GET    /api/auth/me           - Get current user (requires auth)
```

### Classes
```
GET    /api/classes           - List all classes
POST   /api/classes           - Create class (admin only)
GET    /api/classes/{id}      - Get class details
GET    /api/classes/{id}/students    - List students in class
GET    /api/classes/{id}/teachers    - List teachers in class
```

### Students
```
POST   /api/students          - Create student (admin only)
GET    /api/students/{id}     - Get student details
```

### Teacher-Class Relations
```
POST   /api/teacher-classes   - Assign teacher to class (admin only)
```

### Teacher Slots
```
GET    /api/teachers/{id}/slots              - List teacher's slots
POST   /api/teachers/{id}/slots              - Create slot (teacher)
PUT    /api/teachers/{id}/slots/{slot_id}    - Update slot (teacher)
DELETE /api/teachers/{id}/slots/{slot_id}    - Delete slot (teacher)
GET    /api/teachers/{id}/available-days     - Get available days
GET    /api/teachers/{id}/available-times    - Get available times for date
```

### Appointments (Public)
```
POST   /api/appointments      - Create appointment (public, no auth)
PATCH  /api/appointments/{id} - Update status (teacher only)
DELETE /api/appointments/{id} - Cancel appointment (teacher only)
```

### Teacher View
```
GET    /api/appointments/teachers/{id}/appointments  - List my appointments (teacher)
```

### Admin Dashboard
```
GET    /api/admin/teachers                   - List all teachers
POST   /api/admin/teachers                   - Create teacher
GET    /api/admin/teachers/{id}              - Get teacher details
PUT    /api/admin/teachers/{id}              - Update teacher
DELETE /api/admin/teachers/{id}              - Delete teacher
POST   /api/admin/teachers/{id}/approve      - Approve teacher
POST   /api/admin/teachers/{id}/require-approval  - Set approval required

POST   /api/admin/classes                    - Create class
PUT    /api/admin/classes/{id}               - Update class
DELETE /api/admin/classes/{id}               - Delete class

POST   /api/admin/students                   - Create student
PUT    /api/admin/students/{id}              - Update student
DELETE /api/admin/students/{id}              - Delete student

GET    /api/admin/appointments               - List all appointments (filterable)
GET    /api/admin/appointments/stats         - Get statistics
GET    /api/admin/appointments/{id}          - Get appointment details
```

---

## 🔐 Authentication

### Get Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.edu",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Use Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/auth/me
```

---

## 📋 Request/Response Examples

### Register Teacher
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@school.edu",
    "password": "secure123",
    "branch": "Mathematics"
  }'
```

### Create Class
```bash
curl -X POST http://localhost:8000/api/admin/classes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 10,
    "section": "A"
  }'
```

### Create Student
```bash
curl -X POST http://localhost:8000/api/admin/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "class_id": 1
  }'
```

### Create Available Slot
```bash
curl -X POST http://localhost:8000/api/teachers/1/slots \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": 1,
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "timezone": "UTC",
    "is_active": true
  }'
```

### Book Appointment (Public)
```bash
curl -X POST http://localhost:8000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": 1,
    "class_id": 1,
    "student_id": 1,
    "appointment_start": "2024-10-25T10:00:00",
    "appointment_end": "2024-10-25T10:30:00",
    "parent_name": "Parent Name",
    "parent_email": "parent@email.com",
    "parent_phone": "+1234567890",
    "note": "Optional meeting note"
  }'
```

### Confirm Appointment (Teacher)
```bash
curl -X PATCH http://localhost:8000/api/appointments/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### Get Admin Statistics
```bash
curl -X GET http://localhost:8000/api/admin/appointments/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🛡️ Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (double-booking)
- `429` - Too Many Requests (rate limited)
- `500` - Server Error

---

## 📊 Database Info

**Tables:**
- `users` - Teachers and admins
- `classes` - School classes
- `students` - Students in classes
- `teacher_classes` - Teacher-class relationships
- `available_slots` - Teacher availability
- `appointments` - Scheduled meetings

---

## 🔄 Workflow Examples

### Complete Booking Flow (Parent)

1. **View available classes**
   ```
   GET /api/classes
   ```

2. **View students in class**
   ```
   GET /api/classes/1/students
   ```

3. **View teachers in class**
   ```
   GET /api/classes/1/teachers
   ```

4. **Get teacher's available days**
   ```
   GET /api/teachers/1/available-days
   ```

5. **Get available times for a date**
   ```
   GET /api/teachers/1/available-times?date=2024-10-25T10:00:00Z
   ```

6. **Book appointment**
   ```
   POST /api/appointments
   ```

---

### Teacher Setup Flow (Admin)

1. **Create teacher**
   ```
   POST /api/admin/teachers
   ```

2. **Assign to class**
   ```
   POST /api/teacher-classes
   ```

3. **Add available slots**
   ```
   POST /api/teachers/{id}/slots
   ```

4. **Set appointment approval requirement**
   ```
   POST /api/admin/teachers/{id}/require-approval
   ```

---

## 💡 Tips

- Token expires after 30 minutes
- Use `?date=YYYY-MM-DDTHH:MM:SSZ` format for datetime queries
- Rate limits: 60 req/min (general), 10 req/min (booking)
- All times stored and returned in UTC
- Check Swagger UI for full schema: http://localhost:8000/docs

---

## 🐛 Troubleshooting

**"Invalid authentication credentials"**
- Token may have expired, get a new one
- Check token format: `Authorization: Bearer TOKEN`

**"Rate limit exceeded"**
- Wait a minute before making more requests
- Check `X-RateLimit-Remaining` header

**"Conflicting appointment"**
- Teacher already has appointment at that time
- Choose a different time slot

**"No available slots"**
- Teacher has no open slots for that date
- Add new slots first

---

## 📚 Documentation

- Full Security docs: `SECURITY_AND_ADMIN.md`
- Setup info: `SETUP_COMPLETE.md`
- README: `README.md`

---

## 🚀 Next Steps

- [ ] Deploy backend to production
- [ ] Build frontend
- [ ] Set up email notifications
- [ ] Add analytics dashboard
- [ ] Implement audit logging
