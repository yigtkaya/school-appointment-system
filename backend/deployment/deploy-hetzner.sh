#!/bin/bash

# School Appointment System - Hetzner Server Deployment Script
# Server: cx23 (#111147141)
# IP: 65.108.57.17
#
# Usage: ./deploy-hetzner.sh
# Run this script ON the Hetzner server after initial setup

set -e  # Exit on any error

# Configuration
SERVER_IP="65.108.57.17"
PROJECT_NAME="school-appointment-system"
APP_DIR="/opt/$PROJECT_NAME"
GITHUB_REPO="https://github.com/YOUR_USERNAME/$PROJECT_NAME.git"  # UPDATE THIS!

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root (use sudo)"
        exit 1
    fi
}

# Install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."

    apt-get update
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git \
        ufw \
        nginx

    print_success "System dependencies installed"
}

# Install Docker
install_docker() {
    print_status "Installing Docker..."

    if command -v docker &> /dev/null; then
        print_warning "Docker already installed"
        return 0
    fi

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Set up the stable repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start Docker service
    systemctl start docker
    systemctl enable docker

    print_success "Docker installed successfully"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."

    # Allow SSH, HTTP, HTTPS
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp

    # Enable firewall (if not already enabled)
    ufw --force enable

    print_success "Firewall configured"
}

# Clone repository
clone_repository() {
    print_status "Setting up application directory..."

    if [ -d "$APP_DIR" ]; then
        print_warning "Application directory already exists. Updating..."
        cd "$APP_DIR"
        git pull
    else
        print_status "Cloning repository..."
        mkdir -p "$APP_DIR"
        git clone "$GITHUB_REPO" "$APP_DIR"
    fi

    cd "$APP_DIR/backend"
    print_success "Repository ready"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."

    ENV_FILE="$APP_DIR/backend/.env"

    if [ -f "$ENV_FILE" ]; then
        print_warning ".env file already exists. Skipping..."
        return 0
    fi

    # Generate secure passwords
    SECRET_KEY=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 24)
    REDIS_PASSWORD=$(openssl rand -hex 24)
    FLOWER_PASSWORD=$(openssl rand -hex 16)

    print_status "Creating .env file..."
    cat > "$ENV_FILE" << EOF
# ======================
# 🚀 Production Environment
# ======================

# Application Settings
APP_NAME=School Appointment System
ENVIRONMENT=production
DEBUG=false
API_VERSION=v1

# Server Configuration
API_PORT=8000
HOST=0.0.0.0

# Security
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
POSTGRES_USER=schooladmin
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=school_appointments
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://schooladmin:${POSTGRES_PASSWORD}@postgres:5432/school_appointments

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/0

# Flower Configuration (Celery Monitoring)
FLOWER_PORT=5555
FLOWER_USER=admin
FLOWER_PASSWORD=${FLOWER_PASSWORD}

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# CORS Settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://${SERVER_IP}","https://yourdomain.com"]

# Logging
LOG_LEVEL=INFO

# Frontend URL (for email links)
FRONTEND_URL=http://${SERVER_IP}
EOF

    print_success ".env file created"
    print_warning "IMPORTANT: Edit $ENV_FILE and update:"
    echo "  - RESEND_API_KEY"
    echo "  - FROM_EMAIL"
    echo "  - CORS_ORIGINS (add your domain)"
    echo "  - FRONTEND_URL (update with your domain)"
    echo ""
    print_warning "Generated passwords are in the .env file"
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx reverse proxy..."

    NGINX_CONF="/etc/nginx/sites-available/$PROJECT_NAME"

    cat > "$NGINX_CONF" << 'EOF'
# School Appointment System - Nginx Configuration

# Redirect HTTP to HTTPS (uncomment after SSL setup)
# server {
#     listen 80;
#     listen [::]:80;
#     server_name your-domain.com www.your-domain.com;
#     return 301 https://$server_name$request_uri;
# }

server {
    listen 80;
    listen [::]:80;

    # Update this with your domain name
    server_name 65.108.57.17;

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

        # Timeouts
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

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Flower (Celery monitoring) - Optional, can be restricted by IP
    location /flower/ {
        proxy_pass http://localhost:5555/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Optional: Restrict access by IP
        # allow YOUR_IP_ADDRESS;
        # deny all;
    }

    # Frontend (if serving from same server)
    location / {
        # If you're serving frontend from this server, configure here
        # Otherwise, this can proxy to a separate frontend server
        root /var/www/school-appointment-frontend;
        try_files $uri $uri/ /index.html;
    }
}
EOF

    # Enable the site
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Test Nginx configuration
    nginx -t

    # Reload Nginx
    systemctl reload nginx

    print_success "Nginx configured successfully"
}

# Deploy application with Docker
deploy_application() {
    print_status "Deploying application with Docker Compose..."

    cd "$APP_DIR/backend"

    # Build and start services
    docker compose -f deployment/docker-compose.prod.yml down || true
    docker compose -f deployment/docker-compose.prod.yml build --no-cache
    docker compose -f deployment/docker-compose.prod.yml up -d

    print_status "Waiting for services to start..."
    sleep 20

    # Run database migrations
    print_status "Running database migrations..."
    docker compose -f deployment/docker-compose.prod.yml exec -T api alembic upgrade head

    print_success "Application deployed successfully"
}

# Create demo accounts (optional)
create_demo_accounts() {
    print_status "Creating demo accounts..."

    cd "$APP_DIR/backend"

    if [ -f "scripts/simple_demo_accounts.py" ]; then
        docker compose -f deployment/docker-compose.prod.yml exec -T api python scripts/simple_demo_accounts.py
        print_success "Demo accounts created"
    else
        print_warning "Demo account script not found. Skipping..."
    fi
}

# Setup monitoring and maintenance scripts
setup_maintenance() {
    print_status "Setting up maintenance scripts..."

    # Create backup script
    cat > "$APP_DIR/backup.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/school-appointment-system"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

cd /opt/school-appointment-system/backend

# Backup database
docker compose -f deployment/docker-compose.prod.yml exec -T postgres \
    pg_dump -U schooladmin school_appointments | gzip > "$BACKUP_DIR/db_backup_${DATE}.sql.gz"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_${DATE}.sql.gz"
EOF

    chmod +x "$APP_DIR/backup.sh"

    # Setup daily backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh >> /var/log/school-backup.log 2>&1") | crontab -

    print_success "Maintenance scripts configured"
}

# Display deployment info
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "  🎉 Deployment Complete!"
    echo "=========================================="
    echo ""
    print_success "Server: $SERVER_IP"
    echo ""
    print_status "Access Points:"
    echo "  📊 API Documentation: http://$SERVER_IP/docs"
    echo "  🔍 Health Check: http://$SERVER_IP/health"
    echo "  🌸 Flower (Celery): http://$SERVER_IP/flower"
    echo ""
    print_status "Container Status:"
    cd "$APP_DIR/backend"
    docker compose -f deployment/docker-compose.prod.yml ps
    echo ""
    print_warning "Next Steps:"
    echo "  1. Update .env file with your Resend API key"
    echo "  2. Setup SSL certificate (Let's Encrypt)"
    echo "  3. Update CORS_ORIGINS in .env with your domain"
    echo "  4. Configure DNS to point to $SERVER_IP"
    echo "  5. Update Nginx config with your domain name"
    echo ""
    print_status "Useful Commands:"
    echo "  📋 View logs: docker compose -f deployment/docker-compose.prod.yml logs -f"
    echo "  🔄 Restart: docker compose -f deployment/docker-compose.prod.yml restart"
    echo "  🛑 Stop: docker compose -f deployment/docker-compose.prod.yml down"
    echo "  💾 Backup: $APP_DIR/backup.sh"
    echo ""
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  🚀 Hetzner Server Deployment"
    echo "  School Appointment System"
    echo "=========================================="
    echo ""

    check_root
    install_dependencies
    install_docker
    configure_firewall

    print_warning "Please update the GITHUB_REPO variable in this script with your actual repository URL"
    read -p "Have you updated GITHUB_REPO? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        print_error "Please edit this script and update GITHUB_REPO, then run again"
        exit 1
    fi

    clone_repository
    setup_environment

    print_warning "Please edit $APP_DIR/backend/.env and update:"
    echo "  - RESEND_API_KEY"
    echo "  - FROM_EMAIL"
    read -p "Press Enter after editing .env file..."

    configure_nginx
    deploy_application

    read -p "Do you want to create demo accounts? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        create_demo_accounts
    fi

    setup_maintenance
    show_deployment_info
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
