"""Teacher schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class TeacherBase(BaseModel):
    """Base teacher schema."""
    
    branch: Optional[str] = Field(None, max_length=100, description="Teacher's branch/department")
    subject: Optional[str] = Field(None, max_length=100, description="Subject taught by teacher")
    bio: Optional[str] = Field(None, max_length=1000, description="Teacher biography")
    phone: Optional[str] = Field(None, max_length=20, description="Teacher's phone number")


class TeacherCreate(TeacherBase):
    """Schema for creating a teacher."""
    
    user_id: str = Field(..., description="Associated user ID")


class TeacherUpdate(TeacherBase):
    """Schema for updating a teacher."""
    
    pass


class TeacherResponse(TeacherBase):
    """Schema for teacher response."""
    
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TeacherWithUser(TeacherResponse):
    """Schema for teacher response with user information."""
    
    user: UserResponse
    
    class Config:
        from_attributes = True


class TeacherListResponse(BaseModel):
    """Schema for teacher list response."""
    
    teachers: list[TeacherWithUser]
    total: int
    skip: int
    limit: int