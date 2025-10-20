"""Appointment schemas for request/response validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

from app.core.constants import MeetingMode, AppointmentStatus
from app.schemas.teacher import TeacherWithUser
from app.schemas.slot import SlotWithTeacher


class AppointmentBase(BaseModel):
    """Base appointment schema."""

    parent_id: Optional[str] = Field(None, description="Parent ID (optional for anonymous booking)")
    teacher_id: str = Field(..., description="Teacher ID")
    slot_id: str = Field(..., description="Available slot ID")
    meeting_mode: MeetingMode = Field(..., description="Meeting mode (online/face_to_face)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")

    # Child information for anonymous booking
    child_name: str = Field(..., description="Child's name")
    child_year: str = Field(..., description="Child's year (1-8)", pattern="^[1-8]$")
    child_class: str = Field(..., description="Child's class (A-E)", pattern="^[A-E]$")
    parent_contact: Optional[str] = Field(None, description="Parent contact information (optional)")


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


class AppointmentResponse(BaseModel):
    """Schema for appointment response."""

    id: str
    parent_id: Optional[str] = None
    teacher_id: str
    slot_id: str
    meeting_mode: MeetingMode
    status: AppointmentStatus
    notes: Optional[str] = None

    # Child information
    child_name: str
    child_year: str
    child_class: str
    parent_contact: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentWithRelations(AppointmentResponse):
    """Schema for appointment response with related information."""

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
    """Schema for booking an appointment (anonymous, no login required)."""

    slot_id: str = Field(..., description="Available slot ID")
    meeting_mode: MeetingMode = Field(..., description="Meeting mode (online/face_to_face)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")

    # Child information (required for anonymous booking)
    child_name: str = Field(..., min_length=1, max_length=200, description="Child's name")
    child_year: str = Field(..., description="Child's year (1-8)", pattern="^[1-8]$")
    child_class: str = Field(..., description="Child's class (A-E)", pattern="^[A-E]$")
    parent_contact: Optional[str] = Field(None, max_length=200, description="Parent contact (email/phone)")


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


