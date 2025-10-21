"""User CRUD operations."""

import uuid
from typing import Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations for User model."""
    
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    def get_by_full_name(self, db: Session, full_name: str) -> Optional[User]:
        """Get user by full name."""
        return db.query(User).filter(User.full_name == full_name).first()
    
    def get_by_email_or_name(self, db: Session, identifier: str) -> Optional[User]:
        """Get user by email or full name."""
        # First try email
        user = self.get_by_email(db, identifier)
        if user:
            return user
        # If not found, try full name
        return self.get_by_full_name(db, identifier)
    
    def create_with_hashed_password(self, db: Session, user_in: UserCreate) -> User:
        """Create user with hashed password."""
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_in.email,
            full_name=user_in.full_name,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user


crud_user = CRUDUser(User)
