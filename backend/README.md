# 🏫 School Appointment Management System - Backend

FastAPI-based REST API for managing weekly parent-teacher appointments.

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip (Python package manager)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/school_appointments_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### 3. Initialize Database

The database tables are created automatically when the app starts.

```bash
python -m app.main
```

## 📚 API Structure

### Authentication Endpoints (`/api/v1/auth`)

- **POST** `/register` - Register new user
- **POST** `/login` - Login and get JWT token
- **GET** `/me` - Get current user profile (requires auth)

### Test Endpoints (`/api/v1/test`)

These endpoints demonstrate role-based access control:

- **GET** `/protected` - Requires authentication
- **GET** `/admin-only` - Requires admin role
- **GET** `/teacher-only` - Requires teacher role
- **GET** `/parent-only` - Requires parent role
- **GET** `/teacher-or-admin` - Requires teacher or admin role

## 🔐 Authentication

### Token Format

The API uses **JWT (JSON Web Tokens)** for authentication.

### How to Authenticate

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123",
       "full_name": "John Doe",
       "role": "admin"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123"
     }'
   ```

3. **Use the token:**
   ```bash
   curl -X GET http://localhost:8000/api/v1/auth/me \
     -H "Authorization: Bearer <your_token_here>"
   ```

## 🛠️ Middleware

### Authentication Middleware (`app/middleware/auth.py`)

Handles JWT token extraction and validation from Authorization headers.

### Role-Based Access Control (`app/middleware/dependencies.py`)

Provides FastAPI dependencies for role verification:

- `get_current_user()` - Returns authenticated user
- `get_admin_user()` - Returns user if admin
- `get_teacher_user()` - Returns user if teacher
- `get_parent_user()` - Returns user if parent
- `get_teacher_or_admin()` - Returns user if teacher or admin

### CORS Middleware (`app/middleware/cors.py`)

Configures CORS for frontend communication.

### Request Logging (`app/middleware/request_logging.py`)

Logs all HTTP requests and responses.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   └── test.py          # Test endpoints
│   │   └── v1/
│   ├── core/
│   │   ├── config.py            # Configuration management
│   │   ├── constants.py         # App constants
│   │   └── security.py          # JWT & password utilities
│   ├── crud/
│   │   ├── base.py              # Generic CRUD operations
│   │   └── user.py              # User CRUD operations
│   ├── db/
│   │   ├── base.py              # SQLAlchemy base
│   │   └── session.py           # Database session
│   ├── exceptions/
│   │   ├── handlers.py          # Exception handlers
│   │   └── http.py              # Custom HTTP exceptions
│   ├── middleware/
│   │   ├── auth.py              # Auth middleware
│   │   ├── cors.py              # CORS setup
│   │   ├── dependencies.py      # FastAPI dependencies
│   │   └── request_logging.py   # Request logging
│   ├── models/
│   │   ├── appointment.py       # Appointment model
│   │   ├── parent.py            # Parent model
│   │   ├── slot.py              # Available slot model
│   │   ├── teacher.py           # Teacher model
│   │   └── user.py              # User model
│   ├── schemas/
│   │   └── user.py              # User schemas
│   ├── tasks/
│   │   └── __init__.py          # Celery tasks (future)
│   └── main.py                  # Application entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── requirements.txt             # Python dependencies
```

## 🧪 Testing the API

### 1. Start the server:
```bash
python -m app.main
```

The API will be available at `http://localhost:8000`

### 2. Access API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### 3. Example workflow:

```bash
# Register as admin
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'

# Login
RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Access admin-only endpoint
curl -X GET http://localhost:8000/api/v1/test/admin-only \
  -H "Authorization: Bearer $TOKEN"
```

## 🔑 User Roles

- **admin** - Full system access, manages teachers and slots
- **teacher** - Can view appointments and manage availability
- **parent** - Can book appointments

## 🛠️ Development Commands

### Run development server:
```bash
python -m app.main
```

### Run with auto-reload:
```bash
uvicorn app.main:app --reload
```

### Run on specific host/port:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/db` |
| `SECRET_KEY` | JWT signing key | `your-secret-key` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `DEBUG` | Debug mode | `True` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `RESEND_API_KEY` | Email API key | `key_xxx` |
| `SENDER_EMAIL` | Sender email | `noreply@example.com` |
| `TWILIO_ACCOUNT_SID` | Twilio account | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio token | `token_xxx` |
| `TWILIO_WHATSAPP_NUMBER` | WhatsApp number | `whatsapp:+1234567890` |

## 🚀 Deployment

### Docker

```bash
docker build -t school-api .
docker run -p 8000:8000 --env-file .env school-api
```

### Render / Fly.io

Push to GitHub and connect your repository for automatic deployment.

## 📚 Next Steps

1. **Create Teachers routes** - Manage teacher profiles and availability
2. **Create Parents routes** - Manage parent profiles
3. **Create Slots routes** - Manage available time slots
4. **Create Appointments routes** - Handle appointment bookings
5. **Setup Notifications** - Email and WhatsApp integration
6. **Add tests** - Unit and integration tests

## 📞 Support

For issues or questions, create an issue in the GitHub repository.

## 📄 License

This project is private. All rights reserved.
