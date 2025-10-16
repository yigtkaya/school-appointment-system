"""Teacher CRUD operations."""

import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.crud.base import CRUDBase
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate


class CRUDTeacher(CRUDBase[Teacher, TeacherCreate, TeacherUpdate]):
    """CRUD operations for Teacher model."""
    
    def create(self, db: Session, obj_in: TeacherCreate) -> Teacher:
        """Create a new teacher."""
        teacher_data = obj_in.model_dump()
        teacher_data["id"] = str(uuid.uuid4())
        
        db_obj = self.model(**teacher_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[Teacher]:
        """Get teacher by user ID."""
        return db.query(self.model).filter(self.model.user_id == user_id).first()
    
    def get_with_user(self, db: Session, teacher_id: str) -> Optional[Teacher]:
        """Get teacher with user information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.id == teacher_id)
            .first()
        )
    
    def get_all_with_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
        """Get all teachers with user information."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_subject(self, db: Session, subject: str, skip: int = 0, limit: int = 100) -> List[Teacher]:
        """Get teachers by subject."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.subject.ilike(f"%{subject}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_branch(self, db: Session, branch: str, skip: int = 0, limit: int = 100) -> List[Teacher]:
        """Get teachers by branch."""
        return (
            db.query(self.model)
            .options(joinedload(self.model.user))
            .filter(self.model.branch.ilike(f"%{branch}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )


teacher = CRUDTeacher(Teacher)