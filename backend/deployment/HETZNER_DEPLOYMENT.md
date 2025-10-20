# Hetzner Server Deployment Guide

Complete guide for deploying the School Appointment System to your Hetzner CX23 server.

## Server Information

- **Server Type**: CX23
- **Server ID**: #111147141
- **IPv4**: `65.108.57.17`
- **IPv6**: `2a01:4f9:c013:e10e::/64`
- **Hostname**: `ubuntu-4gb-hel1-1`
- **OS**: Ubuntu (latest)

## Prerequisites

- SSH access to your Hetzner server
- Root or sudo privileges
- Domain name (optional, but recommended)
- Resend API key for email notifications

## Deployment Options

### Option 1: Automated Deployment (Recommended)

Use the automated deployment script that handles everything for you.

#### Step 1: Initial Server Setup

Connect to your server:
```bash
ssh root@65.108.57.17
```

Update the system:
```bash
apt update && apt upgrade -y
```

#### Step 2: Download and Run Deployment Script

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/yigtkaya/school-appointment-system/main/backend/deployment/deploy-hetzner.sh

# Or if you prefer to upload it via git
git clone https://github.com/YOUR_USERNAME/school-appointment-system.git /opt/school-appointment-system
cd /opt/school-appointment-system/backend/deployment

# Make it executable
chmod +x deploy-hetzner.sh

# Edit the script to update GITHUB_REPO variable
nano deploy-hetzner.sh
# Update line 15: GITHUB_REPO="https://github.com/YOUR_USERNAME/school-appointment-system.git"

# Run the deployment
./deploy-hetzner.sh
```

The script will:
- Install Docker and dependencies
- Configure firewall (UFW)
- Clone your repository
- Generate secure passwords
- Create environment configuration
- Setup Nginx reverse proxy
- Deploy the application with Docker Compose
- Run database migrations
- Setup automated backups

#### Step 3: Post-Deployment Configuration

Edit the `.env` file:
```bash
nano /opt/school-appointment-system/backend/.env
```

Update these required fields:
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Your sender email address
- `CORS_ORIGINS` - Add your domain
- `FRONTEND_URL` - Your frontend URL

Restart the application:
```bash
cd /opt/school-appointment-system/backend
docker compose -f deployment/docker-compose.prod.yml restart
```

---

### Option 2: Manual Deployment

If you prefer manual control over each step.

#### Step 1: Server Setup

```bash
# Connect to server
ssh root@65.108.57.17

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    nginx
```

#### Step 2: Install Docker

```bash
# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker compose version
```

#### Step 3: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

#### Step 4: Clone Repository

```bash
# Create application directory
mkdir -p /opt/school-appointment-system
cd /opt/school-appointment-system

# Clone your repository
git clone https://github.com/YOUR_USERNAME/school-appointment-system.git .
```

#### Step 5: Configure Environment

```bash
cd /opt/school-appointment-system/backend

# Create .env file
nano .env
```

Paste and configure:
```env
# Application Settings
APP_NAME=School Appointment System
ENVIRONMENT=production
DEBUG=false
API_VERSION=v1

# Server Configuration
API_PORT=8000
HOST=0.0.0.0

# Security - Generate secure keys
SECRET_KEY=your_secret_key_here_use_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
POSTGRES_USER=schooladmin
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=school_appointments
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://schooladmin:your_secure_password_here@postgres:5432/school_appointments

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://:your_redis_password_here@redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://:your_redis_password_here@redis:6379/0
CELERY_RESULT_BACKEND=redis://:your_redis_password_here@redis:6379/0

# Flower Configuration
FLOWER_PORT=5555
FLOWER_USER=admin
FLOWER_PASSWORD=your_flower_password_here

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# CORS Settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://65.108.57.17","https://yourdomain.com"]

# Logging
LOG_LEVEL=INFO

# Frontend URL
FRONTEND_URL=http://65.108.57.17
```

Generate secure passwords:
```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate passwords
openssl rand -hex 24
```

#### Step 6: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/school-appointment-system
```

See the Nginx configuration section below for the complete config.

```bash
# Enable the site
ln -s /etc/nginx/sites-available/school-appointment-system /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### Step 7: Deploy Application

```bash
cd /opt/school-appointment-system/backend

# Build and start containers
docker compose -f deployment/docker-compose.prod.yml build --no-cache
docker compose -f deployment/docker-compose.prod.yml up -d

# Wait for services to start (20-30 seconds)
sleep 20

# Run database migrations
docker compose -f deployment/docker-compose.prod.yml exec api alembic upgrade head

# Create demo accounts (optional)
docker compose -f deployment/docker-compose.prod.yml exec api python scripts/simple_demo_accounts.py

# Check status
docker compose -f deployment/docker-compose.prod.yml ps
```

#### Step 8: Verify Deployment

```bash
# Check health
curl http://localhost:8000/health

# Check detailed health
curl http://localhost:8000/health/detailed

# Check logs
docker compose -f deployment/docker-compose.prod.yml logs -f
```

---

## Nginx Configuration

Complete Nginx configuration for reverse proxy:

```nginx
# /etc/nginx/sites-available/school-appointment-system

server {
    listen 80;
    listen [::]:80;

    server_name 65.108.57.17;  # Update with your domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API endpoint
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Flower (Celery monitoring)
    location /flower/ {
        proxy_pass http://localhost:5555/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Optional: Restrict by IP
        # allow YOUR_IP;
        # deny all;
    }

    # Frontend (if serving from same server)
    location / {
        root /var/www/school-appointment-frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## SSL Certificate Setup (Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
# Certificates auto-renew via systemd timer

# Test auto-renewal
certbot renew --dry-run
```

After SSL setup, update your `.env`:
```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

Restart application:
```bash
cd /opt/school-appointment-system/backend
docker compose -f deployment/docker-compose.prod.yml restart
```

---

## Access Points

After deployment, access your application at:

- **API Documentation**: http://65.108.57.17/docs
- **Health Check**: http://65.108.57.17/health
- **Detailed Health**: http://65.108.57.17/health/detailed
- **Flower (Celery)**: http://65.108.57.17/flower
- **Frontend**: http://65.108.57.17/ (if deployed)

---

## Management Commands

### View Logs

```bash
cd /opt/school-appointment-system/backend

# All services
docker compose -f deployment/docker-compose.prod.yml logs -f

# Specific service
docker compose -f deployment/docker-compose.prod.yml logs -f api
docker compose -f deployment/docker-compose.prod.yml logs -f celery-worker
docker compose -f deployment/docker-compose.prod.yml logs -f postgres
```

### Restart Services

```bash
cd /opt/school-appointment-system/backend

# All services
docker compose -f deployment/docker-compose.prod.yml restart

# Specific service
docker compose -f deployment/docker-compose.prod.yml restart api
```

### Stop Services

```bash
docker compose -f deployment/docker-compose.prod.yml down
```

### Update Application

```bash
cd /opt/school-appointment-system

# Pull latest code
git pull

# Rebuild and restart
cd backend
docker compose -f deployment/docker-compose.prod.yml down
docker compose -f deployment/docker-compose.prod.yml build --no-cache
docker compose -f deployment/docker-compose.prod.yml up -d

# Run migrations
docker compose -f deployment/docker-compose.prod.yml exec api alembic upgrade head
```

### Database Operations

```bash
cd /opt/school-appointment-system/backend

# Run migrations
docker compose -f deployment/docker-compose.prod.yml exec api alembic upgrade head

# Create migration
docker compose -f deployment/docker-compose.prod.yml exec api alembic revision --autogenerate -m "Description"

# Access PostgreSQL
docker compose -f deployment/docker-compose.prod.yml exec postgres psql -U schooladmin -d school_appointments

# Backup database
docker compose -f deployment/docker-compose.prod.yml exec postgres pg_dump -U schooladmin school_appointments | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip < backup_20250120.sql.gz | docker compose -f deployment/docker-compose.prod.yml exec -T postgres psql -U schooladmin school_appointments
```

### Monitor Resources

```bash
# Container stats
docker stats

# Container processes
docker compose -f deployment/docker-compose.prod.yml top

# Disk usage
docker system df

# Prune unused resources
docker system prune -a
```

---

## Automated Backups

The deployment script creates an automated backup system.

### Manual Backup

```bash
/opt/school-appointment-system/backup.sh
```

Backups are stored in `/opt/backups/school-appointment-system/` and automatically cleaned up after 7 days.

### Backup Schedule

Backups run daily at 2 AM via cron. Check cron:
```bash
crontab -l
```

View backup logs:
```bash
tail -f /var/log/school-backup.log
```

---

## Monitoring and Debugging

### Health Checks

```bash
# Basic health
curl http://localhost:8000/health

# Detailed health with all dependencies
curl http://localhost:8000/health/detailed | python3 -m json.tool
```

### Check Service Status

```bash
cd /opt/school-appointment-system/backend
docker compose -f deployment/docker-compose.prod.yml ps
```

### Database Connection Test

```bash
docker compose -f deployment/docker-compose.prod.yml exec postgres pg_isready -U schooladmin
```

### Redis Connection Test

```bash
docker compose -f deployment/docker-compose.prod.yml exec redis redis-cli -a your_redis_password ping
```

### Celery Tasks Monitoring

Access Flower at http://65.108.57.17/flower

Default credentials:
- Username: admin
- Password: (check FLOWER_PASSWORD in .env)

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Check all Docker ports
netstat -tulpn | grep docker
```

### Database Issues

```bash
# Check PostgreSQL logs
docker compose -f deployment/docker-compose.prod.yml logs postgres

# Access database
docker compose -f deployment/docker-compose.prod.yml exec postgres psql -U schooladmin -d school_appointments

# List databases
\l

# List tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;
```

### Redis Issues

```bash
# Check Redis logs
docker compose -f deployment/docker-compose.prod.yml logs redis

# Test connection
docker compose -f deployment/docker-compose.prod.yml exec redis redis-cli -a your_redis_password ping

# Check memory usage
docker compose -f deployment/docker-compose.prod.yml exec redis redis-cli -a your_redis_password info memory
```

### Celery Worker Issues

```bash
# Check worker logs
docker compose -f deployment/docker-compose.prod.yml logs celery-worker

# Check beat scheduler logs
docker compose -f deployment/docker-compose.prod.yml logs celery-beat

# Restart workers
docker compose -f deployment/docker-compose.prod.yml restart celery-worker celery-beat
```

### Email Not Sending

1. Check Resend API key in `.env`
2. Check Celery worker logs
3. Check Flower for failed tasks
4. Verify FROM_EMAIL is authorized in Resend

### CORS Issues

Update CORS_ORIGINS in `.env`:
```env
CORS_ORIGINS=["http://65.108.57.17","https://yourdomain.com","http://localhost:3000"]
```

Restart API:
```bash
docker compose -f deployment/docker-compose.prod.yml restart api
```

---

## Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure firewall (UFW)
- [ ] Restrict Flower access by IP or disable in production
- [ ] Setup fail2ban for SSH protection
- [ ] Enable automatic security updates
- [ ] Regular backups configured
- [ ] Monitor logs regularly
- [ ] Keep Docker images updated
- [ ] Use strong passwords for database and Redis

### Additional Security Measures

```bash
# Install fail2ban for SSH protection
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Enable automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Performance Optimization

### Resource Limits

Edit `docker-compose.prod.yml` to add resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Tuning

For CX23 server (4GB RAM), optimize PostgreSQL:

```bash
docker compose -f deployment/docker-compose.prod.yml exec postgres psql -U schooladmin

ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '3GB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

# Restart PostgreSQL
docker compose -f deployment/docker-compose.prod.yml restart postgres
```

---

## Frontend Deployment (Optional)

If deploying the frontend on the same server:

```bash
# Build frontend
cd /opt/school-appointment-system/frontend
npm install
npm run build

# Copy to Nginx directory
mkdir -p /var/www/school-appointment-frontend
cp -r dist/* /var/www/school-appointment-frontend/

# Update frontend environment
# Create .env.production with:
VITE_API_URL=http://65.108.57.17/api

# Rebuild
npm run build
cp -r dist/* /var/www/school-appointment-frontend/
```

---

## Maintenance Tasks

### Weekly

- Review logs for errors
- Check disk space
- Verify backups are running
- Monitor Celery tasks in Flower

### Monthly

- Update Docker images
- Review and update dependencies
- Check for security updates
- Review and clean old logs

### Commands

```bash
# Check disk space
df -h

# Check Docker disk usage
docker system df

# Clean up old containers/images
docker system prune -a

# Update containers
cd /opt/school-appointment-system/backend
docker compose -f deployment/docker-compose.prod.yml pull
docker compose -f deployment/docker-compose.prod.yml up -d
```

---

## Support and Documentation

- **Project Repository**: https://github.com/YOUR_USERNAME/school-appointment-system
- **Docker Documentation**: https://docs.docker.com/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Nginx Documentation**: https://nginx.org/en/docs/

---

## Quick Reference

### Essential Files

- **Environment**: `/opt/school-appointment-system/backend/.env`
- **Nginx Config**: `/etc/nginx/sites-available/school-appointment-system`
- **Backup Script**: `/opt/school-appointment-system/backup.sh`
- **Backups**: `/opt/backups/school-appointment-system/`

### Essential Commands

```bash
# SSH to server
ssh root@65.108.57.17

# Navigate to project
cd /opt/school-appointment-system/backend

# View logs
docker compose -f deployment/docker-compose.prod.yml logs -f

# Restart all
docker compose -f deployment/docker-compose.prod.yml restart

# Update app
git pull && docker compose -f deployment/docker-compose.prod.yml up -d --build

# Backup database
/opt/school-appointment-system/backup.sh

# Health check
curl http://localhost:8000/health/detailed
```

---

## Demo Accounts

If you created demo accounts during deployment:

- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Parent**: parent@school.com / parent123

**Important**: Change these passwords in production!

---

## Changelog

Keep track of deployments and updates:

```bash
# Tag deployment
git tag -a v1.0.0-production -m "Initial production deployment"
git push origin v1.0.0-production

# View deployment history
git tag -l
```
