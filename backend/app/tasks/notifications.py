"""Celery tasks for notification handling."""

from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from celery import current_task

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.services.notification import NotificationService
from app.models.notification import Notification, NotificationStatus, NotificationType
from app.models.appointment import Appointment
from app.models.user import User
from app.models.teacher import Teacher
from app.crud.notification import notification as notification_crud


def get_db() -> Session:
    """Get database session for Celery tasks."""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Don't close here, close in task


@celery_app.task(name="app.tasks.notifications.send_email_async", bind=True, max_retries=3)
def send_email_async(
    self,
    recipient_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None,
    notification_id: Optional[str] = None
):
    """
    Send email asynchronously via Celery.

    Args:
        recipient_email: Email address to send to
        subject: Email subject
        body: Plain text body
        html_body: HTML body (optional)
        notification_id: ID of notification record to update
    """
    db = get_db()

    try:
        email_service = NotificationService()
        success = email_service.send_email(
            to_email=recipient_email,
            subject=subject,
            body=body,
            html_body=html_body
        )

        # Update notification status if notification_id provided
        if notification_id and db:
            notification = notification_crud.get(db, id=notification_id)
            if notification:
                notification.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
                notification.sent_at = datetime.utcnow() if success else None
                if not success:
                    notification.error_message = "Failed to send email"
                db.commit()

        if not success:
            raise Exception("Email sending failed")

        return {"status": "sent", "recipient": recipient_email}

    except Exception as exc:
        # Update notification as failed
        if notification_id and db:
            notification = notification_crud.get(db, id=notification_id)
            if notification:
                notification.status = NotificationStatus.FAILED
                notification.error_message = str(exc)
                db.commit()

        # Retry task
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

    finally:
        if db:
            db.close()


@celery_app.task(name="app.tasks.notifications.send_appointment_confirmation")
def send_appointment_confirmation(appointment_id: str):
    """
    Send appointment confirmation email to teacher (anonymous booking).

    Args:
        appointment_id: ID of the appointment
    """
    db = get_db()

    try:
        # Get appointment with all relations
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()

        if not appointment:
            return {"status": "error", "message": "Appointment not found"}

        # Get teacher details (no parent since bookings are anonymous)
        teacher = db.query(Teacher).join(User).filter(
            Teacher.id == appointment.teacher_id
        ).first()

        if not teacher:
            return {"status": "error", "message": "Teacher not found"}

        slot = appointment.slot

        # Create notification record for teacher only (anonymous booking)
        teacher_notification = notification_crud.create(
            db,
            obj_in={
                "user_id": teacher.user_id,
                "appointment_id": appointment_id,
                "type": NotificationType.EMAIL,
                "subject": "New Anonymous Appointment - Auto-Confirmed",
                "message": f"New anonymous appointment for {appointment.child_name} ({appointment.child_year}{appointment.child_class}) has been automatically confirmed for {slot.start_time.strftime('%A, %B %d at %I:%M %p')}",
                "status": NotificationStatus.PENDING
            }
        )

        db.commit()

        # Send email to teacher only (anonymous booking)
        teacher_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #2563eb;">New Anonymous Appointment - Auto-Confirmed 📅</h2>
                    <p>Dear {teacher.user.full_name},</p>
                    <p>A new anonymous appointment has been booked and automatically confirmed:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Student:</strong> {appointment.child_name}</p>
                        <p><strong>Class:</strong> {appointment.child_year}{appointment.child_class}</p>
                        <p><strong>Date & Time:</strong> {slot.start_time.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Duration:</strong> {(slot.end_time - slot.start_time).seconds // 60} minutes</p>
                        <p><strong>Mode:</strong> {appointment.meeting_mode.value.title()}</p>
                        <p><strong>Contact:</strong> {appointment.parent_contact or 'Not provided'}</p>
                    </div>
                    <p>Please prepare for this appointment accordingly.</p>
                </div>
            </body>
        </html>
        """

        send_email_async.delay(
            recipient_email=teacher.user.email,
            subject="New Anonymous Appointment - Auto-Confirmed",
            body=teacher_notification.message,
            html_body=teacher_html,
            notification_id=str(teacher_notification.id)
        )

        return {
            "status": "success",
            "teacher_notification_id": str(teacher_notification.id)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.notifications.send_appointment_cancellation")
def send_appointment_cancellation(appointment_id: str, cancelled_by: str):
    """
    Send appointment cancellation email to teacher (anonymous booking).

    Args:
        appointment_id: ID of the cancelled appointment
        cancelled_by: Who cancelled the appointment (teacher/admin)
    """
    db = get_db()

    try:
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()

        if not appointment:
            return {"status": "error", "message": "Appointment not found"}

        teacher = db.query(Teacher).join(User).filter(
            Teacher.id == appointment.teacher_id
        ).first()

        if not teacher:
            return {"status": "error", "message": "Teacher not found"}

        slot = appointment.slot

        # Create notification record for teacher only
        teacher_notification = notification_crud.create(
            db,
            obj_in={
                "user_id": teacher.user_id,
                "appointment_id": appointment_id,
                "type": NotificationType.EMAIL,
                "subject": "Anonymous Appointment Cancelled",
                "message": f"Anonymous appointment for {appointment.child_name} ({appointment.child_year}{appointment.child_class}) scheduled for {slot.start_time.strftime('%A, %B %d at %I:%M %p')} has been cancelled.",
                "status": NotificationStatus.PENDING
            }
        )

        db.commit()

        # Send email to teacher
        teacher_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #dc2626;">Anonymous Appointment Cancelled ✗</h2>
                    <p>Dear {teacher.user.full_name},</p>
                    <p>An anonymous appointment has been cancelled:</p>
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Student:</strong> {appointment.child_name} ({appointment.child_year}{appointment.child_class})</p>
                        <p><strong>Original Date & Time:</strong> {slot.start_time.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Cancelled By:</strong> {cancelled_by.title()}</p>
                    </div>
                    <p>The time slot is now available for new bookings.</p>
                </div>
            </body>
        </html>
        """

        send_email_async.delay(
            recipient_email=teacher.user.email,
            subject="Anonymous Appointment Cancelled",
            body=teacher_notification.message,
            html_body=teacher_html,
            notification_id=str(teacher_notification.id)
        )

        return {
            "status": "success",
            "teacher_notification_id": str(teacher_notification.id)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.notifications.send_appointment_reminder")
def send_appointment_reminder(appointment_id: str):
    """
    Send appointment reminder (simplified for anonymous bookings).
    Since there's no parent email, this task will just log the reminder.

    Args:
        appointment_id: ID of the appointment
    """
    # For anonymous bookings, we can't send reminders to parents
    # This task exists to maintain compatibility but doesn't send emails
    return {"status": "skipped", "message": "No reminder sent for anonymous booking"}