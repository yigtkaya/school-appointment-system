"""Available slot model."""

from datetime import datetime, time
from sqlalchemy import Column, String, DateTime, ForeignKey, Time, Boolean, Integer

from app.db.base import Base
from sqlalchemy.orm import relationship


class AvailableSlot(Base):
    """Teacher available time slot model."""
    
    __tablename__ = "available_slots"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("teachers.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False, index=True)
    week_start_date = Column(DateTime, nullable=False, index=True)  # Start date of the week
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="available_slots")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)
    
    def __repr__(self) -> str:
        return f"<AvailableSlot {self.id} - {self.day_of_week} {self.start_time}>"
