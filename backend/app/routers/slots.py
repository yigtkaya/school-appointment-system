from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.available_slot import AvailableSlot
from app.models.user import User
from app.schemas.slot import (
    AvailableSlotCreate,
    AvailableSlotUpdate,
    AvailableSlotResponse,
)
from app.core.dependencies import get_current_teacher

router = APIRouter(prefix="/api/teachers", tags=["slots"])


@router.get("/{teacher_id}/slots", response_model=List[AvailableSlotResponse])
async def get_teacher_slots(teacher_id: int, db: Session = Depends(get_db)):
    """Get all available slots for a teacher."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    slots = db.query(AvailableSlot).filter(
        AvailableSlot.teacher_id == teacher_id,
        AvailableSlot.is_active == True,
    ).all()
    return slots


@router.post("/{teacher_id}/slots", response_model=AvailableSlotResponse, status_code=status.HTTP_201_CREATED)
async def create_slot(
    teacher_id: int,
    slot_data: AvailableSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Create a new available slot (teacher can only create their own slots)."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Verify user can only create slots for themselves (unless admin)
    if current_user.id != teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create slots for other teachers",
        )
    
    new_slot = AvailableSlot(
        teacher_id=teacher_id,
        day_of_week=slot_data.day_of_week,
        date=slot_data.date,
        start_time=slot_data.start_time,
        end_time=slot_data.end_time,
        timezone=slot_data.timezone,
        is_active=slot_data.is_active,
    )
    
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot


@router.put("/{teacher_id}/slots/{slot_id}", response_model=AvailableSlotResponse)
async def update_slot(
    teacher_id: int,
    slot_id: int,
    slot_data: AvailableSlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Update an available slot."""
    # Verify slot exists and belongs to teacher
    slot = db.query(AvailableSlot).filter(
        AvailableSlot.id == slot_id,
        AvailableSlot.teacher_id == teacher_id,
    ).first()
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found",
        )
    
    # Verify user can only update their own slots (unless admin)
    if current_user.id != teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update slots for other teachers",
        )
    
    # Update fields
    if slot_data.day_of_week is not None:
        slot.day_of_week = slot_data.day_of_week
    if slot_data.start_time is not None:
        slot.start_time = slot_data.start_time
    if slot_data.end_time is not None:
        slot.end_time = slot_data.end_time
    if slot_data.timezone is not None:
        slot.timezone = slot_data.timezone
    if slot_data.is_active is not None:
        slot.is_active = slot_data.is_active
    
    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{teacher_id}/slots/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slot(
    teacher_id: int,
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Delete an available slot."""
    # Verify slot exists and belongs to teacher
    slot = db.query(AvailableSlot).filter(
        AvailableSlot.id == slot_id,
        AvailableSlot.teacher_id == teacher_id,
    ).first()
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found",
        )
    
    # Verify user can only delete their own slots (unless admin)
    if current_user.id != teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete slots for other teachers",
        )
    
    db.delete(slot)
    db.commit()


@router.get("/{teacher_id}/available-days", response_model=List[int])
async def get_available_days(teacher_id: int, db: Session = Depends(get_db)):
    """Get days of week when teacher has available slots."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Get unique days with active slots
    available_days = db.query(AvailableSlot.day_of_week).filter(
        AvailableSlot.teacher_id == teacher_id,
        AvailableSlot.is_active == True,
    ).distinct().all()
    
    return [day[0] for day in available_days]


@router.get("/{teacher_id}/available-times")
async def get_available_times(
    teacher_id: int,
    date: datetime,
    db: Session = Depends(get_db),
):
    """Get available time slots for a specific date."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    day_of_week = date.weekday()
    
    # Get active slots for this day
    slots = db.query(AvailableSlot).filter(
        AvailableSlot.teacher_id == teacher_id,
        AvailableSlot.day_of_week == day_of_week,
        AvailableSlot.is_active == True,
    ).all()
    
    return [
        {
            "id": slot.id,
            "start_time": slot.start_time.isoformat(),
            "end_time": slot.end_time.isoformat(),
            "timezone": slot.timezone,
        }
        for slot in slots
    ]
