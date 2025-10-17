# 🏫 School Appointment System - Backend API

A production-ready FastAPI backend for managing weekly parent-teacher appointments with automated notifications and scheduling.

---

## ✨ Features

- **RESTful API** - FastAPI with automatic OpenAPI docs
- **JWT Authentication** - Role-based access control (Admin, Teacher, Parent)
- **Database** - PostgreSQL with SQLAlchemy ORM
- **Background Jobs** - Celery + Redis for async tasks
- **Email Notifications** - Automated appointment confirmations and reminders
- **Calendar Integration** - iCal export and schedule views
- **Docker Support** - Production-ready containerization
- **Database Migrations** - Alembic for schema management

---

## 🚀 Quick Start

### Development

```bash
# 1. Setup
cp .env.example .env
make install

# 2. Start dependencies
make dev

# 3. Run migrations
make migrate
make init-db  # Creates admin user

# 4. Start services (in separate terminals)
make run-api      # API on :8001
make run-worker   # Celery worker
make run-beat     # Celery scheduler
```

Access:
- **API**: http://localhost:8001
- **Docs**: http://localhost:8001/docs
- **Flower**: http://localhost:5555 (run: `make run-flower`)

### Production

```bash
# Deploy full stack with Docker
cp .env.production .env
# Configure .env with production values
make prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📁 Project Structure

```
backend/
├── app/                  # Application code
│   ├── api/             # API routes
│   ├── core/            # Config, security, celery
│   ├── crud/            # Database operations
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── tasks/           # Celery background tasks
├── deployment/          # Docker compose & Dockerfile
├── scripts/             # Utility scripts
├── alembic/             # Database migrations
└── docs/                # Documentation
```

---

## 🔧 Available Commands

```bash
make help          # Show all commands

# Development
make dev           # Start PostgreSQL + Redis
make run-api       # Start FastAPI server
make run-worker    # Start Celery worker
make run-beat      # Start Celery beat scheduler

# Production
make prod          # Deploy with Docker
make stop          # Stop all services
make logs          # View logs

# Database
make migrate       # Run migrations
make migrate-create MSG="description"  # Create migration
make init-db       # Initialize with admin user

# Testing
make test          # Run tests
```

---

## 🔐 Default Credentials

After running `make init-db`:

```
Email: admin@school.com
Password: admin123
```

⚠️ **Change password immediately in production!**

---

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login

### Teachers
- `GET /api/v1/teachers` - List teachers
- `POST /api/v1/teachers` - Create teacher (admin)
- `GET /api/v1/teachers/{id}` - Get teacher details

### Parents
- `GET /api/v1/parents` - List parents
- `POST /api/v1/parents` - Create parent (admin)
- `GET /api/v1/parents/me` - Get own profile

### Time Slots
- `GET /api/v1/slots` - List available slots
- `POST /api/v1/slots` - Create slot (teacher/admin)
- `POST /api/v1/slots/bulk` - Bulk create slots

### Appointments
- `POST /api/v1/appointments/book` - Book appointment (parent)
- `GET /api/v1/appointments` - List appointments
- `PUT /api/v1/appointments/{id}/status` - Update status
- `DELETE /api/v1/appointments/{id}` - Cancel appointment

### Calendar
- `GET /api/v1/calendar/daily/{date}` - Daily schedule
- `GET /api/v1/calendar/monthly/{year}/{month}` - Monthly view
- `GET /api/v1/calendar/export/ical` - Export to iCal

### Notifications
- `GET /api/v1/notifications` - List notifications (admin)
- `POST /api/v1/notifications/send` - Send notification (admin)

Full API documentation: http://localhost:8001/docs

---

## 🔄 Background Tasks

Automated tasks run via Celery Beat:

| Task | Schedule | Description |
|------|----------|-------------|
| **Appointment Reminders** | Hourly | 24h advance notifications |
| **Weekly Slot Reset** | Sunday 00:00 | Clean old unbooked slots |
| **Status Updates** | Daily 01:00 | Mark completed appointments |
| **Cleanup** | Daily 02:00 | Remove old notifications (30d) |

---

## 🧪 Testing

```bash
# Run tests
make test

# With coverage
pytest --cov=app --cov-report=html
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[docs/CELERY_SETUP.md](docs/CELERY_SETUP.md)** - Celery configuration
- **[docs/QUICKSTART_CELERY.md](docs/QUICKSTART_CELERY.md)** - Quick Celery guide
- **[API Docs](http://localhost:8001/docs)** - Auto-generated OpenAPI docs

---

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Production database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **Celery** - Background task queue
- **Redis** - Message broker & cache
- **Alembic** - Database migrations
- **Docker** - Containerization
- **Resend** - Email delivery

---

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- SQL injection protection via SQLAlchemy
- Input validation via Pydantic
- Environment variable configuration

---

## 📈 Production Ready

✅ Multi-stage Docker builds
✅ Health check endpoints
✅ Database connection pooling
✅ Graceful shutdown handling
✅ Structured logging
✅ Error handling middleware
✅ Database migrations
✅ Background job processing
✅ Monitoring with Flower

---

## 🆘 Troubleshooting

### Database connection failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
make db-shell
```

### Celery tasks not executing
```bash
# Check Redis
docker exec -it school-redis-dev redis-cli ping

# Check worker logs
docker logs school-celery-worker
```

### Port already in use
```bash
# Change port in .env
PORT=8001

# Or kill process using port
lsof -ti:8000 | xargs kill -9
```

---

## 📝 Environment Variables

Key variables (see `.env.example` for full list):

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-here

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
RESEND_API_KEY=your_api_key
SENDER_EMAIL=noreply@school.com
```

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `make test`
4. Create pull request

---

## 📄 License

Private - All rights reserved.

---

## 🎉 You're Ready!

Start building amazing appointment scheduling experiences! 🚀

For questions or issues, check the [documentation](DEPLOYMENT.md) or API docs at `/docs`.
