"""Notification model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class NotificationType(str, enum.Enum):
    """Notification types."""
    APPOINTMENT_CONFIRMATION = "appointment_confirmation"
    APPOINTMENT_CANCELLATION = "appointment_cancellation"
    APPOINTMENT_REMINDER = "appointment_reminder"
    TEACHER_NOTIFICATION = "teacher_notification"


class NotificationStatus(str, enum.Enum):
    """Notification status."""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class Notification(Base):
    """Notification log model."""
    
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, index=True)
    recipient_email = Column(String, nullable=False, index=True)
    recipient_name = Column(String, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    appointment_id = Column(String, nullable=True, index=True)
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<Notification {self.id} - {self.notification_type}>"