"""Database models."""

from app.models.user import User
from app.models.teacher import Teacher
from app.models.parent import Parent
from app.models.slot import AvailableSlot
from app.models.appointment import Appointment

__all__ = [
    "User",
    "Teacher",
    "Parent",
    "AvailableSlot",
    "Appointment",
]
