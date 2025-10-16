"""Application constants."""

from enum import Enum


class UserRole(str, Enum):
    """User role enum."""
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"


class MeetingMode(str, Enum):
    """Meeting mode enum."""
    ONLINE = "online"
    FACE_TO_FACE = "face_to_face"


class AppointmentStatus(str, Enum):
    """Appointment status enum."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"
