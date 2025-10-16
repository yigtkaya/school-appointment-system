"""User schemas for request/response validation."""

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.core.constants import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    """User creation schema."""
    password: str


class UserUpdate(BaseModel):
    """User update schema."""
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    """Token data schema."""
    sub: Optional[str] = None
    exp: Optional[int] = None
