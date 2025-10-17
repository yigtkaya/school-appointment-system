# School Appointment System - Makefile

.PHONY: help install dev prod stop logs clean

help: ## Show available commands
	@echo "School Appointment System - Backend"
	@echo "===================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Installation
install: ## Install Python dependencies
	pip install -r requirements.txt

# Development
dev: ## Start development environment (DB + Redis only)
	docker-compose -f deployment/docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ PostgreSQL and Redis started!"
	@echo "Run: make run-api, make run-worker, make run-beat"

run-api: ## Run FastAPI server
	uvicorn app.main:app --reload --port 8001

run-worker: ## Run Celery worker
	celery -A app.core.celery_app worker --loglevel=info

run-beat: ## Run Celery beat
	celery -A app.core.celery_app beat --loglevel=info

run-flower: ## Run Flower monitoring
	celery -A app.core.celery_app flower --port=5555

# Production
prod: ## Deploy production environment
	docker-compose -f deployment/docker-compose.prod.yml up -d --build
	@echo ""
	@echo "✅ Production deployed!"
	@echo "API: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"
	@echo "Logs: make logs"

stop: ## Stop all containers
	docker-compose -f deployment/docker-compose.prod.yml down
	docker-compose -f deployment/docker-compose.dev.yml down

logs: ## View Docker logs
	docker-compose -f deployment/docker-compose.prod.yml logs -f

# Database
migrate: ## Run database migrations
	alembic upgrade head

migrate-create: ## Create new migration (use: make migrate-create MSG="message")
	alembic revision --autogenerate -m "$(MSG)"

migrate-rollback: ## Rollback last migration
	alembic downgrade -1

init-db: ## Initialize database with admin user
	python scripts/init-db.py

# Testing
test: ## Run tests
	pytest tests/ -v --cov=app --cov-report=term-missing

# Utilities
clean: ## Clean cache files
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf .pytest_cache htmlcov dist build

shell: ## Open Python shell
	python -i -c "from app.db.session import SessionLocal; from app.models import *; db = SessionLocal()"

db-shell: ## PostgreSQL shell
	docker-compose -f deployment/docker-compose.dev.yml exec postgres psql -U schooladmin -d school_appointments

redis-cli: ## Redis CLI
	docker-compose -f deployment/docker-compose.dev.yml exec redis redis-cli
