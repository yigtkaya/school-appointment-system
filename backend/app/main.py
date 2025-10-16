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
    """Health check endpoint."""
    return {"status": "ok", "version": "0.1.0"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT
    )
