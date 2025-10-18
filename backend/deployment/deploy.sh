#!/bin/bash

# School Appointment System - Docker Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Deploying School Appointment System"
echo "📍 Environment: $ENVIRONMENT"
echo "📁 Project Root: $PROJECT_ROOT"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are ready"
}

# Check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    ENV_FILE="$PROJECT_ROOT/.env"
    ENV_EXAMPLE="$SCRIPT_DIR/config/.env.example"
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_EXAMPLE" ]; then
            print_warning ".env file not found. Copying from example..."
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_warning "Please edit $ENV_FILE with your actual configuration"
            print_warning "Especially update these critical settings:"
            echo "  - DATABASE_URL"
            echo "  - SECRET_KEY"
            echo "  - REDIS_PASSWORD"
            echo "  - POSTGRES_PASSWORD"
            echo "  - RESEND_API_KEY"
            echo ""
            read -p "Press Enter to continue after updating .env file..."
        else
            print_error "No .env file found and no example file available"
            exit 1
        fi
    fi
    
    print_success "Environment file exists"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build the main application image
    docker build -f deployment/Dockerfile -t school-appointment-api:latest .
    
    print_success "Docker images built successfully"
}

# Deploy services
deploy_services() {
    print_status "Deploying services with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    COMPOSE_FILE="deployment/docker-compose.${ENVIRONMENT}.yml"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found: $COMPOSE_FILE"
        print_error "Available files:"
        ls -la deployment/docker-compose*.yml
        exit 1
    fi
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down || true
    
    # Start services
    print_status "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "Services deployed successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose -f "deployment/docker-compose.${ENVIRONMENT}.yml" exec -T api alembic upgrade head
    
    print_success "Database migrations completed"
}

# Health checks
check_health() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 15
    
    # Check API health
    API_PORT=$(grep "API_PORT" "$PROJECT_ROOT/.env" | cut -d'=' -f2 || echo "8000")
    API_URL="http://localhost:${API_PORT}"
    
    print_status "Checking API health at $API_URL/health..."
    
    for i in {1..30}; do
        if curl -f "$API_URL/health" &> /dev/null; then
            print_success "API is healthy"
            break
        else
            if [ $i -eq 30 ]; then
                print_error "API health check failed after 30 attempts"
                print_error "Check logs with: docker-compose -f deployment/docker-compose.${ENVIRONMENT}.yml logs"
                exit 1
            fi
            print_status "Waiting for API to be ready... (attempt $i/30)"
            sleep 2
        fi
    done
    
    # Check detailed health
    print_status "Checking detailed health status..."
    curl -s "$API_URL/health/detailed" | python3 -m json.tool || print_warning "Detailed health check failed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    cd "$PROJECT_ROOT"
    docker-compose -f "deployment/docker-compose.${ENVIRONMENT}.yml" ps
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Access points:"
    
    API_PORT=$(grep "API_PORT" "$PROJECT_ROOT/.env" | cut -d'=' -f2 || echo "8000")
    FLOWER_PORT=$(grep "FLOWER_PORT" "$PROJECT_ROOT/.env" | cut -d'=' -f2 || echo "5555")
    
    echo "  📊 API Documentation: http://localhost:${API_PORT}/docs"
    echo "  🔍 API Health: http://localhost:${API_PORT}/health"
    echo "  🌸 Flower (Celery): http://localhost:${FLOWER_PORT}"
    echo ""
    print_status "Useful commands:"
    echo "  📋 View logs: docker-compose -f deployment/docker-compose.${ENVIRONMENT}.yml logs -f"
    echo "  🛑 Stop services: docker-compose -f deployment/docker-compose.${ENVIRONMENT}.yml down"
    echo "  🔄 Restart: ./deployment/deploy.sh ${ENVIRONMENT}"
}

# Main deployment flow
main() {
    echo "=================================="
    echo "  School Appointment System"
    echo "  Docker Deployment Script"
    echo "=================================="
    echo ""
    
    check_docker
    check_environment
    build_images
    deploy_services
    
    if [ "$ENVIRONMENT" = "production" ]; then
        run_migrations
    fi
    
    check_health
    show_status
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"