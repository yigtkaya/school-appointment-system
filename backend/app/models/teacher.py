"""Teacher model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Teacher(Base):
    """Teacher profile model."""
    
    __tablename__ = "teachers"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    branch = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="teacher")
    available_slots = relationship("AvailableSlot", back_populates="teacher", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="teacher", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Teacher {self.id}>"
