from sqlalchemy import Column, Integer, String, DateTime, Time, ForeignKey, Boolean, Date
from datetime import datetime, time
from app.db.database import Base
from sqlalchemy.orm import relationship

class AvailableSlot(Base):
    """Available time slots for teachers."""
    
    __tablename__ = "available_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)  # Specific date for the slot
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    teacher = relationship("User", backref="available_slots")
    
    def __repr__(self):
        return f"<AvailableSlot(id={self.id}, teacher_id={self.teacher_id}, date={self.date})>"
