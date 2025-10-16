"""Application constants."""

# User roles
class UserRole:
    """User role constants."""
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    
    ALL = [ADMIN, TEACHER, PARENT]


# Meeting modes
class MeetingMode:
    """Meeting mode constants."""
    ONLINE = "online"
    FACE_TO_FACE = "face_to_face"
    
    ALL = [ONLINE, FACE_TO_FACE]


# Appointment status
class AppointmentStatus:
    """Appointment status constants."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"
    
    ALL = [PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
