from pydantic import BaseModel
from datetime import date as date_type, time as time_type, datetime
from typing import Optional


class AvailableSlotBase(BaseModel):
    """Base available slot schema."""
    date: date_type
    start_time: time_type
    end_time: time_type
    timezone: str = "UTC"
    is_active: bool = True


class AvailableSlotCreate(AvailableSlotBase):
    """Schema for creating an available slot."""
    teacher_id: int


class AvailableSlotUpdate(BaseModel):
    """Schema for updating an available slot."""
    date: Optional[date_type] = None
    start_time: Optional[time_type] = None
    end_time: Optional[time_type] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class AvailableSlotResponse(AvailableSlotBase):
    """Schema for available slot response."""
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
