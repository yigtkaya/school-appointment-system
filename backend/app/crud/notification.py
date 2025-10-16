"""Notification CRUD operations."""

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.crud.base import CRUDBase
from app.models.notification import Notification, NotificationType, NotificationStatus
from app.schemas.notification import NotificationCreate, NotificationUpdate


class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    """CRUD operations for Notification model."""
    
    def create(self, db: Session, obj_in: NotificationCreate) -> Notification:
        """Create a new notification."""
        notification_data = obj_in.model_dump()
        notification_data["id"] = str(uuid.uuid4())
        
        db_obj = self.model(**notification_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_appointment(
        self, 
        db: Session, 
        appointment_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Notification]:
        """Get notifications for a specific appointment."""
        return (
            db.query(self.model)
            .filter(self.model.appointment_id == appointment_id)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_email(
        self,
        db: Session,
        email: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Notification]:
        """Get notifications for a specific email."""
        return (
            db.query(self.model)
            .filter(self.model.recipient_email == email)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status(
        self,
        db: Session,
        status: NotificationStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Notification]:
        """Get notifications by status."""
        return (
            db.query(self.model)
            .filter(self.model.status == status)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_type(
        self,
        db: Session,
        notification_type: NotificationType,
        skip: int = 0,
        limit: int = 100
    ) -> List[Notification]:
        """Get notifications by type."""
        return (
            db.query(self.model)
            .filter(self.model.notification_type == notification_type)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def mark_as_sent(self, db: Session, notification_id: str) -> Optional[Notification]:
        """Mark notification as sent."""
        notification = self.get(db, notification_id)
        if notification:
            notification.status = NotificationStatus.SENT
            notification.sent_at = datetime.utcnow()
            db.commit()
            db.refresh(notification)
            return notification
        return None
    
    def mark_as_failed(
        self, 
        db: Session, 
        notification_id: str, 
        error_message: str
    ) -> Optional[Notification]:
        """Mark notification as failed."""
        notification = self.get(db, notification_id)
        if notification:
            notification.status = NotificationStatus.FAILED
            notification.error_message = error_message
            db.commit()
            db.refresh(notification)
            return notification
        return None
    
    def get_pending_notifications(self, db: Session, limit: int = 100) -> List[Notification]:
        """Get pending notifications for processing."""
        return (
            db.query(self.model)
            .filter(self.model.status == NotificationStatus.PENDING)
            .order_by(self.model.created_at)
            .limit(limit)
            .all()
        )
    
    def get_statistics(self, db: Session) -> dict:
        """Get notification statistics."""
        total_sent = db.query(self.model).filter(
            self.model.status == NotificationStatus.SENT
        ).count()
        
        total_failed = db.query(self.model).filter(
            self.model.status == NotificationStatus.FAILED
        ).count()
        
        total_pending = db.query(self.model).filter(
            self.model.status == NotificationStatus.PENDING
        ).count()
        
        return {
            "total_sent": total_sent,
            "total_failed": total_failed,
            "total_pending": total_pending
        }


notification = CRUDNotification(Notification)