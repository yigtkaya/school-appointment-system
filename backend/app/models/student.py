from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Student(Base):
    """Student model."""
    
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    
    # Relationships
    class_ = relationship("Class", backref="students")
    
    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, class_id={self.class_id})>"
