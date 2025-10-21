from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base


class TeacherClass(Base):
    """Association table for Teacher-Class relationship."""
    
    __tablename__ = "teacher_classes"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    
    # Unique constraint to prevent duplicates
    __table_args__ = (UniqueConstraint("teacher_id", "class_id"),)
    
    # Relationships
    teacher = relationship("User", backref="teacher_classes")
    class_ = relationship("Class", backref="teacher_classes")
    
    def __repr__(self):
        return f"<TeacherClass(teacher_id={self.teacher_id}, class_id={self.class_id})>"
