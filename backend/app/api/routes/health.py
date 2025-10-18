"""Enhanced health check endpoints for monitoring and deployment."""

import asyncio
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/")
async def basic_health_check():
    """Basic health check endpoint for load balancers."""
    return {
        "status": "healthy",
        "service": "school-appointment-api",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe - checks if the service is running."""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe - comprehensive dependency checks.
    Returns 503 if any critical dependency is unavailable.
    """
    checks = {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": {"status": "unknown", "response_time": None},
            "redis": {"status": "unknown", "response_time": None},
            "celery": {"status": "unknown", "response_time": None}
        }
    }
    
    overall_healthy = True
    
    # Database connectivity check
    try:
        start_time = datetime.now(datetime.timezone.utc)
        db.execute(text("SELECT 1"))
        response_time = (datetime.now(datetime.timezone.utc) - start_time).total_seconds() * 1000

        checks["checks"]["database"] = {    
            "status": "healthy",
            "response_time": f"{response_time:.2f}ms"
        }
    except Exception as e:
        checks["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e),
            "response_time": None
        }
        overall_healthy = False
    
    # Redis connectivity check
    try:
        from redis import Redis
        start_time = datetime.utcnow()
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        checks["checks"]["redis"] = {
            "status": "healthy",
            "response_time": f"{response_time:.2f}ms"
        }
    except Exception as e:
        checks["checks"]["redis"] = {
            "status": "unhealthy",
            "error": str(e),
            "response_time": None
        }
        overall_healthy = False
    
    # Celery worker check (optional - won't fail readiness)
    try:
        from app.core.celery_app import celery_app
        start_time = datetime.utcnow()
        
        # Check if any workers are active
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        if stats:
            active_workers = len(stats)
            checks["checks"]["celery"] = {
                "status": "healthy",
                "response_time": f"{response_time:.2f}ms",
                "active_workers": active_workers
            }
        else:
            checks["checks"]["celery"] = {
                "status": "degraded",
                "message": "No active workers found",
                "response_time": f"{response_time:.2f}ms",
                "active_workers": 0
            }
            # Don't mark overall as unhealthy for celery issues
            
    except Exception as e:
        checks["checks"]["celery"] = {
            "status": "degraded",
            "error": str(e),
            "response_time": None
        }
        # Don't mark overall as unhealthy for celery issues
    
    # Set overall status
    if overall_healthy:
        checks["status"] = "ready"
        return checks
    else:
        checks["status"] = "not_ready"
        raise HTTPException(status_code=503, detail=checks)


@router.get("/startup")
async def startup_check(db: Session = Depends(get_db)):
    """
    Kubernetes startup probe - checks if application is ready to receive traffic.
    More lenient than readiness check during startup.
    """
    checks = {
        "status": "starting",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Check critical dependencies only
    try:
        # Database must be available
        db.execute(text("SELECT 1"))
        checks["checks"]["database"] = "healthy"
        checks["status"] = "ready"
        return checks
    except Exception as e:
        checks["checks"]["database"] = f"unhealthy: {str(e)}"
        checks["status"] = "not_ready"
        raise HTTPException(status_code=503, detail=checks)


@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health information for monitoring dashboards.
    Includes metrics and additional system information.
    """
    from app.models.user import User
    from app.models.appointment import Appointment
    
    health_info = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": {
            "name": "school-appointment-api",
            "version": "0.1.0",
            "environment": "production" if not settings.DEBUG else "development",
            "debug_mode": settings.DEBUG
        },
        "dependencies": {},
        "metrics": {},
        "system": {}
    }
    
    try:
        # Database metrics
        start_time = datetime.utcnow()
        total_users = db.query(User).count()
        total_appointments = db.query(Appointment).count()
        db_response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        health_info["dependencies"]["database"] = {
            "status": "healthy",
            "response_time": f"{db_response_time:.2f}ms",
            "url": settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else "hidden"
        }
        
        health_info["metrics"] = {
            "total_users": total_users,
            "total_appointments": total_appointments,
            "database_response_time": f"{db_response_time:.2f}ms"
        }
        
    except Exception as e:
        health_info["dependencies"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_info["status"] = "degraded"
    
    try:
        # Redis info
        from redis import Redis
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_info = redis_client.info()
        
        health_info["dependencies"]["redis"] = {
            "status": "healthy",
            "version": redis_info.get("redis_version", "unknown"),
            "used_memory": redis_info.get("used_memory_human", "unknown"),
            "connected_clients": redis_info.get("connected_clients", 0)
        }
        
    except Exception as e:
        health_info["dependencies"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    try:
        # Celery worker info
        from app.core.celery_app import celery_app
        inspect = celery_app.control.inspect()
        
        stats = inspect.stats()
        active = inspect.active()
        
        health_info["dependencies"]["celery"] = {
            "status": "healthy" if stats else "degraded",
            "active_workers": len(stats) if stats else 0,
            "active_tasks": sum(len(tasks) for tasks in active.values()) if active else 0
        }
        
    except Exception as e:
        health_info["dependencies"]["celery"] = {
            "status": "degraded",
            "error": str(e)
        }
    
    # System information
    health_info["system"] = {
        "python_version": f"{__import__('sys').version_info.major}.{__import__('sys').version_info.minor}.{__import__('sys').version_info.micro}",
        "process_id": __import__('os').getpid(),
        "uptime": "unknown"  # Could be enhanced with process start time tracking
    }
    
    return health_info