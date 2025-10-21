from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from app.core.config import settings
from app.core.middleware import RateLimitMiddleware, ValidationMiddleware
from app.db.database import engine, Base
from app.routers import auth, classes, slots, appointments, admin

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Teacher-Parent Meeting Scheduler API",
    version="1.0.0",
)

# Security Middleware - Order matters!
# 1. Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# 2. GZIP Compression
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# 4. Rate Limiting Middleware
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
    )

# 5. Validation Middleware
app.add_middleware(ValidationMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(slots.router)
app.include_router(appointments.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Teacher-Parent Meeting Scheduler API"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Teacher-Parent Meeting Scheduler API"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
