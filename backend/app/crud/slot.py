"""Available slot CRUD operations."""

import uuid
from datetime import datetime, date, time, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.crud.base import CRUDBase
from app.models.slot import AvailableSlot
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.slot import SlotCreate, SlotUpdate


class CRUDSlot(CRUDBase[AvailableSlot, SlotCreate, SlotUpdate]):
    """CRUD operations for AvailableSlot model."""
    
    def create(self, db: Session, obj_in: SlotCreate) -> AvailableSlot:
        """Create a new available slot."""
        slot_data = obj_in.model_dump()
        slot_data["id"] = str(uuid.uuid4())
        
        db_obj = self.model(**slot_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_with_teacher(self, db: Session, slot_id: str) -> Optional[AvailableSlot]:
        """Get slot with teacher information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.teacher).joinedload(Teacher.user))
            .filter(self.model.id == slot_id)
            .first()
        )
    
    def get_all_with_teachers(self, db: Session, skip: int = 0, limit: int = 100) -> List[AvailableSlot]:
        """Get all slots with teacher information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.teacher).joinedload(Teacher.user))
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
    ) -> List[AvailableSlot]:
        """Get slots for a specific teacher."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.teacher).joinedload(Teacher.user))
            .filter(self.model.teacher_id == teacher_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_available_slots(
        self, 
        db: Session, 
        week_start: Optional[date] = None,
        teacher_id: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[AvailableSlot]:
        """Get available (not booked) slots with optional filters."""
        query = (
            db.query(self.model)
            .options(joinedload(self.model.teacher).joinedload(Teacher.user))
            .filter(self.model.is_booked == False)
        )
        
        if week_start:
            query = query.filter(self.model.week_start_date == week_start)
        
        if teacher_id:
            query = query.filter(self.model.teacher_id == teacher_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_by_week(
        self, 
        db: Session, 
        week_start: date,
        teacher_id: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[AvailableSlot]:
        """Get slots for a specific week."""
        query = (
            db.query(self.model)
            .options(joinedload(self.model.teacher).joinedload(Teacher.user))
            .filter(self.model.week_start_date == week_start)
        )
        
        if teacher_id:
            query = query.filter(self.model.teacher_id == teacher_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_by_day_and_time(
        self,
        db: Session,
        teacher_id: str,
        day_of_week: int,
        start_time: time,
        end_time: time,
        week_start: date
    ) -> Optional[AvailableSlot]:
        """Get slot by teacher, day, time range and week."""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.teacher_id == teacher_id,
                    self.model.day_of_week == day_of_week,
                    self.model.start_time == start_time,
                    self.model.end_time == end_time,
                    self.model.week_start_date == week_start
                )
            )
            .first()
        )
    
    def check_time_conflict(
        self,
        db: Session,
        teacher_id: str,
        day_of_week: int,
        start_time: time,
        end_time: time,
        week_start: date,
        exclude_slot_id: Optional[str] = None
    ) -> bool:
        """Check if a time slot conflicts with existing slots."""
        query = (
            db.query(self.model)
            .filter(
                and_(
                    self.model.teacher_id == teacher_id,
                    self.model.day_of_week == day_of_week,
                    self.model.week_start_date == week_start,
                    # Check for time overlap
                    or_(
                        and_(
                            self.model.start_time < end_time,
                            self.model.end_time > start_time
                        )
                    )
                )
            )
        )
        
        if exclude_slot_id:
            query = query.filter(self.model.id != exclude_slot_id)
        
        return query.first() is not None
    
    def mark_as_booked(self, db: Session, slot_id: str) -> Optional[AvailableSlot]:
        """Mark a slot as booked."""
        slot = self.get(db, slot_id)
        if slot and not slot.is_booked:
            slot.is_booked = True
            db.commit()
            db.refresh(slot)
            return slot
        return None
    
    def mark_as_available(self, db: Session, slot_id: str) -> Optional[AvailableSlot]:
        """Mark a slot as available (unbook)."""
        slot = self.get(db, slot_id)
        if slot and slot.is_booked:
            slot.is_booked = False
            db.commit()
            db.refresh(slot)
            return slot
        return None


slot = CRUDSlot(AvailableSlot)