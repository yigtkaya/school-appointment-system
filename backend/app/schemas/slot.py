"""Available slot schemas for request/response validation."""

from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel, Field, validator

from app.schemas.teacher import TeacherWithUser


class SlotBase(BaseModel):
    """Base slot schema."""
    
    teacher_id: str = Field(..., description="Teacher ID")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    start_time: time = Field(..., description="Start time of the slot")
    end_time: time = Field(..., description="End time of the slot")
    week_start_date: date = Field(..., description="Start date of the week (Monday)")
    
    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        """Validate that end time is after start time."""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v
    
    @validator('week_start_date')
    def week_start_is_monday(cls, v):
        """Validate that week_start_date is a Monday."""
        if v.weekday() != 0:  # Monday is 0
            raise ValueError('Week start date must be a Monday')
        return v


class SlotCreate(SlotBase):
    """Schema for creating a slot."""
    pass


class SlotUpdate(BaseModel):
    """Schema for updating a slot."""
    
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    start_time: Optional[time] = Field(None, description="Start time of the slot")
    end_time: Optional[time] = Field(None, description="End time of the slot")
    week_start_date: Optional[date] = Field(None, description="Start date of the week (Monday)")
    
    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        """Validate that end time is after start time."""
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v
    
    @validator('week_start_date')
    def week_start_is_monday(cls, v):
        """Validate that week_start_date is a Monday."""
        if v and v.weekday() != 0:  # Monday is 0
            raise ValueError('Week start date must be a Monday')
        return v


class SlotResponse(SlotBase):
    """Schema for slot response."""
    
    id: str
    is_booked: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SlotWithTeacher(SlotResponse):
    """Schema for slot response with teacher information."""
    
    teacher: TeacherWithUser
    
    class Config:
        from_attributes = True


class SlotListResponse(BaseModel):
    """Schema for slot list response."""
    
    slots: list[SlotWithTeacher]
    total: int
    skip: int
    limit: int


class BulkSlotCreate(BaseModel):
    """Schema for creating multiple slots."""
    
    teacher_id: str = Field(..., description="Teacher ID")
    week_start_date: date = Field(..., description="Start date of the week (Monday)")
    time_slots: list[dict] = Field(
        ..., 
        description="List of time slots with day_of_week, start_time, end_time",
        example=[
            {"day_of_week": 0, "start_time": "09:00", "end_time": "10:00"},
            {"day_of_week": 1, "start_time": "14:00", "end_time": "15:00"}
        ]
    )
    
    @validator('week_start_date')
    def week_start_is_monday(cls, v):
        """Validate that week_start_date is a Monday."""
        if v.weekday() != 0:  # Monday is 0
            raise ValueError('Week start date must be a Monday')
        return v


class SlotAvailabilityQuery(BaseModel):
    """Schema for querying slot availability."""
    
    teacher_id: Optional[str] = Field(None, description="Filter by teacher ID")
    week_start_date: Optional[date] = Field(None, description="Filter by week start date")
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="Filter by day of week")
    available_only: bool = Field(True, description="Show only available slots")


class WeeklyScheduleResponse(BaseModel):
    """Schema for weekly schedule response."""
    
    teacher_id: str
    week_start_date: date
    slots_by_day: dict[int, list[SlotWithTeacher]] = Field(
        description="Slots grouped by day of week"
    )
    total_slots: int
    available_slots: int
    booked_slots: int