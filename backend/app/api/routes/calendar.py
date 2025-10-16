"""Calendar routes for enhanced scheduling features."""

import io
from datetime import date, datetime, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.slot import slot
from app.crud.teacher import teacher
from app.crud.appointment import appointment
from app.middleware.dependencies import get_current_user, get_admin_user, get_teacher_or_admin
from app.models.user import User
from app.services.calendar import calendar_service
from app.schemas.slot import (
    DailyScheduleResponse,
    MonthlyCalendarResponse,
    CalendarExportResponse,
    TimeSlotSuggestion,
    EnhancedWeeklyScheduleResponse,
    AdvancedBulkSlotCreate,
    SlotWithTeacher,
    SlotCreate,
)
from app.exceptions.http import ResourceNotFoundException, BadRequestException

router = APIRouter()


@router.get("/daily/{target_date}", response_model=DailyScheduleResponse)
async def get_daily_schedule(
    target_date: date,
    teacher_id: Optional[str] = Query(None, description="Filter by teacher ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DailyScheduleResponse:
    """Get daily schedule with slots and appointments."""
    
    # If teacher_id is provided, validate it exists
    if teacher_id:
        db_teacher = teacher.get(db, id=teacher_id)
        if not db_teacher:
            raise ResourceNotFoundException("Teacher not found")
        
        # Check authorization for teacher-specific view
        if (current_user.role == "teacher" and 
            db_teacher.user_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to view this teacher's schedule")
    
    # Get day of week (0=Monday)
    day_of_week = target_date.weekday()
    week_start = calendar_service.get_week_start(target_date)
    
    # Get slots for the day
    if teacher_id:
        day_slots = slot.get_by_week(db, week_start=week_start, teacher_id=teacher_id)
    else:
        day_slots = slot.get_by_week(db, week_start=week_start)
    
    # Filter slots for this specific day
    day_slots = [s for s in day_slots if s.day_of_week == day_of_week]
    
    # Get appointments for the day
    day_appointments = []
    if teacher_id:
        teacher_appointments = appointment.get_by_teacher(db, teacher_id=teacher_id)
        day_appointments = [
            appt for appt in teacher_appointments
            if appt.slot.day_of_week == day_of_week and appt.slot.week_start_date == week_start
        ]
    
    # Format appointments
    formatted_appointments = []
    for appt in day_appointments:
        formatted_appointments.append({
            "id": appt.id,
            "start_time": calendar_service.format_time_12h(appt.slot.start_time),
            "end_time": calendar_service.format_time_12h(appt.slot.end_time),
            "status": appt.status,
            "parent_name": appt.parent.user.full_name if appt.parent else "Unknown",
            "student_name": appt.parent.student_name if appt.parent else "Unknown",
            "notes": appt.notes
        })
    
    # Count slots
    available_count = sum(1 for s in day_slots if not s.is_booked)
    booked_count = len(day_slots) - available_count
    
    # Get time suggestions if teacher specified
    suggested_times = []
    if teacher_id:
        suggested_times = calendar_service.get_available_time_suggestions(
            day_slots, target_date
        )
    
    return DailyScheduleResponse(
        date=target_date,
        day_name=calendar_service.get_day_name(day_of_week),
        day_of_week=day_of_week,
        slots=day_slots,
        appointments=formatted_appointments,
        total_slots=len(day_slots),
        available_slots=available_count,
        booked_slots=booked_count,
        suggested_times=suggested_times
    )


@router.get("/monthly/{year}/{month}", response_model=MonthlyCalendarResponse)
async def get_monthly_calendar(
    year: int,
    month: int,
    teacher_id: Optional[str] = Query(None, description="Filter by teacher ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MonthlyCalendarResponse:
    """Get monthly calendar view with slots and appointments."""
    
    # Validate month and year
    if not (1 <= month <= 12):
        raise BadRequestException("Month must be between 1 and 12")
    if not (2020 <= year <= 2030):
        raise BadRequestException("Year must be between 2020 and 2030")
    
    # If teacher_id is provided, validate it exists
    if teacher_id:
        db_teacher = teacher.get(db, id=teacher_id)
        if not db_teacher:
            raise ResourceNotFoundException("Teacher not found")
        
        # Check authorization
        if (current_user.role == "teacher" and 
            db_teacher.user_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to view this teacher's schedule")
    
    # Get all dates for the calendar month view
    calendar_dates = calendar_service.get_calendar_month_dates(year, month)
    
    # Get all slots for the month
    month_start = calendar_service.get_month_start(year, month)
    month_end = calendar_service.get_month_end(year, month)
    
    # Get slots for all weeks that intersect with the month
    all_slots = []
    all_appointments = []
    
    current_week_start = calendar_service.get_week_start(month_start)
    last_week_start = calendar_service.get_week_start(month_end)
    
    while current_week_start <= last_week_start:
        if teacher_id:
            week_slots = slot.get_by_week(db, week_start=current_week_start, teacher_id=teacher_id)
            week_appointments = appointment.get_by_teacher(db, teacher_id=teacher_id)
            week_appointments = [
                appt for appt in week_appointments 
                if appt.slot.week_start_date == current_week_start
            ]
        else:
            week_slots = slot.get_by_week(db, week_start=current_week_start)
            week_appointments = []
        
        all_slots.extend(week_slots)
        all_appointments.extend(week_appointments)
        current_week_start += timedelta(days=7)
    
    # Build calendar weeks
    weeks = []
    current_date = calendar_dates[0]
    
    while current_date <= calendar_dates[-1]:
        week_start = current_date
        week_days = []
        
        for i in range(7):  # 7 days in a week
            day_date = current_date + timedelta(days=i)
            day_of_week = day_date.weekday()
            
            # Get slots and appointments for this day
            day_slots = calendar_service.get_time_slots_for_day(all_slots, day_date, day_of_week)
            day_appointments = calendar_service.get_appointments_for_day(all_appointments, day_date, day_of_week)
            
            week_days.append({
                "date": day_date.isoformat(),
                "day_of_week": day_of_week,
                "day_name": calendar_service.get_day_abbreviation(day_of_week),
                "is_current_month": day_date.month == month,
                "slots_count": len(day_slots),
                "appointments_count": len(day_appointments),
                "available_slots": len([s for s in day_slots if not s["is_booked"]]),
                "slots": day_slots[:3],  # Show first 3 slots
                "appointments": day_appointments[:3]  # Show first 3 appointments
            })
        
        weeks.append({
            "week_start": week_start.isoformat(),
            "days": week_days
        })
        
        current_date += timedelta(days=7)
    
    return MonthlyCalendarResponse(
        year=year,
        month=month,
        month_name=calendar_service.get_month_name(month),
        weeks=weeks,
        total_slots=len(all_slots),
        total_appointments=len(all_appointments),
        teacher_id=teacher_id
    )


@router.get("/export/ical")
async def export_calendar_ical(
    teacher_id: Optional[str] = Query(None, description="Filter by teacher ID"),
    start_date: Optional[date] = Query(None, description="Start date for export"),
    end_date: Optional[date] = Query(None, description="End date for export"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export calendar as iCal file."""
    
    # Default date range: current month
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)
    
    # Get appointments for the date range
    if teacher_id:
        db_teacher = teacher.get(db, id=teacher_id)
        if not db_teacher:
            raise ResourceNotFoundException("Teacher not found")
        
        # Check authorization
        if (current_user.role == "teacher" and 
            db_teacher.user_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to export this teacher's calendar")
        
        appointments_list = appointment.get_by_teacher(db, teacher_id=teacher_id)
        calendar_title = f"Appointments - {db_teacher.user.full_name}"
    else:
        # Admin can export all appointments
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to export all appointments")
        
        appointments_list = appointment.get_all_with_relations(db)
        calendar_title = "School Appointments"
    
    # Filter appointments by date range
    filtered_appointments = []
    for appt in appointments_list:
        if appt.slot and appt.slot.week_start_date:
            appt_date = appt.slot.week_start_date + timedelta(days=appt.slot.day_of_week)
            if start_date <= appt_date <= end_date:
                filtered_appointments.append(appt)
    
    # Generate iCal content
    ical_content = calendar_service.create_ical_content(filtered_appointments, calendar_title)
    
    # Create filename
    filename = f"calendar_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.ics"
    
    # Return as downloadable file
    return StreamingResponse(
        io.StringIO(ical_content),
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/suggestions/{target_date}", response_model=TimeSlotSuggestion)
async def get_time_slot_suggestions(
    target_date: date,
    teacher_id: str = Query(..., description="Teacher ID"),
    duration_minutes: int = Query(30, ge=15, le=180, description="Preferred slot duration in minutes"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> TimeSlotSuggestion:
    """Get suggested available time slots for a teacher on a specific day."""
    
    # Validate teacher exists
    db_teacher = teacher.get(db, id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check authorization
    if (current_user.role == "teacher" and 
        db_teacher.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to get suggestions for this teacher")
    
    # Get existing slots for the day
    day_of_week = target_date.weekday()
    week_start = calendar_service.get_week_start(target_date)
    
    existing_slots = slot.get_by_week(db, week_start=week_start, teacher_id=teacher_id)
    day_slots = [s for s in existing_slots if s.day_of_week == day_of_week]
    
    # Get suggestions
    suggestions = calendar_service.get_available_time_suggestions(
        day_slots, target_date, duration_minutes
    )
    
    return TimeSlotSuggestion(
        date=target_date,
        suggestions=suggestions,
        existing_slots_count=len(day_slots),
        conflicts_checked=len(day_slots)
    )


@router.get("/enhanced-weekly/{teacher_id}", response_model=EnhancedWeeklyScheduleResponse)
async def get_enhanced_weekly_schedule(
    teacher_id: str,
    week_start: date = Query(..., description="Start date of the week (Monday)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EnhancedWeeklyScheduleResponse:
    """Get enhanced weekly schedule with detailed information."""
    
    # Validate teacher exists
    db_teacher = teacher.get(db, id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check authorization
    if (current_user.role == "teacher" and 
        db_teacher.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this teacher's schedule")
    
    # Validate week_start is Monday
    if week_start.weekday() != 0:
        raise BadRequestException("Week start must be a Monday")
    
    # Get week end
    week_end = week_start + timedelta(days=6)
    
    # Get all slots for the week
    week_slots = slot.get_by_week(db, week_start=week_start, teacher_id=teacher_id)
    
    # Get all appointments for the week
    teacher_appointments = appointment.get_by_teacher(db, teacher_id=teacher_id)
    week_appointments = [
        appt for appt in teacher_appointments
        if appt.slot.week_start_date == week_start
    ]
    
    # Build daily schedules
    days = []
    earliest_time = None
    latest_time = None
    
    for i in range(7):  # 7 days
        day_date = week_start + timedelta(days=i)
        day_slots = [s for s in week_slots if s.day_of_week == i]
        day_appointments = [a for a in week_appointments if a.slot.day_of_week == i]
        
        # Update time range
        for s in day_slots:
            if earliest_time is None or s.start_time < earliest_time:
                earliest_time = s.start_time
            if latest_time is None or s.end_time > latest_time:
                latest_time = s.end_time
        
        # Format appointments
        formatted_appointments = []
        for appt in day_appointments:
            formatted_appointments.append({
                "id": appt.id,
                "start_time": calendar_service.format_time_12h(appt.slot.start_time),
                "end_time": calendar_service.format_time_12h(appt.slot.end_time),
                "status": appt.status,
                "parent_name": appt.parent.user.full_name if appt.parent else "Unknown",
                "student_name": appt.parent.student_name if appt.parent else "Unknown"
            })
        
        days.append({
            "date": day_date.isoformat(),
            "day_name": calendar_service.get_day_name(i),
            "day_of_week": i,
            "slots": day_slots,
            "appointments": formatted_appointments,
            "total_slots": len(day_slots),
            "available_slots": len([s for s in day_slots if not s.is_booked]),
            "booked_slots": len([s for s in day_slots if s.is_booked])
        })
    
    # Calculate summary
    total_slots = len(week_slots)
    available_slots = len([s for s in week_slots if not s.is_booked])
    booked_slots = total_slots - available_slots
    
    summary = {
        "total_slots": total_slots,
        "available_slots": available_slots,
        "booked_slots": booked_slots,
        "total_appointments": len(week_appointments),
        "utilization_rate": round((booked_slots / total_slots * 100) if total_slots > 0 else 0, 1)
    }
    
    time_range = {
        "earliest_time": calendar_service.format_time_12h(earliest_time) if earliest_time else None,
        "latest_time": calendar_service.format_time_12h(latest_time) if latest_time else None,
        "earliest_time_24h": calendar_service.format_time_24h(earliest_time) if earliest_time else None,
        "latest_time_24h": calendar_service.format_time_24h(latest_time) if latest_time else None
    }
    
    return EnhancedWeeklyScheduleResponse(
        teacher_id=teacher_id,
        teacher_name=db_teacher.user.full_name,
        week_start_date=week_start,
        week_end_date=week_end,
        days=days,
        summary=summary,
        time_range=time_range
    )


@router.post("/bulk-advanced", response_model=List[SlotWithTeacher])
async def create_advanced_bulk_slots(
    bulk_pattern: AdvancedBulkSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> List[SlotWithTeacher]:
    """Create multiple slots using advanced patterns."""
    
    # Validate teacher exists
    db_teacher = teacher.get(db, id=bulk_pattern.teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check authorization
    if (current_user.role != "admin" and 
        db_teacher.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to create slots for this teacher")
    
    pattern = bulk_pattern.slot_pattern
    created_slots = []
    
    # Parse pattern
    days = pattern.get("days", [])
    start_time_str = pattern.get("start_time", "09:00")
    end_time_str = pattern.get("end_time", "17:00")
    slot_duration = pattern.get("slot_duration_minutes", 30)
    break_duration = pattern.get("break_duration_minutes", 15)
    lunch_break = pattern.get("lunch_break", {})
    exclude_times = pattern.get("exclude_times", [])
    
    # Parse times
    day_start = datetime.strptime(start_time_str, "%H:%M").time()
    day_end = datetime.strptime(end_time_str, "%H:%M").time()
    
    lunch_start = None
    lunch_end = None
    if lunch_break:
        lunch_start = datetime.strptime(lunch_break["start"], "%H:%M").time()
        lunch_end = datetime.strptime(lunch_break["end"], "%H:%M").time()
    
    # Generate slots for each day
    for day_of_week in days:
        if not (0 <= day_of_week <= 6):
            continue
            
        current_time = day_start
        
        while current_time < day_end:
            # Calculate slot end time
            slot_end_time = (
                datetime.combine(date.min, current_time) + 
                timedelta(minutes=slot_duration)
            ).time()
            
            if slot_end_time > day_end:
                break
            
            # Check if this slot conflicts with lunch break
            skip_slot = False
            if lunch_start and lunch_end:
                if (current_time < lunch_end and slot_end_time > lunch_start):
                    skip_slot = True
            
            # Check exclude times
            for exclude in exclude_times:
                exclude_start = datetime.strptime(exclude["start"], "%H:%M").time()
                exclude_end = datetime.strptime(exclude["end"], "%H:%M").time()
                if (current_time < exclude_end and slot_end_time > exclude_start):
                    skip_slot = True
                    break
            
            if not skip_slot:
                # Check for existing slot conflicts
                if not slot.check_time_conflict(
                    db,
                    teacher_id=bulk_pattern.teacher_id,
                    day_of_week=day_of_week,
                    start_time=current_time,
                    end_time=slot_end_time,
                    week_start=bulk_pattern.week_start_date
                ):
                    # Create the slot
                    slot_create = SlotCreate(
                        teacher_id=bulk_pattern.teacher_id,
                        day_of_week=day_of_week,
                        start_time=current_time,
                        end_time=slot_end_time,
                        week_start_date=bulk_pattern.week_start_date
                    )
                    
                    db_slot = slot.create(db, obj_in=slot_create)
                    created_slots.append(slot.get_with_teacher(db, slot_id=db_slot.id))
            
            # Move to next slot time (including break)
            current_time = (
                datetime.combine(date.min, slot_end_time) + 
                timedelta(minutes=break_duration)
            ).time()
    
    return created_slots