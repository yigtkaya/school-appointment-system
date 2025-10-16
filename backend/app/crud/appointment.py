"""Appointment CRUD operations."""

import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.crud.base import CRUDBase
from app.models.appointment import Appointment
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.models.slot import AvailableSlot
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.core.constants import AppointmentStatus


class CRUDAppointment(CRUDBase[Appointment, AppointmentCreate, AppointmentUpdate]):
    """CRUD operations for Appointment model."""
    
    def create(self, db: Session, obj_in: AppointmentCreate) -> Appointment:
        """Create a new appointment."""
        appointment_data = obj_in.model_dump()
        appointment_data["id"] = str(uuid.uuid4())
        
        db_obj = self.model(**appointment_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_with_relations(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Get appointment with all related information."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .filter(self.model.id == appointment_id)
            .first()
        )
    
    def get_all_with_relations(self, db: Session, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """Get all appointments with related information."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_parent(
        self, 
        db: Session, 
        parent_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Appointment]:
        """Get appointments for a specific parent."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .filter(self.model.parent_id == parent_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_teacher(
        self, 
        db: Session, 
        teacher_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Appointment]:
        """Get appointments for a specific teacher."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .filter(self.model.teacher_id == teacher_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status(
        self, 
        db: Session, 
        status: AppointmentStatus,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Appointment]:
        """Get appointments by status."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_slot(self, db: Session, slot_id: str) -> Optional[Appointment]:
        """Get appointment by slot ID."""
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .filter(self.model.slot_id == slot_id)
            .first()
        )
    
    def get_by_date_range(
        self,
        db: Session,
        start_date: date,
        end_date: date,
        teacher_id: Optional[str] = None,
        parent_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Appointment]:
        """Get appointments within a date range."""
        query = (
            db.query(self.model)
            .options(
                joinedload(self.model.parent).joinedload(Parent.user),
                joinedload(self.model.teacher).joinedload(Teacher.user),
                joinedload(self.model.slot).joinedload(AvailableSlot.teacher).joinedload(Teacher.user)
            )
            .join(self.model.slot)
            .filter(
                and_(
                    self.model.slot.has(week_start_date__gte=start_date),
                    self.model.slot.has(week_start_date__lte=end_date)
                )
            )
        )
        
        if teacher_id:
            query = query.filter(self.model.teacher_id == teacher_id)
        
        if parent_id:
            query = query.filter(self.model.parent_id == parent_id)
        
        return query.offset(skip).limit(limit).all()
    
    def update_status(
        self, 
        db: Session, 
        appointment_id: str, 
        new_status: AppointmentStatus
    ) -> Optional[Appointment]:
        """Update appointment status."""
        appointment = self.get(db, appointment_id)
        if appointment:
            appointment.status = new_status
            db.commit()
            db.refresh(appointment)
            return appointment
        return None
    
    def cancel_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Cancel an appointment and mark slot as available."""
        from app.crud.slot import slot  # Import here to avoid circular import
        
        appointment = self.get(db, appointment_id)
        if appointment and appointment.status != AppointmentStatus.CANCELLED:
            # Update appointment status
            appointment.status = AppointmentStatus.CANCELLED
            
            # Mark slot as available
            slot.mark_as_available(db, appointment.slot_id)
            
            db.commit()
            db.refresh(appointment)
            return appointment
        return None
    
    def confirm_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Confirm an appointment."""
        appointment = self.get(db, appointment_id)
        if appointment and appointment.status == AppointmentStatus.PENDING:
            appointment.status = AppointmentStatus.CONFIRMED
            db.commit()
            db.refresh(appointment)
            return appointment
        return None
    
    def complete_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Mark an appointment as completed."""
        appointment = self.get(db, appointment_id)
        if appointment and appointment.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]:
            appointment.status = AppointmentStatus.COMPLETED
            db.commit()
            db.refresh(appointment)
            return appointment
        return None
    
    def mark_no_show(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Mark an appointment as no-show."""
        appointment = self.get(db, appointment_id)
        if appointment and appointment.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]:
            appointment.status = AppointmentStatus.NO_SHOW
            db.commit()
            db.refresh(appointment)
            return appointment
        return None


appointment = CRUDAppointment(Appointment)