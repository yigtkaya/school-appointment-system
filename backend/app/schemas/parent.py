"""Parent schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class ParentBase(BaseModel):
    """Base parent schema."""
    
    student_name: str = Field(..., max_length=100, description="Student's full name")
    student_class: Optional[str] = Field(None, max_length=50, description="Student's class/grade")
    phone: Optional[str] = Field(None, max_length=20, description="Parent's phone number")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes about the student")


class ParentCreate(ParentBase):
    """Schema for creating a parent."""
    
    user_id: str = Field(..., description="Associated user ID")


class ParentUpdate(BaseModel):
    """Schema for updating a parent."""
    
    student_name: Optional[str] = Field(None, max_length=100, description="Student's full name")
    student_class: Optional[str] = Field(None, max_length=50, description="Student's class/grade")
    phone: Optional[str] = Field(None, max_length=20, description="Parent's phone number")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes about the student")


class ParentResponse(ParentBase):
    """Schema for parent response."""
    
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ParentWithUser(ParentResponse):
    """Schema for parent response with user information."""
    
    user: UserResponse
    
    class Config:
        from_attributes = True


class ParentListResponse(BaseModel):
    """Schema for parent list response."""
    
    parents: list[ParentWithUser]
    total: int
    skip: int
    limit: int