"""Appointment model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.core.constants import MeetingMode, AppointmentStatus


class Appointment(Base):
    """Appointment booking model."""

    __tablename__ = "appointments"

    id = Column(String, primary_key=True, index=True)
    parent_id = Column(String, nullable=True, index=True)  # For backward compatibility, no foreign key constraint
    teacher_id = Column(String, ForeignKey("teachers.id"), nullable=False, index=True)
    slot_id = Column(String, ForeignKey("available_slots.id"), unique=True, nullable=False, index=True)
    meeting_mode = Column(SQLEnum(MeetingMode), nullable=False)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    reminder_sent = Column(Boolean, default=False, nullable=False)

    # Child information for anonymous booking
    child_name = Column(String, nullable=False, index=True)
    child_year = Column(String, nullable=False, index=True)  # 1-8
    child_class = Column(String, nullable=False, index=True)  # A-E
    parent_contact = Column(String, nullable=True)  # Optional contact information

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="appointments")
    slot = relationship("AvailableSlot", back_populates="appointment")
    
    def __repr__(self) -> str:
        return f"<Appointment {self.id} - {self.status}>"
