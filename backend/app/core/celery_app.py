"""Celery application configuration."""

from celery import Celery
from celery.schedules import crontab
from app.core.config import get_settings

settings = get_settings()

# Initialize Celery app
celery_app = Celery(
    "school_appointment_system",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.notifications",
        "app.tasks.scheduled_jobs",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hour
)

# Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    # Send appointment reminders every hour (checks for appointments 24h away)
    "send-appointment-reminders": {
        "task": "app.tasks.scheduled_jobs.send_appointment_reminders",
        "schedule": crontab(minute=0),  # Every hour at minute 0
    },

    # Reset weekly slots every Sunday at midnight
    "reset-weekly-slots": {
        "task": "app.tasks.scheduled_jobs.reset_weekly_slots",
        "schedule": crontab(hour=0, minute=0, day_of_week=0),  # Sunday at 00:00
    },

    # Clean up old notifications (every day at 2 AM)
    "cleanup-old-notifications": {
        "task": "app.tasks.scheduled_jobs.cleanup_old_notifications",
        "schedule": crontab(hour=2, minute=0),  # Daily at 02:00
    },

    # Mark completed appointments (every day at 1 AM)
    "mark-completed-appointments": {
        "task": "app.tasks.scheduled_jobs.mark_completed_appointments",
        "schedule": crontab(hour=1, minute=0),  # Daily at 01:00
    },
}

# Task routes (optional - for task prioritization)
celery_app.conf.task_routes = {
    "app.tasks.notifications.*": {"queue": "notifications"},
    "app.tasks.scheduled_jobs.*": {"queue": "scheduled"},
}
