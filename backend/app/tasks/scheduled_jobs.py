"""Celery scheduled tasks for periodic jobs."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.slot import AvailableSlot
from app.models.notification import Notification, NotificationStatus
from app.tasks.notifications import send_appointment_reminder


def get_db() -> Session:
    """Get database session for Celery tasks."""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Don't close here, close in task


@celery_app.task(name="app.tasks.scheduled_jobs.send_appointment_reminders")
def send_appointment_reminders():
    """
    Send reminders for appointments happening in the next 24 hours.
    Runs every hour via Celery Beat.
    """
    db = get_db()

    try:
        # Calculate time window (23-25 hours from now to account for hourly checks)
        now = datetime.utcnow()
        reminder_start = now + timedelta(hours=23)
        reminder_end = now + timedelta(hours=25)

        # Find confirmed appointments in the next 24 hours that haven't been reminded
        appointments = db.query(Appointment).join(AvailableSlot).filter(
            and_(
                Appointment.status == AppointmentStatus.CONFIRMED,
                AvailableSlot.start_time >= reminder_start,
                AvailableSlot.start_time <= reminder_end,
                or_(
                    Appointment.reminder_sent == False,
                    Appointment.reminder_sent == None
                )
            )
        ).all()

        sent_count = 0
        failed_count = 0

        for appointment in appointments:
            try:
                # Send reminder asynchronously
                send_appointment_reminder.delay(str(appointment.id))

                # Mark as reminded
                appointment.reminder_sent = True
                db.commit()
                sent_count += 1

            except Exception as e:
                print(f"Failed to send reminder for appointment {appointment.id}: {e}")
                failed_count += 1
                db.rollback()

        return {
            "status": "completed",
            "sent": sent_count,
            "failed": failed_count,
            "checked_window": f"{reminder_start} to {reminder_end}"
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.scheduled_jobs.reset_weekly_slots")
def reset_weekly_slots():
    """
    Reset weekly slots every Sunday at midnight.
    Creates new slots for the upcoming week based on teacher availability.
    Removes old unbooked slots from past weeks.
    """
    db = get_db()

    try:
        now = datetime.utcnow()
        one_week_ago = now - timedelta(days=7)

        # Delete old unbooked slots (from previous weeks)
        deleted_slots = db.query(AvailableSlot).filter(
            and_(
                AvailableSlot.is_booked == False,
                AvailableSlot.start_time < one_week_ago
            )
        ).delete(synchronize_session=False)

        db.commit()

        # Note: Creating new slots should be done manually by admins/teachers
        # or you can implement automatic slot generation based on teacher preferences
        # stored in a separate table (e.g., TeacherAvailability)

        return {
            "status": "completed",
            "deleted_old_slots": deleted_slots,
            "reset_date": now.isoformat()
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.scheduled_jobs.cleanup_old_notifications")
def cleanup_old_notifications():
    """
    Clean up old notifications (older than 30 days).
    Runs daily at 2 AM via Celery Beat.
    """
    db = get_db()

    try:
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        # Delete old notifications
        deleted_count = db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete(synchronize_session=False)

        db.commit()

        return {
            "status": "completed",
            "deleted_notifications": deleted_count,
            "cutoff_date": cutoff_date.isoformat()
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.scheduled_jobs.mark_completed_appointments")
def mark_completed_appointments():
    """
    Mark past appointments as completed if they're still in confirmed status.
    Runs daily at 1 AM via Celery Beat.
    """
    db = get_db()

    try:
        now = datetime.utcnow()

        # Find confirmed appointments whose slot end time has passed
        appointments = db.query(Appointment).join(AvailableSlot).filter(
            and_(
                Appointment.status == AppointmentStatus.CONFIRMED,
                AvailableSlot.end_time < now
            )
        ).all()

        updated_count = 0

        for appointment in appointments:
            appointment.status = AppointmentStatus.COMPLETED
            updated_count += 1

        db.commit()

        return {
            "status": "completed",
            "marked_completed": updated_count,
            "check_date": now.isoformat()
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.scheduled_jobs.generate_weekly_slots")
def generate_weekly_slots(teacher_id: str, slot_template: dict):
    """
    Generate weekly slots for a teacher based on a template.
    This is a manual task that can be triggered by admins.

    Args:
        teacher_id: ID of the teacher
        slot_template: Dict with recurring availability pattern
            Example: {
                "monday": [{"start": "09:00", "end": "10:00"}, {"start": "14:00", "end": "15:00"}],
                "tuesday": [{"start": "10:00", "end": "11:00"}],
                ...
            }
    """
    db = get_db()

    try:
        from datetime import time

        created_count = 0
        today = datetime.utcnow().date()

        # Generate slots for next 4 weeks
        for week in range(4):
            week_start = today + timedelta(days=7 * week)

            for day_offset in range(7):
                current_date = week_start + timedelta(days=day_offset)
                day_name = current_date.strftime("%A").lower()

                if day_name in slot_template:
                    for slot_data in slot_template[day_name]:
                        # Parse time strings
                        start_hour, start_minute = map(int, slot_data["start"].split(":"))
                        end_hour, end_minute = map(int, slot_data["end"].split(":"))

                        start_time = datetime.combine(
                            current_date,
                            time(start_hour, start_minute)
                        )
                        end_time = datetime.combine(
                            current_date,
                            time(end_hour, end_minute)
                        )

                        # Check if slot already exists
                        existing_slot = db.query(AvailableSlot).filter(
                            and_(
                                AvailableSlot.teacher_id == teacher_id,
                                AvailableSlot.start_time == start_time,
                                AvailableSlot.end_time == end_time
                            )
                        ).first()

                        if not existing_slot:
                            new_slot = AvailableSlot(
                                teacher_id=teacher_id,
                                start_time=start_time,
                                end_time=end_time,
                                is_booked=False
                            )
                            db.add(new_slot)
                            created_count += 1

        db.commit()

        return {
            "status": "completed",
            "created_slots": created_count,
            "teacher_id": teacher_id,
            "weeks_generated": 4
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="app.tasks.scheduled_jobs.send_daily_summary")
def send_daily_summary(teacher_id: str, target_date: datetime):
    """
    Send daily appointment summary to teachers.
    Shows all appointments for a specific day.

    Args:
        teacher_id: ID of the teacher
        target_date: Date to summarize
    """
    db = get_db()

    try:
        from app.models.teacher import Teacher
        from app.models.parent import Parent
        from app.models.user import User

        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not teacher:
            return {"status": "error", "message": "Teacher not found"}

        # Get appointments for the day
        day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        appointments = db.query(Appointment).join(AvailableSlot).filter(
            and_(
                Appointment.teacher_id == teacher_id,
                Appointment.status == AppointmentStatus.CONFIRMED,
                AvailableSlot.start_time >= day_start,
                AvailableSlot.start_time < day_end
            )
        ).order_by(AvailableSlot.start_time).all()

        if not appointments:
            return {
                "status": "completed",
                "teacher_id": teacher_id,
                "appointments_count": 0,
                "message": "No appointments for this day"
            }

        # Build summary email
        appointment_list = []
        for appt in appointments:
            parent = db.query(Parent).join(User).filter(
                Parent.id == appt.parent_id
            ).first()

            appointment_list.append({
                "time": appt.slot.start_time.strftime("%I:%M %p"),
                "parent": parent.user.full_name,
                "student": parent.student_name,
                "mode": appt.meeting_mode.value
            })

        # Send summary email
        from app.tasks.notifications import send_email_async

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Daily Appointment Summary 📅</h2>
                    <p>Dear {teacher.user.full_name},</p>
                    <p>You have <strong>{len(appointments)} appointment(s)</strong> scheduled for {target_date.strftime('%A, %B %d, %Y')}:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Time</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Parent</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Student</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {"".join([f'''
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">{appt["time"]}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">{appt["parent"]}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">{appt["student"]}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">{appt["mode"].title()}</td>
                            </tr>
                            ''' for appt in appointment_list])}
                        </tbody>
                    </table>
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Have a productive day!
                    </p>
                </div>
            </body>
        </html>
        """

        send_email_async.delay(
            recipient_email=teacher.user.email,
            subject=f"Daily Summary - {target_date.strftime('%B %d, %Y')}",
            body=f"You have {len(appointments)} appointments scheduled for {target_date.strftime('%A, %B %d, %Y')}",
            html_body=html_body
        )

        return {
            "status": "completed",
            "teacher_id": teacher_id,
            "appointments_count": len(appointments),
            "date": target_date.isoformat()
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        db.close()
