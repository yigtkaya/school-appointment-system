"""Appointment CRUD operations."""

import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.crud.base import CRUDBase
from app.models.appointment import Appointment
from app.models.teacher import Teacher
from app.models.slot import AvailableSlot
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.core.constants import AppointmentStatus


class CRUDAppointment(CRUDBase[Appointment, AppointmentCreate, AppointmentUpdate]):
    """CRUD operations for Appointment model."""

    def create(self, db: Session, *, obj_in: AppointmentCreate) -> Appointment:
        """Create a new appointment."""
        appointment_id = str(uuid.uuid4())
        db_obj = Appointment(
            id=appointment_id,
            **obj_in.model_dump()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_with_relations(self, db: Session, *, appointment_id: str) -> Optional[Appointment]:
        """Get appointment with all related information."""
        return db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).filter(self.model.id == appointment_id).first()

    def get_all_with_relations(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """Get all appointments with relations."""
        return db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).offset(skip).limit(limit).all()

    def get_by_teacher(self, db: Session, *, teacher_id: str, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """Get appointments by teacher ID."""
        return db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).filter(self.model.teacher_id == teacher_id).offset(skip).limit(limit).all()

    def get_by_status(self, db: Session, *, status: AppointmentStatus, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """Get appointments by status."""
        return db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).filter(self.model.status == status).offset(skip).limit(limit).all()

    def get_by_teacher_and_status(
        self, db: Session, *, teacher_id: str, status: AppointmentStatus
    ) -> List[Appointment]:
        """Get appointments by teacher and status."""
        return db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).filter(
            and_(
                self.model.teacher_id == teacher_id,
                self.model.status == status
            )
        ).all()

    def get_by_date_range(
        self,
        db: Session,
        *,
        start_date: date,
        end_date: date,
        teacher_id: Optional[str] = None,
        parent_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Appointment]:
        """Get appointments by date range with optional filters."""
        query = db.query(self.model).options(
            joinedload(self.model.teacher).joinedload(Teacher.user),
            joinedload(self.model.slot)
        ).join(AvailableSlot).filter(
            and_(
                AvailableSlot.start_time >= start_date,
                AvailableSlot.start_time <= end_date
            )
        )
        
        if teacher_id:
            query = query.filter(self.model.teacher_id == teacher_id)
            
        return query.offset(skip).limit(limit).all()

    def get_by_slot(self, db: Session, *, slot_id: str) -> Optional[Appointment]:
        """Get appointment by slot ID."""
        return db.query(self.model).filter(self.model.slot_id == slot_id).first()

    def confirm_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Confirm a pending appointment."""
        appointment = db.query(self.model).filter(self.model.id == appointment_id).first()
        if appointment and appointment.status == AppointmentStatus.PENDING:
            appointment.status = AppointmentStatus.CONFIRMED
            appointment.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(appointment)
            return appointment
        return None

    def cancel_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Cancel an appointment."""
        appointment = db.query(self.model).filter(self.model.id == appointment_id).first()
        if appointment and appointment.status != AppointmentStatus.CANCELLED:
            appointment.status = AppointmentStatus.CANCELLED
            appointment.updated_at = datetime.utcnow()
            
            # Free up the slot
            if appointment.slot:
                appointment.slot.is_booked = False
            
            db.commit()
            db.refresh(appointment)
            return appointment
        return None

    def complete_appointment(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Mark appointment as completed."""
        appointment = db.query(self.model).filter(self.model.id == appointment_id).first()
        if appointment and appointment.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]:
            appointment.status = AppointmentStatus.COMPLETED
            appointment.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(appointment)
            return appointment
        return None

    def mark_no_show(self, db: Session, appointment_id: str) -> Optional[Appointment]:
        """Mark appointment as no-show."""
        appointment = db.query(self.model).filter(self.model.id == appointment_id).first()
        if appointment and appointment.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]:
            appointment.status = AppointmentStatus.NO_SHOW
            appointment.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(appointment)
            return appointment
        return None

    def update_status(self, db: Session, appointment_id: str, status: AppointmentStatus) -> Optional[Appointment]:
        """Update appointment status."""
        appointment = db.query(self.model).filter(self.model.id == appointment_id).first()
        if appointment:
            appointment.status = status
            appointment.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(appointment)
            return appointment
        return None


appointment = CRUDAppointment(Appointment)