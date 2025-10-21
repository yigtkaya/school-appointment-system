from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Class(Base):
    """Class model representing a school class."""
    
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(Integer, nullable=False)  # 1-12
    section = Column(String, nullable=False)  # A-D
    
    def __repr__(self):
        return f"<Class(id={self.id}, grade={self.grade}, section={self.section})>"
