from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional


class AvailableSlotBase(BaseModel):
    """Base available slot schema."""
    day_of_week: int
    start_time: time
    end_time: time
    timezone: str = "UTC"
    is_active: bool = True


class AvailableSlotCreate(AvailableSlotBase):
    """Schema for creating an available slot."""
    teacher_id: int
    date: Optional[datetime] = None


class AvailableSlotUpdate(BaseModel):
    """Schema for updating an available slot."""
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class AvailableSlotResponse(AvailableSlotBase):
    """Schema for available slot response."""
    id: int
    teacher_id: int
    date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
