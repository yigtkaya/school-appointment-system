"""Notification schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.notification import NotificationType, NotificationStatus


class NotificationBase(BaseModel):
    """Base notification schema."""
    recipient_email: str = Field(..., description="Recipient email address")
    recipient_name: str = Field(..., description="Recipient name")
    notification_type: NotificationType = Field(..., description="Type of notification")
    subject: str = Field(..., description="Email subject")
    content: Optional[str] = Field(None, description="Email content")
    appointment_id: Optional[str] = Field(None, description="Related appointment ID")


class NotificationCreate(NotificationBase):
    """Schema for creating notifications."""
    pass


class NotificationUpdate(BaseModel):
    """Schema for updating notifications."""
    status: Optional[NotificationStatus] = None
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None


class NotificationResponse(NotificationBase):
    """Schema for notification responses."""
    id: str = Field(..., description="Notification ID")
    status: NotificationStatus = Field(..., description="Notification status")
    sent_at: Optional[datetime] = Field(None, description="When notification was sent")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class SendNotificationRequest(BaseModel):
    """Schema for manual notification sending."""
    appointment_id: str = Field(..., description="Appointment ID to send notification for")
    notification_type: NotificationType = Field(..., description="Type of notification to send")


class NotificationSummary(BaseModel):
    """Schema for notification summary."""
    total_sent: int = Field(..., description="Total notifications sent")
    total_failed: int = Field(..., description="Total notifications failed")
    total_pending: int = Field(..., description="Total notifications pending")
    recent_notifications: list[NotificationResponse] = Field(..., description="Recent notifications")