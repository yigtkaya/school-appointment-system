"""Authentication middleware for FastAPI."""

from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.crud.user import crud_user

security = HTTPBearer()


class AuthMiddleware:
    """Middleware for extracting and validating JWT tokens from headers."""
    
    @staticmethod
    def extract_token_from_header(request: Request) -> Optional[str]:
        """Extract JWT token from Authorization header."""
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return None
        
        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format. Expected: Bearer <token>"
            )
        
        return parts[1]
    
    @staticmethod
    def validate_token(token: str):
        """Validate JWT token and return payload."""
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization token"
            )
        
        payload = decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        return payload
    
    @staticmethod
    def get_user_from_token(token: str):
        """Get user from token."""
        payload = AuthMiddleware.validate_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token structure"
            )
        
        db = SessionLocal()
        try:
            user = crud_user.get(db, user_id)
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is disabled"
                )
            
            return user
        finally:
            db.close()
