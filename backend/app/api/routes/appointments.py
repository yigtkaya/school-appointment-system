"""Appointment routes for the API."""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.appointment import appointment
from app.crud.slot import slot
from app.crud.parent import parent
from app.crud.teacher import teacher
from app.services.notification_integration import notification_integration
from app.middleware.dependencies import get_current_user, get_admin_user, get_parent_user, get_teacher_or_admin
from app.models.user import User
from app.core.constants import AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentStatusUpdate,
    AppointmentResponse,
    AppointmentWithRelations,
    AppointmentListResponse,
    AppointmentBookingRequest,
    AppointmentSummary,
    TeacherScheduleResponse,
    ParentAppointmentsResponse,
)
from app.exceptions.http import ResourceNotFoundException, ConflictException, BadRequestException

router = APIRouter()


@router.get("/", response_model=AppointmentListResponse)
async def get_appointments(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[AppointmentStatus] = Query(None, description="Filter by status"),
    teacher_id: Optional[str] = Query(None, description="Filter by teacher ID"),
    parent_id: Optional[str] = Query(None, description="Filter by parent ID"),
    start_date: Optional[date] = Query(None, description="Filter from start date"),
    end_date: Optional[date] = Query(None, description="Filter to end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointmentListResponse:
    """Get all appointments with optional filters."""
    
    # Role-based filtering
    if current_user.role == "parent":
        # Parents can only see their own appointments
        db_parent = parent.get_by_user_id(db, user_id=current_user.id)
        if not db_parent:
            raise ResourceNotFoundException("Parent profile not found")
        appointments_list = appointment.get_by_parent(db, parent_id=db_parent.id, skip=skip, limit=limit)
    
    elif current_user.role == "teacher":
        # Teachers can only see their own appointments
        db_teacher = teacher.get_by_user_id(db, user_id=current_user.id)
        if not db_teacher:
            raise ResourceNotFoundException("Teacher profile not found")
        appointments_list = appointment.get_by_teacher(db, teacher_id=db_teacher.id, skip=skip, limit=limit)
    
    else:  # admin
        # Admins can see all appointments with filters
        if status:
            appointments_list = appointment.get_by_status(db, status=status, skip=skip, limit=limit)
        elif teacher_id:
            appointments_list = appointment.get_by_teacher(db, teacher_id=teacher_id, skip=skip, limit=limit)
        elif parent_id:
            appointments_list = appointment.get_by_parent(db, parent_id=parent_id, skip=skip, limit=limit)
        elif start_date and end_date:
            appointments_list = appointment.get_by_date_range(
                db, start_date=start_date, end_date=end_date, 
                teacher_id=teacher_id, parent_id=parent_id, skip=skip, limit=limit
            )
        else:
            appointments_list = appointment.get_all_with_relations(db, skip=skip, limit=limit)
    
    total = len(appointments_list)  # TODO: Implement proper count query
    
    return AppointmentListResponse(
        appointments=appointments_list,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/book", response_model=AppointmentWithRelations)
async def book_appointment(
    booking_request: AppointmentBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_parent_user),
) -> AppointmentWithRelations:
    """Book an appointment (parent only)."""
    
    # Get parent profile
    db_parent = parent.get_by_user_id(db, user_id=current_user.id)
    if not db_parent:
        raise ResourceNotFoundException("Parent profile not found")
    
    # Check if slot exists and is available
    db_slot = slot.get(db, id=booking_request.slot_id)
    if not db_slot:
        raise ResourceNotFoundException("Slot not found")
    
    if db_slot.is_booked:
        raise ConflictException("Slot is already booked")
    
    # Check if slot already has an appointment
    existing_appointment = appointment.get_by_slot(db, slot_id=booking_request.slot_id)
    if existing_appointment:
        raise ConflictException("Slot already has an appointment")
    
    # Create appointment
    appointment_create = AppointmentCreate(
        parent_id=db_parent.id,
        teacher_id=db_slot.teacher_id,
        slot_id=booking_request.slot_id,
        meeting_mode=booking_request.meeting_mode,
        notes=booking_request.notes
    )
    
    db_appointment = appointment.create(db, obj_in=appointment_create)
    
    # Mark slot as booked
    slot.mark_as_booked(db, slot_id=booking_request.slot_id)
    
    # Get appointment with relations for notifications
    db_appointment_with_relations = appointment.get_with_relations(db, appointment_id=db_appointment.id)
    
    # Send notifications asynchronously
    try:
        await notification_integration.send_appointment_confirmation(db, db_appointment_with_relations)
    except Exception as e:
        # Log error but don't fail the booking
        print(f"Failed to send confirmation notifications: {str(e)}")
    
    # Return appointment with all relations
    return db_appointment_with_relations


@router.get("/{appointment_id}", response_model=AppointmentWithRelations)
async def get_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointmentWithRelations:
    """Get a specific appointment by ID."""
    
    db_appointment = appointment.get_with_relations(db, appointment_id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Check authorization
    if current_user.role == "parent":
        db_parent = parent.get_by_user_id(db, user_id=current_user.id)
        if not db_parent or db_appointment.parent_id != db_parent.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    
    elif current_user.role == "teacher":
        db_teacher = teacher.get_by_user_id(db, user_id=current_user.id)
        if not db_teacher or db_appointment.teacher_id != db_teacher.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    
    return db_appointment


@router.put("/{appointment_id}", response_model=AppointmentWithRelations)
async def update_appointment(
    appointment_id: str,
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointmentWithRelations:
    """Update an appointment."""
    
    # Get existing appointment
    db_appointment = appointment.get(db, id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Check authorization - only parent or admin can update
    if current_user.role == "parent":
        db_parent = parent.get_by_user_id(db, user_id=current_user.id)
        if not db_parent or db_appointment.parent_id != db_parent.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    elif current_user.role == "teacher":
        raise HTTPException(status_code=403, detail="Teachers cannot update appointment details")
    
    # Check if appointment can be updated
    if db_appointment.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
        raise BadRequestException("Cannot update cancelled or completed appointments")
    
    # Update the appointment
    updated_appointment = appointment.update(db, db_obj=db_appointment, obj_in=appointment_update)
    
    # Return updated appointment with relations
    return appointment.get_with_relations(db, appointment_id=updated_appointment.id)


@router.put("/{appointment_id}/status", response_model=AppointmentWithRelations)
async def update_appointment_status(
    appointment_id: str,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> AppointmentWithRelations:
    """Update appointment status (teacher/admin only)."""
    
    # Get existing appointment
    db_appointment = appointment.get(db, id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Check if teacher is authorized (only for their own appointments)
    if current_user.role == "teacher":
        db_teacher = teacher.get_by_user_id(db, user_id=current_user.id)
        if not db_teacher or db_appointment.teacher_id != db_teacher.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment status")
    
    # Update status using the appropriate method
    if status_update.status == AppointmentStatus.CONFIRMED:
        updated_appointment = appointment.confirm_appointment(db, appointment_id)
    elif status_update.status == AppointmentStatus.COMPLETED:
        updated_appointment = appointment.complete_appointment(db, appointment_id)
    elif status_update.status == AppointmentStatus.NO_SHOW:
        updated_appointment = appointment.mark_no_show(db, appointment_id)
    elif status_update.status == AppointmentStatus.CANCELLED:
        updated_appointment = appointment.cancel_appointment(db, appointment_id)
    else:
        # Direct status update
        updated_appointment = appointment.update_status(db, appointment_id, status_update.status)
    
    if not updated_appointment:
        raise BadRequestException("Failed to update appointment status")
    
    return appointment.get_with_relations(db, appointment_id=updated_appointment.id)


@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Cancel an appointment."""
    
    # Get existing appointment
    db_appointment = appointment.get(db, id=appointment_id)
    if not db_appointment:
        raise ResourceNotFoundException("Appointment not found")
    
    # Check authorization
    authorized = False
    if current_user.role == "admin":
        authorized = True
    elif current_user.role == "parent":
        db_parent = parent.get_by_user_id(db, user_id=current_user.id)
        if db_parent and db_appointment.parent_id == db_parent.id:
            authorized = True
    elif current_user.role == "teacher":
        db_teacher = teacher.get_by_user_id(db, user_id=current_user.id)
        if db_teacher and db_appointment.teacher_id == db_teacher.id:
            authorized = True
    
    if not authorized:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")
    
    # Check if appointment can be cancelled
    if db_appointment.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
        raise BadRequestException("Appointment is already cancelled or completed")
    
    # Get appointment with relations before cancelling for notifications
    appointment_with_relations = appointment.get_with_relations(db, appointment_id)
    
    # Cancel the appointment
    cancelled_appointment = appointment.cancel_appointment(db, appointment_id)
    if not cancelled_appointment:
        raise HTTPException(status_code=500, detail="Failed to cancel appointment")
    
    # Send cancellation notifications
    try:
        await notification_integration.send_appointment_cancellation(db, appointment_with_relations)
    except Exception as e:
        # Log error but don't fail the cancellation
        print(f"Failed to send cancellation notifications: {str(e)}")
    
    return {"message": "Appointment cancelled successfully"}


@router.get("/parent/{parent_id}/appointments", response_model=ParentAppointmentsResponse)
async def get_parent_appointments(
    parent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentAppointmentsResponse:
    """Get all appointments for a specific parent."""
    
    # Check authorization
    if current_user.role == "parent":
        db_parent = parent.get_by_user_id(db, user_id=current_user.id)
        if not db_parent or db_parent.id != parent_id:
            raise HTTPException(status_code=403, detail="Not authorized to view these appointments")
    
    # Get all appointments for the parent
    appointments_list = appointment.get_by_parent(db, parent_id=parent_id)
    
    # Calculate summary
    summary = AppointmentSummary(
        total_appointments=len(appointments_list),
        pending_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.PENDING]),
        confirmed_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.CONFIRMED]),
        completed_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.COMPLETED]),
        cancelled_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.CANCELLED]),
        no_show_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.NO_SHOW]),
    )
    
    return ParentAppointmentsResponse(
        parent_id=parent_id,
        appointments=appointments_list,
        summary=summary
    )


@router.get("/teacher/{teacher_id}/appointments", response_model=TeacherScheduleResponse)
async def get_teacher_appointments(
    teacher_id: str,
    start_date: Optional[date] = Query(None, description="Filter from start date"),
    end_date: Optional[date] = Query(None, description="Filter to end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeacherScheduleResponse:
    """Get all appointments for a specific teacher."""
    
    # Check authorization
    if current_user.role == "teacher":
        db_teacher = teacher.get_by_user_id(db, user_id=current_user.id)
        if not db_teacher or db_teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized to view these appointments")
    
    # Get appointments
    if start_date and end_date:
        appointments_list = appointment.get_by_date_range(
            db, start_date=start_date, end_date=end_date, teacher_id=teacher_id
        )
    else:
        appointments_list = appointment.get_by_teacher(db, teacher_id=teacher_id)
    
    # Calculate summary
    summary = AppointmentSummary(
        total_appointments=len(appointments_list),
        pending_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.PENDING]),
        confirmed_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.CONFIRMED]),
        completed_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.COMPLETED]),
        cancelled_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.CANCELLED]),
        no_show_appointments=len([a for a in appointments_list if a.status == AppointmentStatus.NO_SHOW]),
    )
    
    return TeacherScheduleResponse(
        teacher_id=teacher_id,
        date_range={"start": start_date, "end": end_date} if start_date and end_date else {},
        appointments=appointments_list,
        summary=summary
    )