"""Parent CRUD operations."""

import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.crud.base import CRUDBase
from app.models.parent import Parent
from app.schemas.parent import ParentCreate, ParentUpdate


class CRUDParent(CRUDBase[Parent, ParentCreate, ParentUpdate]):
    """CRUD operations for Parent model."""
    
    def create(self, db: Session, obj_in: ParentCreate) -> Parent:
        """Create a new parent."""
        parent_data = obj_in.model_dump()
        parent_data["id"] = str(uuid.uuid4())
        
        db_obj = self.model(**parent_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[Parent]:
        """Get parent by user ID."""
        return db.query(self.model).filter(self.model.user_id == user_id).first()
    
    def get_with_user(self, db: Session, parent_id: str) -> Optional[Parent]:
        """Get parent with user information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.id == parent_id)
            .first()
        )
    
    def get_all_with_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[Parent]:
        """Get all parents with user information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_student_name(self, db: Session, student_name: str, skip: int = 0, limit: int = 100) -> List[Parent]:
        """Get parents by student name."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.student_name.ilike(f"%{student_name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_student_class(self, db: Session, student_class: str, skip: int = 0, limit: int = 100) -> List[Parent]:
        """Get parents by student class."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.student_class.ilike(f"%{student_class}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )


parent = CRUDParent(Parent)