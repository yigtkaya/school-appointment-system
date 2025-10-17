"""FastAPI application entry point."""

import logging
from fastapi import FastAPI

from app.core.config import get_settings
from app.api.routes import auth, teachers, parents, slots, appointments, notifications, calendar
from app.db.base import Base
from app.db.session import engine
from app.middleware.cors import setup_cors
from app.middleware.request_logging import RequestLoggingMiddleware
from app.exceptions.handlers import setup_exception_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create tables
logger.info("Creating database tables...")
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
settings = get_settings()

app = FastAPI(
    title="School Appointment Management System",
    description="API for managing weekly parent-teacher appointments",
    version="0.1.0",
    debug=settings.DEBUG
)

# Setup CORS
setup_cors(app)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth.router)
app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["teachers"])
app.include_router(parents.router, prefix="/api/v1/parents", tags=["parents"])
app.include_router(slots.router, prefix="/api/v1/slots", tags=["slots"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(calendar.router, prefix="/api/v1/calendar", tags=["calendar"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "School Appointment Management System API",
        "version": "0.1.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


@app.get("/health")
async def health_check():
    """Basic health check endpoint for Docker and load balancers."""
    return {
        "status": "healthy",
        "service": "school-appointment-api",
        "version": "0.1.0"
    }


@app.get("/health/ready")
async def readiness_check():
    """Readiness check - verifies database and redis connections."""
    from app.db.session import SessionLocal

    checks = {
        "status": "ready",
        "database": "unknown",
        "redis": "unknown"
    }

    # Check database connection
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        checks["database"] = "connected"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        checks["status"] = "not_ready"

    # Check Redis connection (for Celery)
    try:
        from redis import Redis
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        checks["redis"] = "connected"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
        checks["status"] = "not_ready"

    return checks


@app.get("/health/live")
async def liveness_check():
    """Liveness check - simple check if service is running."""
    return {"status": "alive"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT
    )
