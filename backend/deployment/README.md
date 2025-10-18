# 🐳 Docker Deployment Guide

Simple Docker-based deployment for the School Appointment Management System.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Port 8000, 5432, 6379, and 5555 available

### 1. Clone and Configure
```bash
git clone <your-repo>
cd school-appointment-system/backend
```

### 2. Set Up Environment
```bash
# Copy environment template
cp deployment/config/.env.example .env

# Edit configuration (REQUIRED)
nano .env
```

**⚠️ Critical Settings to Update:**
- `SECRET_KEY` - Generate a secure secret key
- `POSTGRES_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Redis password
- `RESEND_API_KEY` - Your email service API key

### 3. Deploy with Script
```bash
# Development deployment
./deployment/deploy.sh development

# Production deployment
./deployment/deploy.sh production
```

## 📋 Manual Deployment

### Development
```bash
# Start services
docker-compose -f deployment/docker-compose.dev.yml up -d

# View logs
docker-compose -f deployment/docker-compose.dev.yml logs -f
```

### Production
```bash
# Build and start all services
docker-compose -f deployment/docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f deployment/docker-compose.prod.yml exec api alembic upgrade head

# Check service status
docker-compose -f deployment/docker-compose.prod.yml ps
```

## 🔍 Service Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **API** | http://localhost:8000 | Main application API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/health | Basic health status |
| **Detailed Health** | http://localhost:8000/health/detailed | Comprehensive health info |
| **Flower** | http://localhost:5555 | Celery task monitoring |

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose -f deployment/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f deployment/docker-compose.prod.yml logs -f api
docker-compose -f deployment/docker-compose.prod.yml logs -f celery-worker
```

### Stop Services
```bash
docker-compose -f deployment/docker-compose.prod.yml down
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f deployment/docker-compose.prod.yml down
docker-compose -f deployment/docker-compose.prod.yml build --no-cache
docker-compose -f deployment/docker-compose.prod.yml up -d
```

### Database Operations
```bash
# Run migrations
docker-compose -f deployment/docker-compose.prod.yml exec api alembic upgrade head

# Create new migration
docker-compose -f deployment/docker-compose.prod.yml exec api alembic revision --autogenerate -m "Description"

# Access PostgreSQL
docker-compose -f deployment/docker-compose.prod.yml exec postgres psql -U schooladmin -d school_appointments
```

### Backup & Restore
```bash
# Backup database
docker-compose -f deployment/docker-compose.prod.yml exec postgres pg_dump -U schooladmin school_appointments > backup.sql

# Restore database
docker-compose -f deployment/docker-compose.prod.yml exec -T postgres psql -U schooladmin school_appointments < backup.sql
```

## 🔧 Troubleshooting

### Check Service Health
```bash
# API health
curl http://localhost:8000/health

# Detailed health with all dependencies
curl http://localhost:8000/health/detailed | python3 -m json.tool
```

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :8000

# Kill the process
kill -9 <PID>
```

**2. Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose -f deployment/docker-compose.prod.yml logs postgres

# Verify database is running
docker-compose -f deployment/docker-compose.prod.yml exec postgres pg_isready -U schooladmin
```

**3. Redis Connection Issues**
```bash
# Check Redis logs
docker-compose -f deployment/docker-compose.prod.yml logs redis

# Test Redis connection
docker-compose -f deployment/docker-compose.prod.yml exec redis redis-cli ping
```

**4. Celery Worker Issues**
```bash
# Check worker logs
docker-compose -f deployment/docker-compose.prod.yml logs celery-worker

# Monitor tasks in Flower
open http://localhost:5555
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Service-specific stats
docker-compose -f deployment/docker-compose.prod.yml top
```

## 🔒 Security Considerations

1. **Change Default Passwords**: Update all passwords in `.env`
2. **Secure Secret Key**: Generate a strong `SECRET_KEY`
3. **Network Security**: Use firewall rules to restrict access
4. **Regular Updates**: Keep Docker images updated
5. **Backup Strategy**: Implement regular database backups

## 📊 Production Checklist

- [ ] Environment variables configured
- [ ] Strong passwords set
- [ ] SSL/TLS certificates configured (if using HTTPS)
- [ ] Backup strategy implemented
- [ ] Monitoring setup (logs, health checks)
- [ ] Resource limits appropriate for your server
- [ ] Firewall rules configured
- [ ] Regular update schedule planned

## 🔗 Related Files

- `deployment/Dockerfile` - Application container definition
- `deployment/docker-compose.prod.yml` - Production services
- `deployment/docker-compose.dev.yml` - Development services
- `deployment/config/.env.example` - Environment template
- `deployment/deploy.sh` - Automated deployment script