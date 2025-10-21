from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from app.db.database import Base
from app.core.dependencies import UserRole

class User(Base):
    """User model for teachers and admins."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    branch = Column(String, nullable=True)  # e.g., "Primary", "Secondary"
    role = Column(Enum(UserRole), default=UserRole.TEACHER, nullable=False)
    require_approval = Column(Integer, default=False)  # Boolean as integer
    created_at = Column(DateTime, default=datetime.now(datetime.timezone.utc), nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
