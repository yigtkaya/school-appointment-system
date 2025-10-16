"""Appointment schemas for request/response validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

from app.core.constants import MeetingMode, AppointmentStatus
from app.schemas.parent import ParentWithUser
from app.schemas.teacher import TeacherWithUser
from app.schemas.slot import SlotWithTeacher


class AppointmentBase(BaseModel):
    """Base appointment schema."""
    
    parent_id: str = Field(..., description="Parent ID")
    teacher_id: str = Field(..., description="Teacher ID")
    slot_id: str = Field(..., description="Available slot ID")
    meeting_mode: MeetingMode = Field(..., description="Meeting mode (online/face_to_face)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment."""
    pass


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment."""
    
    meeting_mode: Optional[MeetingMode] = Field(None, description="Meeting mode (online/face_to_face)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class AppointmentStatusUpdate(BaseModel):
    """Schema for updating appointment status."""
    
    status: AppointmentStatus = Field(..., description="New appointment status")


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response."""
    
    id: str
    status: AppointmentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AppointmentWithRelations(AppointmentResponse):
    """Schema for appointment response with related information."""
    
    parent: ParentWithUser
    teacher: TeacherWithUser
    slot: SlotWithTeacher
    
    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    """Schema for appointment list response."""
    
    appointments: list[AppointmentWithRelations]
    total: int
    skip: int
    limit: int


class AppointmentBookingRequest(BaseModel):
    """Schema for booking an appointment."""
    
    slot_id: str = Field(..., description="Available slot ID")
    meeting_mode: MeetingMode = Field(..., description="Meeting mode (online/face_to_face)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class AppointmentSummary(BaseModel):
    """Schema for appointment summary."""
    
    total_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    no_show_appointments: int


class TeacherScheduleResponse(BaseModel):
    """Schema for teacher schedule response."""
    
    teacher_id: str
    date_range: dict[str, date] = Field(description="Start and end dates")
    appointments: list[AppointmentWithRelations]
    summary: AppointmentSummary


class ParentAppointmentsResponse(BaseModel):
    """Schema for parent appointments response."""
    
    parent_id: str
    appointments: list[AppointmentWithRelations]
    summary: AppointmentSummary