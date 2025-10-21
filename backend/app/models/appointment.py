from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base
from sqlalchemy.orm import relationship


class Appointment(Base):
    """Appointment model for teacher-parent meetings."""
    
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    appointment_start = Column(DateTime, nullable=False)
    appointment_end = Column(DateTime, nullable=False)
    parent_name = Column(String, nullable=False)
    parent_email = Column(String, nullable=False)
    parent_phone = Column(String, nullable=True)
    note = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, confirmed, cancelled, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    teacher = relationship("User", backref="appointments")
    class_ = relationship("Class", backref="appointments")
    student = relationship("Student", backref="appointments")
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, teacher_id={self.teacher_id}, status={self.status})>"
