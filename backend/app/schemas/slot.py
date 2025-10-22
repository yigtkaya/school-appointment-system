from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional


class AvailableSlotBase(BaseModel):
    """Base available slot schema."""
    date: date
    start_time: time
    end_time: time
    timezone: str = "UTC"
    is_active: bool = True


class AvailableSlotCreate(AvailableSlotBase):
    """Schema for creating an available slot."""
    teacher_id: int


class AvailableSlotUpdate(BaseModel):
    """Schema for updating an available slot."""
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class AvailableSlotResponse(AvailableSlotBase):
    """Schema for available slot response."""
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
