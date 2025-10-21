from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class AppointmentBase(BaseModel):
    """Base appointment schema."""
    teacher_id: int
    class_id: int
    student_id: int
    parent_name: str
    parent_email: EmailStr
    parent_phone: Optional[str] = None
    note: Optional[str] = None


class AppointmentCreate(BaseModel):
    """Schema for creating an appointment (parent booking)."""
    class_id: int
    student_id: int
    teacher_id: int
    appointment_start: datetime
    appointment_end: datetime
    parent_name: str
    parent_email: EmailStr
    parent_phone: Optional[str] = None
    note: Optional[str] = None


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment status."""
    status: Optional[str] = None  # pending, confirmed, cancelled, rejected


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response."""
    id: int
    appointment_start: datetime
    appointment_end: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
