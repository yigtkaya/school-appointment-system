from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List
import time


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse."""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        # Store request history: {client_ip: [(timestamp, endpoint), ...]}
        self.request_history: Dict[str, List[float]] = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get current time
        current_time = time.time()
        
        # Clean old requests (older than 1 minute)
        if client_ip in self.request_history:
            self.request_history[client_ip] = [
                req_time for req_time in self.request_history[client_ip]
                if current_time - req_time < 60
            ]
        
        # Check rate limit for public endpoints
        if request.url.path.startswith("/api/appointments") and request.method == "POST":
            # Stricter limit for public booking endpoint
            public_limit = 10
            if len(self.request_history[client_ip]) >= public_limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many booking requests. Please try again later.",
                )
        else:
            # Standard limit for other endpoints
            if len(self.request_history[client_ip]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
        
        # Record this request
        self.request_history[client_ip].append(current_time)
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.request_history[client_ip])
        )
        
        return response


class ValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for request validation and sanitization."""
    
    async def dispatch(self, request: Request, call_next):
        # Add request timing
        start_time = time.time()
        
        response = await call_next(request)
        
        # Add processing time header
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
