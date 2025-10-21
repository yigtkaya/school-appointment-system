from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.core.dependencies import UserRole


class UserBase(BaseModel):
    """Base user schema."""
    name: str
    email: EmailStr
    branch: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = None
    branch: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    role: UserRole
    require_approval: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
