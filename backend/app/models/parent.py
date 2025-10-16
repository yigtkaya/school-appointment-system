"""Parent model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Parent(Base):
    """Parent/Guardian profile model."""
    
    __tablename__ = "parents"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_class = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="parent")
    appointments = relationship("Appointment", back_populates="parent", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Parent {self.id}>"
