"""Notification integration service for appointment lifecycle events."""

import asyncio
import logging
from datetime import datetime, time
from typing import Optional
from sqlalchemy.orm import Session

from app.services.notification import notification_service
from app.crud.notification import notification
from app.models.notification import NotificationType
from app.schemas.notification import NotificationCreate
from app.models.appointment import Appointment
from app.models.user import User

logger = logging.getLogger(__name__)


class NotificationIntegrationService:
    """Service to integrate notifications with appointment lifecycle."""
    
    def __init__(self):
        self.notification_service = notification_service
    
    def _format_time_display(self, slot_time: time) -> str:
        """Format time for display in notifications."""
        return slot_time.strftime("%I:%M %p")
    
    def _format_date_display(self, slot_date: datetime) -> str:
        """Format date for display in notifications."""
        return slot_date.strftime("%A, %B %d, %Y")
    
    async def send_appointment_confirmation(
        self, 
        db: Session,
        appointment: Appointment
    ) -> bool:
        """Send appointment confirmation to parent and teacher."""
        try:
            # Get appointment details
            parent_user = appointment.parent.user
            teacher_user = appointment.teacher.user
            
            appointment_date = self._format_date_display(appointment.slot.week_start_date)
            appointment_time = self._format_time_display(appointment.slot.start_time)
            
            # Send confirmation to parent
            parent_success = await self.notification_service.send_appointment_confirmation(
                parent_email=parent_user.email,
                parent_name=parent_user.full_name,
                teacher_name=teacher_user.full_name,
                teacher_subject=appointment.teacher.subject or "General",
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                student_name=appointment.parent.student_name
            )
            
            # Log parent notification
            parent_notification = NotificationCreate(
                recipient_email=parent_user.email,
                recipient_name=parent_user.full_name,
                notification_type=NotificationType.APPOINTMENT_CONFIRMATION,
                subject=f"Appointment Confirmed - {teacher_user.full_name}",
                content=f"Appointment on {appointment_date} at {appointment_time}",
                appointment_id=appointment.id
            )
            parent_notif_record = notification.create(db, parent_notification)
            
            if parent_success:
                notification.mark_as_sent(db, parent_notif_record.id)
            else:
                notification.mark_as_failed(db, parent_notif_record.id, "Failed to send email")
            
            # Send notification to teacher
            teacher_success = await self.notification_service.send_teacher_notification(
                teacher_email=teacher_user.email,
                teacher_name=teacher_user.full_name,
                parent_name=parent_user.full_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                student_name=appointment.parent.student_name
            )
            
            # Log teacher notification
            teacher_notification = NotificationCreate(
                recipient_email=teacher_user.email,
                recipient_name=teacher_user.full_name,
                notification_type=NotificationType.TEACHER_NOTIFICATION,
                subject=f"New Appointment Booked - {appointment_date}",
                content=f"New appointment with {parent_user.full_name}",
                appointment_id=appointment.id
            )
            teacher_notif_record = notification.create(db, teacher_notification)
            
            if teacher_success:
                notification.mark_as_sent(db, teacher_notif_record.id)
            else:
                notification.mark_as_failed(db, teacher_notif_record.id, "Failed to send email")
            
            return parent_success and teacher_success
            
        except Exception as e:
            logger.error(f"Failed to send appointment confirmation: {str(e)}")
            return False
    
    async def send_appointment_cancellation(
        self, 
        db: Session,
        appointment: Appointment
    ) -> bool:
        """Send appointment cancellation to parent and teacher."""
        try:
            # Get appointment details
            parent_user = appointment.parent.user
            teacher_user = appointment.teacher.user
            
            appointment_date = self._format_date_display(appointment.slot.week_start_date)
            appointment_time = self._format_time_display(appointment.slot.start_time)
            
            # Send cancellation to parent
            parent_success = await self.notification_service.send_appointment_cancellation(
                parent_email=parent_user.email,
                parent_name=parent_user.full_name,
                teacher_name=teacher_user.full_name,
                teacher_subject=appointment.teacher.subject or "General",
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                student_name=appointment.parent.student_name
            )
            
            # Log parent notification
            parent_notification = NotificationCreate(
                recipient_email=parent_user.email,
                recipient_name=parent_user.full_name,
                notification_type=NotificationType.APPOINTMENT_CANCELLATION,
                subject=f"Appointment Cancelled - {teacher_user.full_name}",
                content=f"Cancelled appointment on {appointment_date} at {appointment_time}",
                appointment_id=appointment.id
            )
            parent_notif_record = notification.create(db, parent_notification)
            
            if parent_success:
                notification.mark_as_sent(db, parent_notif_record.id)
            else:
                notification.mark_as_failed(db, parent_notif_record.id, "Failed to send email")
            
            return parent_success
            
        except Exception as e:
            logger.error(f"Failed to send appointment cancellation: {str(e)}")
            return False
    
    async def send_appointment_reminder(
        self, 
        db: Session,
        appointment: Appointment
    ) -> bool:
        """Send appointment reminder to parent."""
        try:
            # Get appointment details
            parent_user = appointment.parent.user
            teacher_user = appointment.teacher.user
            
            appointment_date = self._format_date_display(appointment.slot.week_start_date)
            appointment_time = self._format_time_display(appointment.slot.start_time)
            
            # Send reminder to parent
            success = await self.notification_service.send_appointment_reminder(
                parent_email=parent_user.email,
                parent_name=parent_user.full_name,
                teacher_name=teacher_user.full_name,
                teacher_subject=appointment.teacher.subject or "General",
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                student_name=appointment.parent.student_name
            )
            
            # Log notification
            reminder_notification = NotificationCreate(
                recipient_email=parent_user.email,
                recipient_name=parent_user.full_name,
                notification_type=NotificationType.APPOINTMENT_REMINDER,
                subject=f"Reminder: Appointment Tomorrow - {teacher_user.full_name}",
                content=f"Reminder for appointment on {appointment_date} at {appointment_time}",
                appointment_id=appointment.id
            )
            notif_record = notification.create(db, reminder_notification)
            
            if success:
                notification.mark_as_sent(db, notif_record.id)
            else:
                notification.mark_as_failed(db, notif_record.id, "Failed to send email")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send appointment reminder: {str(e)}")
            return False


# Global notification integration service instance
notification_integration = NotificationIntegrationService()