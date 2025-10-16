"""Calendar service for date/time utilities and calendar operations."""

import calendar
from datetime import date, datetime, time, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from app.models.slot import AvailableSlot
from app.models.appointment import Appointment


@dataclass
class CalendarDay:
    """Represents a single day in a calendar view."""
    date: date
    day_of_week: int  # 0=Monday, 6=Sunday
    is_current_month: bool
    slots: List[Dict[str, Any]]
    appointments: List[Dict[str, Any]]


@dataclass
class CalendarWeek:
    """Represents a week in calendar view."""
    week_start: date
    week_end: date
    days: List[CalendarDay]
    total_slots: int
    total_appointments: int


@dataclass
class CalendarMonth:
    """Represents a month in calendar view."""
    year: int
    month: int
    month_name: str
    weeks: List[CalendarWeek]
    total_slots: int
    total_appointments: int


class CalendarService:
    """Service for calendar operations and date utilities."""
    
    @staticmethod
    def get_week_start(target_date: date) -> date:
        """Get the Monday of the week containing the target date."""
        days_since_monday = target_date.weekday()
        return target_date - timedelta(days=days_since_monday)
    
    @staticmethod
    def get_week_end(target_date: date) -> date:
        """Get the Sunday of the week containing the target date."""
        days_since_monday = target_date.weekday()
        return target_date + timedelta(days=6 - days_since_monday)
    
    @staticmethod
    def get_month_start(year: int, month: int) -> date:
        """Get the first day of the month."""
        return date(year, month, 1)
    
    @staticmethod
    def get_month_end(year: int, month: int) -> date:
        """Get the last day of the month."""
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1
        return date(next_year, next_month, 1) - timedelta(days=1)
    
    @staticmethod
    def get_calendar_month_dates(year: int, month: int) -> List[date]:
        """Get all dates for a calendar month view (including prev/next month padding)."""
        month_start = CalendarService.get_month_start(year, month)
        month_end = CalendarService.get_month_end(year, month)
        
        # Get first Monday of calendar view
        calendar_start = CalendarService.get_week_start(month_start)
        
        # Get last Sunday of calendar view
        calendar_end = CalendarService.get_week_end(month_end)
        
        dates = []
        current_date = calendar_start
        while current_date <= calendar_end:
            dates.append(current_date)
            current_date += timedelta(days=1)
        
        return dates
    
    @staticmethod
    def get_week_dates(week_start: date) -> List[date]:
        """Get all 7 dates in a week starting from Monday."""
        return [week_start + timedelta(days=i) for i in range(7)]
    
    @staticmethod
    def format_time_12h(time_obj: time) -> str:
        """Format time in 12-hour format."""
        return time_obj.strftime("%I:%M %p").lstrip("0")
    
    @staticmethod
    def format_time_24h(time_obj: time) -> str:
        """Format time in 24-hour format."""
        return time_obj.strftime("%H:%M")
    
    @staticmethod
    def format_date_display(date_obj: date) -> str:
        """Format date for display."""
        return date_obj.strftime("%A, %B %d, %Y")
    
    @staticmethod
    def format_date_short(date_obj: date) -> str:
        """Format date in short format."""
        return date_obj.strftime("%m/%d/%Y")
    
    @staticmethod
    def get_day_name(day_of_week: int) -> str:
        """Get day name from day of week number (0=Monday)."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return days[day_of_week]
    
    @staticmethod
    def get_day_abbreviation(day_of_week: int) -> str:
        """Get day abbreviation from day of week number (0=Monday)."""
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return days[day_of_week]
    
    @staticmethod
    def get_month_name(month: int) -> str:
        """Get month name from month number."""
        return calendar.month_name[month]
    
    @staticmethod
    def get_next_occurrence(target_day: int, from_date: date) -> date:
        """Get the next occurrence of a target day of week from a given date."""
        days_ahead = target_day - from_date.weekday()
        if days_ahead < 0:  # Target day already happened this week
            days_ahead += 7
        elif days_ahead == 0 and from_date == from_date:  # Same day
            days_ahead = 7
        return from_date + timedelta(days=days_ahead)
    
    @staticmethod
    def get_time_slots_for_day(
        slots: List[AvailableSlot], 
        target_date: date, 
        target_day: int
    ) -> List[Dict[str, Any]]:
        """Get formatted time slots for a specific day."""
        day_slots = []
        
        for slot in slots:
            if slot.day_of_week == target_day:
                # Calculate the actual date for this slot occurrence
                week_start = CalendarService.get_week_start(target_date)
                slot_date = week_start + timedelta(days=slot.day_of_week)
                
                # Only include if the slot is for the target week
                if (slot.week_start_date <= slot_date <= 
                    slot.week_start_date + timedelta(days=6)):
                    
                    day_slots.append({
                        "id": slot.id,
                        "start_time": CalendarService.format_time_12h(slot.start_time),
                        "end_time": CalendarService.format_time_12h(slot.end_time),
                        "start_time_24h": CalendarService.format_time_24h(slot.start_time),
                        "end_time_24h": CalendarService.format_time_24h(slot.end_time),
                        "is_booked": slot.is_booked,
                        "teacher_id": slot.teacher_id,
                        "teacher_name": getattr(slot.teacher, 'user', {}).get('full_name', 'Unknown') if hasattr(slot, 'teacher') else 'Unknown'
                    })
        
        # Sort by start time
        day_slots.sort(key=lambda x: x["start_time_24h"])
        return day_slots
    
    @staticmethod
    def get_appointments_for_day(
        appointments: List[Appointment], 
        target_date: date, 
        target_day: int
    ) -> List[Dict[str, Any]]:
        """Get formatted appointments for a specific day."""
        day_appointments = []
        
        for appointment in appointments:
            if appointment.slot.day_of_week == target_day:
                # Calculate the actual date for this appointment
                week_start = CalendarService.get_week_start(target_date)
                appointment_date = week_start + timedelta(days=appointment.slot.day_of_week)
                
                # Only include if the appointment is for the target week
                if (appointment.slot.week_start_date <= appointment_date <= 
                    appointment.slot.week_start_date + timedelta(days=6)):
                    
                    day_appointments.append({
                        "id": appointment.id,
                        "start_time": CalendarService.format_time_12h(appointment.slot.start_time),
                        "end_time": CalendarService.format_time_12h(appointment.slot.end_time),
                        "start_time_24h": CalendarService.format_time_24h(appointment.slot.start_time),
                        "end_time_24h": CalendarService.format_time_24h(appointment.slot.end_time),
                        "status": appointment.status,
                        "parent_name": getattr(appointment.parent, 'user', {}).get('full_name', 'Unknown') if hasattr(appointment, 'parent') else 'Unknown',
                        "student_name": getattr(appointment.parent, 'student_name', 'Unknown') if hasattr(appointment, 'parent') else 'Unknown',
                        "teacher_name": getattr(appointment.teacher, 'user', {}).get('full_name', 'Unknown') if hasattr(appointment, 'teacher') else 'Unknown',
                        "notes": appointment.notes
                    })
        
        # Sort by start time
        day_appointments.sort(key=lambda x: x["start_time_24h"])
        return day_appointments
    
    @staticmethod
    def create_ical_content(
        appointments: List[Appointment], 
        title: str = "School Appointments"
    ) -> str:
        """Create iCal content for appointments."""
        lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//School Appointment System//EN",
            f"X-WR-CALNAME:{title}",
            "X-WR-TIMEZONE:UTC",
        ]
        
        for appointment in appointments:
            if appointment.slot and appointment.slot.week_start_date:
                # Calculate the actual appointment date
                appointment_date = (
                    appointment.slot.week_start_date + 
                    timedelta(days=appointment.slot.day_of_week)
                )
                
                # Create datetime objects
                start_datetime = datetime.combine(appointment_date, appointment.slot.start_time)
                end_datetime = datetime.combine(appointment_date, appointment.slot.end_time)
                
                # Format for iCal (UTC format)
                start_str = start_datetime.strftime("%Y%m%dT%H%M%SZ")
                end_str = end_datetime.strftime("%Y%m%dT%H%M%SZ")
                
                # Event details
                summary = f"Appointment with {appointment.teacher.user.full_name}" if hasattr(appointment, 'teacher') else "School Appointment"
                description = f"Student: {appointment.parent.student_name}\\nStatus: {appointment.status}"
                if appointment.notes:
                    description += f"\\nNotes: {appointment.notes}"
                
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{appointment.id}@school-appointment-system.com",
                    f"DTSTART:{start_str}",
                    f"DTEND:{end_str}",
                    f"SUMMARY:{summary}",
                    f"DESCRIPTION:{description}",
                    f"STATUS:{appointment.status.upper()}",
                    "END:VEVENT"
                ])
        
        lines.append("END:VCALENDAR")
        return "\r\n".join(lines)
    
    @staticmethod
    def get_available_time_suggestions(
        existing_slots: List[AvailableSlot],
        target_date: date,
        preferred_duration_minutes: int = 30,
        start_hour: int = 8,
        end_hour: int = 17
    ) -> List[Dict[str, Any]]:
        """Get suggested available time slots for a given day."""
        target_day = target_date.weekday()
        week_start = CalendarService.get_week_start(target_date)
        
        # Filter slots for the target day and week
        day_slots = [
            slot for slot in existing_slots
            if (slot.day_of_week == target_day and 
                slot.week_start_date == week_start)
        ]
        
        # Sort slots by start time
        day_slots.sort(key=lambda x: x.start_time)
        
        # Generate suggestions
        suggestions = []
        current_time = time(start_hour, 0)
        end_time = time(end_hour, 0)
        duration_delta = timedelta(minutes=preferred_duration_minutes)
        
        while current_time < end_time:
            slot_end_time = (datetime.combine(date.min, current_time) + duration_delta).time()
            
            if slot_end_time > end_time:
                break
            
            # Check if this time conflicts with existing slots
            conflicts = False
            for existing_slot in day_slots:
                if (current_time < existing_slot.end_time and 
                    slot_end_time > existing_slot.start_time):
                    conflicts = True
                    break
            
            if not conflicts:
                suggestions.append({
                    "start_time": CalendarService.format_time_12h(current_time),
                    "end_time": CalendarService.format_time_12h(slot_end_time),
                    "start_time_24h": CalendarService.format_time_24h(current_time),
                    "end_time_24h": CalendarService.format_time_24h(slot_end_time),
                    "duration_minutes": preferred_duration_minutes
                })
            
            # Move to next 15-minute interval
            current_time = (datetime.combine(date.min, current_time) + timedelta(minutes=15)).time()
        
        return suggestions


# Global calendar service instance
calendar_service = CalendarService()