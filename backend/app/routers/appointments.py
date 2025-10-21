from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.models.available_slot import AvailableSlot
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
)
from app.core.dependencies import get_current_user, get_current_teacher

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


def check_appointment_conflict(
    db: Session,
    teacher_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_id: int = None,
):
    """Check if there's a conflict with existing appointments."""
    query = db.query(Appointment).filter(
        Appointment.teacher_id == teacher_id,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.appointment_start < end_time,
        Appointment.appointment_end > start_time,
    )
    
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    
    return query.first() is not None


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
):
    """Create a new appointment (public endpoint for parent booking)."""
    
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == appointment_data.teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Verify class exists
    from app.models.class_model import Class
    class_obj = db.query(Class).filter(Class.id == appointment_data.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    # Verify student exists
    from app.models.student import Student
    student = db.query(Student).filter(Student.id == appointment_data.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Check for conflicts
    if check_appointment_conflict(
        db,
        appointment_data.teacher_id,
        appointment_data.appointment_start,
        appointment_data.appointment_end,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Teacher has a conflicting appointment at this time",
        )
    
    # Verify slot availability
    slot = db.query(AvailableSlot).filter(
        AvailableSlot.teacher_id == appointment_data.teacher_id,
        AvailableSlot.is_active == True,
        AvailableSlot.start_time <= appointment_data.appointment_start.time(),
        AvailableSlot.end_time >= appointment_data.appointment_end.time(),
    ).first()
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available slots for the requested time",
        )
    
    # Create appointment
    new_appointment = Appointment(
        teacher_id=appointment_data.teacher_id,
        class_id=appointment_data.class_id,
        student_id=appointment_data.student_id,
        appointment_start=appointment_data.appointment_start,
        appointment_end=appointment_data.appointment_end,
        parent_name=appointment_data.parent_name,
        parent_email=appointment_data.parent_email,
        parent_phone=appointment_data.parent_phone,
        note=appointment_data.note,
        status="pending" if teacher.require_approval else "confirmed",
    )
    
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment


@router.get("/teachers/{teacher_id}/appointments", response_model=List[AppointmentResponse])
async def get_teacher_appointments(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Get appointments for a teacher."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Verify user can only view their own appointments (unless admin)
    if current_user.id != teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other teachers' appointments",
        )
    
    appointments = db.query(Appointment).filter(
        Appointment.teacher_id == teacher_id,
    ).all()
    return appointments


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    update_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Update appointment status (teacher can confirm/reject/cancel)."""
    
    # Get appointment
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Verify user is the teacher or admin
    if current_user.id != appointment.teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can update this appointment",
        )
    
    # Validate status
    if update_data.status:
        valid_statuses = ["pending", "confirmed", "cancelled", "rejected"]
        if update_data.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )
        appointment.status = update_data.status
    
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel an appointment."""
    
    # Get appointment
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Verify user is the teacher or admin
    if current_user.id != appointment.teacher_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can cancel this appointment",
        )
    
    # Update status to cancelled instead of deleting
    appointment.status = "cancelled"
    db.commit()
