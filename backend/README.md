# Teacher-Parent Meeting Scheduler - Backend

FastAPI backend for the teacher-parent meeting scheduler system.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip or poetry

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📁 Project Structure

```
backend/
├── app/
│   ├── core/              # Core configuration and security
│   │   ├── config.py      # Settings and configuration
│   │   ├── security.py    # JWT and password utilities
│   │   └── dependencies.py # Dependency injection
│   ├── db/
│   │   └── database.py    # Database connection and session
│   ├── models/            # SQLAlchemy models
│   │   ├── user.py
│   │   ├── class_model.py
│   │   ├── student.py
│   │   ├── teacher_class.py
│   │   ├── available_slot.py
│   │   └── appointment.py
│   ├── schemas/           # Pydantic schemas (to be implemented)
│   ├── routers/           # API route handlers (to be implemented)
│   └── __init__.py
├── migrations/            # Alembic migrations
│   ├── versions/
│   └── env.py
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python dependencies
├── alembic.ini          # Alembic configuration
├── .env.example         # Environment variables template
└── README.md
```

## 🗄️ Database

### Models
- **User**: Teachers and admins with roles and authentication
- **Class**: School classes (grade + section)
- **Student**: Students in classes
- **TeacherClass**: Many-to-many relationship between teachers and classes
- **AvailableSlot**: Teacher availability time slots
- **Appointment**: Scheduled meetings between teachers and parents

### Running Migrations

Create a new migration (auto-detect changes):
```bash
alembic revision --autogenerate -m "Description of changes"
```

Upgrade to latest version:
```bash
alembic upgrade head
```

Downgrade to previous version:
```bash
alembic downgrade -1
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:
- Teachers and admins authenticate via `/api/auth/login`
- JWT tokens are included in request headers: `Authorization: Bearer <token>`
- Role-based access control enforced on protected endpoints

## 🐳 Docker

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- FastAPI backend on `http://localhost:8000`
- PostgreSQL database on `localhost:5432`

### Environment Variables (docker-compose)

Create `.env.docker` file:
```
DATABASE_URL=postgresql://user:password@postgres:5432/school_appointment_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
```

## 🧪 Testing

(To be implemented)

## 📝 Notes

- All times are stored in UTC
- CORS is currently configured to allow all origins (update in production)
- Password hashing uses bcrypt
- JWT tokens expire after 30 minutes (configurable)

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
