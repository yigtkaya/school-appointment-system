"""Appointment model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.core.constants import MeetingMode, AppointmentStatus


class Appointment(Base):
    """Appointment booking model."""
    
    __tablename__ = "appointments"
    
    id = Column(String, primary_key=True, index=True)
    parent_id = Column(String, ForeignKey("parents.id"), nullable=False, index=True)
    teacher_id = Column(String, ForeignKey("teachers.id"), nullable=False, index=True)
    slot_id = Column(String, ForeignKey("available_slots.id"), unique=True, nullable=False, index=True)
    meeting_mode = Column(SQLEnum(MeetingMode), nullable=False)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("Parent", back_populates="appointments")
    teacher = relationship("Teacher", back_populates="appointments")
    slot = relationship("AvailableSlot", back_populates="appointment")
    
    def __repr__(self) -> str:
        return f"<Appointment {self.id} - {self.status}>"
