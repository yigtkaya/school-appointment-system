"""Available slot routes for the API."""

from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.slot import slot
from app.crud.teacher import teacher
from app.middleware.dependencies import get_current_user, get_admin_user, get_teacher_or_admin
from app.models.user import User
from app.schemas.slot import (
    SlotCreate,
    SlotUpdate,
    SlotResponse,
    SlotWithTeacher,
    SlotListResponse,
    BulkSlotCreate,
    WeeklyScheduleResponse,
)
from app.exceptions.http import ResourceNotFoundException, ConflictException, BadRequestException

router = APIRouter()


@router.get("/", response_model=SlotListResponse)
async def get_slots(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    teacher_id: Optional[str] = Query(None, description="Filter by teacher ID"),
    week_start: Optional[date] = Query(None, description="Filter by week start date"),
    available_only: bool = Query(False, description="Show only available slots"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SlotListResponse:
    """Get all slots with optional filters."""
    
    if available_only:
        slots_list = slot.get_available_slots(
            db, week_start=week_start, teacher_id=teacher_id, skip=skip, limit=limit
        )
    elif week_start:
        slots_list = slot.get_by_week(
            db, week_start=week_start, teacher_id=teacher_id, skip=skip, limit=limit
        )
    elif teacher_id:
        slots_list = slot.get_by_teacher(db, teacher_id=teacher_id, skip=skip, limit=limit)
    else:
        slots_list = slot.get_all_with_teachers(db, skip=skip, limit=limit)
    
    total = len(slots_list)  # TODO: Implement proper count query
    
    return SlotListResponse(
        slots=slots_list,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=SlotWithTeacher)
async def create_slot(
    slot_in: SlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> SlotWithTeacher:
    """Create a new time slot."""
    
    # Check if teacher exists
    db_teacher = teacher.get(db, id=slot_in.teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check if current user is the teacher or an admin
    if current_user.role != "admin" and db_teacher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create slots for this teacher")
    
    # Check for time conflicts
    if slot.check_time_conflict(
        db,
        teacher_id=slot_in.teacher_id,
        day_of_week=slot_in.day_of_week,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        week_start=slot_in.week_start_date
    ):
        raise ConflictException("Time slot conflicts with existing slot")
    
    # Create the slot
    db_slot = slot.create(db, obj_in=slot_in)
    
    # Return slot with teacher information
    return slot.get_with_teacher(db, slot_id=db_slot.id)


@router.post("/bulk", response_model=List[SlotWithTeacher])
async def create_bulk_slots(
    bulk_slots: BulkSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> List[SlotWithTeacher]:
    """Create multiple time slots for a teacher."""
    
    # Check if teacher exists
    db_teacher = teacher.get(db, id=bulk_slots.teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check if current user is the teacher or an admin
    if current_user.role != "admin" and db_teacher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create slots for this teacher")
    
    created_slots = []
    
    for time_slot in bulk_slots.time_slots:
        # Parse time strings if needed
        start_time = time_slot["start_time"]
        end_time = time_slot["end_time"]
        
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, "%H:%M").time()
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, "%H:%M").time()
        
        # Check for conflicts
        if slot.check_time_conflict(
            db,
            teacher_id=bulk_slots.teacher_id,
            day_of_week=time_slot["day_of_week"],
            start_time=start_time,
            end_time=end_time,
            week_start=bulk_slots.week_start_date
        ):
            raise ConflictException(
                f"Time slot on day {time_slot['day_of_week']} "
                f"from {start_time} to {end_time} conflicts with existing slot"
            )
        
        # Create slot
        slot_create = SlotCreate(
            teacher_id=bulk_slots.teacher_id,
            day_of_week=time_slot["day_of_week"],
            start_time=start_time,
            end_time=end_time,
            week_start_date=bulk_slots.week_start_date
        )
        
        db_slot = slot.create(db, obj_in=slot_create)
        created_slots.append(slot.get_with_teacher(db, slot_id=db_slot.id))
    
    return created_slots


@router.get("/{slot_id}", response_model=SlotWithTeacher)
async def get_slot(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SlotWithTeacher:
    """Get a specific slot by ID."""
    
    db_slot = slot.get_with_teacher(db, slot_id=slot_id)
    if not db_slot:
        raise ResourceNotFoundException("Slot not found")
    
    return db_slot


@router.put("/{slot_id}", response_model=SlotWithTeacher)
async def update_slot(
    slot_id: str,
    slot_update: SlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> SlotWithTeacher:
    """Update a time slot."""
    
    # Get existing slot
    db_slot = slot.get(db, id=slot_id)
    if not db_slot:
        raise ResourceNotFoundException("Slot not found")
    
    # Get teacher info
    db_teacher = teacher.get(db, id=db_slot.teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check if current user is the teacher or an admin
    if current_user.role != "admin" and db_teacher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this slot")
    
    # Check if slot is booked
    if db_slot.is_booked:
        raise BadRequestException("Cannot update a booked slot")
    
    # If time-related fields are being updated, check for conflicts
    update_data = slot_update.model_dump(exclude_unset=True)
    if any(field in update_data for field in ['day_of_week', 'start_time', 'end_time', 'week_start_date']):
        new_day = update_data.get('day_of_week', db_slot.day_of_week)
        new_start = update_data.get('start_time', db_slot.start_time)
        new_end = update_data.get('end_time', db_slot.end_time)
        new_week = update_data.get('week_start_date', db_slot.week_start_date)
        
        if slot.check_time_conflict(
            db,
            teacher_id=db_slot.teacher_id,
            day_of_week=new_day,
            start_time=new_start,
            end_time=new_end,
            week_start=new_week,
            exclude_slot_id=slot_id
        ):
            raise ConflictException("Updated time slot conflicts with existing slot")
    
    # Update the slot
    updated_slot = slot.update(db, db_obj=db_slot, obj_in=slot_update)
    
    # Return updated slot with teacher information
    return slot.get_with_teacher(db, slot_id=updated_slot.id)


@router.delete("/{slot_id}")
async def delete_slot(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> dict:
    """Delete a time slot."""
    
    # Get existing slot
    db_slot = slot.get(db, id=slot_id)
    if not db_slot:
        raise ResourceNotFoundException("Slot not found")
    
    # Get teacher info
    db_teacher = teacher.get(db, id=db_slot.teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check if current user is the teacher or an admin
    if current_user.role != "admin" and db_teacher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this slot")
    
    # Check if slot is booked
    if db_slot.is_booked:
        raise BadRequestException("Cannot delete a booked slot")
    
    # Delete the slot
    success = slot.delete(db, id=slot_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete slot")
    
    return {"message": "Slot deleted successfully"}


@router.get("/teacher/{teacher_id}/schedule", response_model=WeeklyScheduleResponse)
async def get_teacher_weekly_schedule(
    teacher_id: str,
    week_start: date = Query(..., description="Start date of the week (Monday)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeeklyScheduleResponse:
    """Get teacher's weekly schedule."""
    
    # Check if teacher exists
    db_teacher = teacher.get(db, id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Get all slots for the week
    week_slots = slot.get_by_week(db, week_start=week_start, teacher_id=teacher_id)
    
    # Group slots by day
    slots_by_day = {}
    available_count = 0
    booked_count = 0
    
    for s in week_slots:
        day = s.day_of_week
        if day not in slots_by_day:
            slots_by_day[day] = []
        slots_by_day[day].append(s)
        
        if s.is_booked:
            booked_count += 1
        else:
            available_count += 1
    
    return WeeklyScheduleResponse(
        teacher_id=teacher_id,
        week_start_date=week_start,
        slots_by_day=slots_by_day,
        total_slots=len(week_slots),
        available_slots=available_count,
        booked_slots=booked_count
    )