from sqlalchemy import Column, Integer, String, DateTime, Time, ForeignKey, Boolean
from datetime import datetime, time
from app.db.database import Base
from sqlalchemy.orm import relationship

class AvailableSlot(Base):
    """Available time slots for teachers."""
    
    __tablename__ = "available_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    date = Column(DateTime, nullable=True)  # Optional specific date
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    teacher = relationship("User", backref="available_slots")
    
    def __repr__(self):
        return f"<AvailableSlot(id={self.id}, teacher_id={self.teacher_id}, day={self.day_of_week})>"
