"""Notification routes for the API."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.notification import notification
from app.crud.appointment import appointment
from app.services.notification_integration import notification_integration
from app.middleware.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.models.notification import NotificationType, NotificationStatus
from app.schemas.notification import (
    NotificationResponse,
    NotificationSummary,
    SendNotificationRequest,
)
from app.exceptions.http import ResourceNotFoundException, BadRequestException

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[NotificationStatus] = Query(None, description="Filter by status"),
    notification_type: Optional[NotificationType] = Query(None, description="Filter by type"),
    email: Optional[str] = Query(None, description="Filter by recipient email"),
    appointment_id: Optional[str] = Query(None, description="Filter by appointment ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> List[NotificationResponse]:
    """Get all notifications with optional filters (admin only)."""
    
    if status:
        notifications = notification.get_by_status(db, status=status, skip=skip, limit=limit)
    elif notification_type:
        notifications = notification.get_by_type(db, notification_type=notification_type, skip=skip, limit=limit)
    elif email:
        notifications = notification.get_by_email(db, email=email, skip=skip, limit=limit)
    elif appointment_id:
        notifications = notification.get_by_appointment(db, appointment_id=appointment_id, skip=skip, limit=limit)
    else:
        # Get all notifications by retrieving all statuses
        all_notifications = []
        for status in [NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.FAILED]:
            status_notifications = notification.get_by_status(db, status=status, skip=0, limit=1000)
            all_notifications.extend(status_notifications)
        
        # Apply pagination manually
        notifications = all_notifications[skip:skip+limit]
    
    return notifications


@router.get("/summary", response_model=NotificationSummary)
async def get_notification_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> NotificationSummary:
    """Get notification statistics summary (admin only)."""
    
    stats = notification.get_statistics(db)
    recent_notifications = notification.get_by_status(db, status=NotificationStatus.SENT, skip=0, limit=10)
    
    return NotificationSummary(
        total_sent=stats["total_sent"],
        total_failed=stats["total_failed"],
        total_pending=stats["total_pending"],
        recent_notifications=recent_notifications
    )


@router.get("/appointment/{appointment_id}", response_model=List[NotificationResponse])
async def get_appointment_notifications(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[NotificationResponse]:
    """Get all notifications for a specific appointment."""
    
    # Check if appointment exists
    db_appointment = appointment.get(db, id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Authorization check
    authorized = False
    if current_user.role == "admin":
        authorized = True
    elif current_user.role == "teacher":
        if db_appointment.teacher.user_id == current_user.id:
            authorized = True
    elif current_user.role == "parent":
        if db_appointment.parent.user_id == current_user.id:
            authorized = True
    
    if not authorized:
        raise HTTPException(status_code=403, detail="Not authorized to view these notifications")
    
    return notification.get_by_appointment(db, appointment_id=appointment_id)


@router.post("/send", response_model=dict)
async def send_notification(
    request: SendNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Send a notification manually (admin only)."""
    
    # Get appointment with relations
    db_appointment = appointment.get_with_relations(db, appointment_id=request.appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Validate notification type
    if request.notification_type not in [
        NotificationType.APPOINTMENT_CONFIRMATION,
        NotificationType.APPOINTMENT_CANCELLATION,
        NotificationType.APPOINTMENT_REMINDER
    ]:
        raise BadRequestException("Invalid notification type")
    
    # Send notification based on type
    async def send_notification_task():
        try:
            if request.notification_type == NotificationType.APPOINTMENT_CONFIRMATION:
                success = await notification_integration.send_appointment_confirmation(db, db_appointment)
            elif request.notification_type == NotificationType.APPOINTMENT_CANCELLATION:
                success = await notification_integration.send_appointment_cancellation(db, db_appointment)
            elif request.notification_type == NotificationType.APPOINTMENT_REMINDER:
                success = await notification_integration.send_appointment_reminder(db, db_appointment)
            else:
                success = False
            
            return success
        except Exception as e:
            print(f"Background notification task failed: {str(e)}")
            return False
    
    # Add to background tasks
    background_tasks.add_task(send_notification_task)
    
    return {"message": f"Notification queued for sending", "appointment_id": request.appointment_id}


@router.post("/send-reminder/{appointment_id}", response_model=dict)
async def send_appointment_reminder(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Send appointment reminder manually (admin only)."""
    
    # Get appointment with relations
    db_appointment = appointment.get_with_relations(db, appointment_id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Check if appointment is in valid state for reminder
    if db_appointment.status not in ["pending", "confirmed"]:
        raise BadRequestException("Cannot send reminder for cancelled or completed appointments")
    
    # Send reminder
    async def send_reminder_task():
        try:
            return await notification_integration.send_appointment_reminder(db, db_appointment)
        except Exception as e:
            print(f"Background reminder task failed: {str(e)}")
            return False
    
    background_tasks.add_task(send_reminder_task)
    
    return {"message": "Reminder queued for sending", "appointment_id": appointment_id}


@router.get("/failed", response_model=List[NotificationResponse])
async def get_failed_notifications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> List[NotificationResponse]:
    """Get all failed notifications (admin only)."""
    
    return notification.get_by_status(
        db, 
        status=NotificationStatus.FAILED, 
        skip=skip, 
        limit=limit
    )


@router.post("/retry/{notification_id}", response_model=dict)
async def retry_failed_notification(
    notification_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Retry a failed notification (admin only)."""
    
    # Get notification
    db_notification = notification.get(db, id=notification_id)
    if not db_notification:
        raise ResourceNotFoundException("Notification not found")
    
    if db_notification.status != NotificationStatus.FAILED:
        raise BadRequestException("Can only retry failed notifications")
    
    # Get related appointment
    if not db_notification.appointment_id:
        raise BadRequestException("No appointment associated with this notification")
    
    db_appointment = appointment.get_with_relations(db, appointment_id=db_notification.appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Associated appointment not found")
    
    # Retry notification
    async def retry_notification_task():
        try:
            if db_notification.notification_type == NotificationType.APPOINTMENT_CONFIRMATION:
                success = await notification_integration.send_appointment_confirmation(db, db_appointment)
            elif db_notification.notification_type == NotificationType.APPOINTMENT_CANCELLATION:
                success = await notification_integration.send_appointment_cancellation(db, db_appointment)
            elif db_notification.notification_type == NotificationType.APPOINTMENT_REMINDER:
                success = await notification_integration.send_appointment_reminder(db, db_appointment)
            else:
                success = False
            
            return success
        except Exception as e:
            print(f"Retry notification task failed: {str(e)}")
            return False
    
    background_tasks.add_task(retry_notification_task)
    
    return {"message": "Notification retry queued", "notification_id": notification_id}