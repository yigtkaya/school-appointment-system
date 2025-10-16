"""Dependency injection helpers for middleware and route handlers."""

from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth import AuthMiddleware
from app.models.user import User
from app.core.constants import UserRole


def get_token_from_headers(authorization: Optional[str] = Header(None)) -> str:
    """Extract token from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    return authorization


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        token = AuthMiddleware.extract_token_from_header(
            type('Request', (), {'headers': {'Authorization': authorization}})()
        )
        user = AuthMiddleware.get_user_from_token(token)
        return user
    except HTTPException:
        raise


def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify current user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def get_teacher_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify current user is a teacher."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required"
        )
    return current_user


def get_parent_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify current user is a parent."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent access required"
        )
    return current_user


def get_teacher_or_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify current user is a teacher or admin."""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher or admin access required"
        )
    return current_user
