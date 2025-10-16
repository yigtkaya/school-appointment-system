"""Teacher routes for the API."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.teacher import teacher
from app.middleware.dependencies import get_current_user, get_admin_user, get_teacher_or_admin
from app.models.user import User
from app.schemas.teacher import (
    TeacherCreate,
    TeacherUpdate,
    TeacherResponse,
    TeacherWithUser,
    TeacherListResponse,
)
from app.exceptions.http import ResourceNotFoundException, ConflictException

router = APIRouter()


@router.get("/", response_model=TeacherListResponse)
async def get_teachers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    branch: Optional[str] = Query(None, description="Filter by branch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeacherListResponse:
    """Get all teachers with optional filters."""
    
    if subject:
        teachers_list = teacher.get_by_subject(db, subject=subject, skip=skip, limit=limit)
    elif branch:
        teachers_list = teacher.get_by_branch(db, branch=branch, skip=skip, limit=limit)
    else:
        teachers_list = teacher.get_all_with_users(db, skip=skip, limit=limit)
    
    total = len(teachers_list)  # TODO: Implement proper count query
    
    return TeacherListResponse(
        teachers=teachers_list,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=TeacherWithUser)
async def create_teacher(
    teacher_in: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> TeacherWithUser:
    """Create a new teacher profile (admin only)."""
    
    # Check if teacher profile already exists for this user
    existing_teacher = teacher.get_by_user_id(db, user_id=teacher_in.user_id)
    if existing_teacher:
        raise ConflictException("Teacher profile already exists for this user")
    
    # Create the teacher
    db_teacher = teacher.create(db, obj_in=teacher_in)
    
    # Return teacher with user information
    return teacher.get_with_user(db, teacher_id=db_teacher.id)


@router.get("/{teacher_id}", response_model=TeacherWithUser)
async def get_teacher(
    teacher_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeacherWithUser:
    """Get a specific teacher by ID."""
    
    db_teacher = teacher.get_with_user(db, teacher_id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    return db_teacher


@router.put("/{teacher_id}", response_model=TeacherWithUser)
async def update_teacher(
    teacher_id: str,
    teacher_update: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin),
) -> TeacherWithUser:
    """Update a teacher profile."""
    
    # Get existing teacher
    db_teacher = teacher.get(db, id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Check if current user is the teacher or an admin
    if current_user.role != "admin" and db_teacher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this teacher profile")
    
    # Update the teacher
    updated_teacher = teacher.update(db, db_obj=db_teacher, obj_in=teacher_update)
    
    # Return updated teacher with user information
    return teacher.get_with_user(db, teacher_id=updated_teacher.id)


@router.delete("/{teacher_id}")
async def delete_teacher(
    teacher_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Delete a teacher profile (admin only)."""
    
    # Check if teacher exists
    db_teacher = teacher.get(db, id=teacher_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher not found")
    
    # Delete the teacher
    success = teacher.delete(db, id=teacher_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete teacher")
    
    return {"message": "Teacher deleted successfully"}


@router.get("/user/{user_id}", response_model=TeacherWithUser)
async def get_teacher_by_user_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeacherWithUser:
    """Get teacher profile by user ID."""
    
    db_teacher = teacher.get_by_user_id(db, user_id=user_id)
    if not db_teacher:
        raise ResourceNotFoundException("Teacher profile not found for this user")
    
    return teacher.get_with_user(db, teacher_id=db_teacher.id)