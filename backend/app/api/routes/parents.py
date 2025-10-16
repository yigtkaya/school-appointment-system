"""Parent routes for the API."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.parent import parent
from app.middleware.dependencies import get_current_user, get_admin_user, get_parent_user
from app.models.user import User
from app.schemas.parent import (
    ParentCreate,
    ParentUpdate,
    ParentResponse,
    ParentWithUser,
    ParentListResponse,
)
from app.exceptions.http import ResourceNotFoundException, ConflictException

router = APIRouter()


@router.get("/", response_model=ParentListResponse)
async def get_parents(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    student_name: Optional[str] = Query(None, description="Filter by student name"),
    student_class: Optional[str] = Query(None, description="Filter by student class"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentListResponse:
    """Get all parents with optional filters."""
    
    # Only admins and teachers can view all parents
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view all parents")
    
    if student_name:
        parents_list = parent.get_by_student_name(db, student_name=student_name, skip=skip, limit=limit)
    elif student_class:
        parents_list = parent.get_by_student_class(db, student_class=student_class, skip=skip, limit=limit)
    else:
        parents_list = parent.get_all_with_users(db, skip=skip, limit=limit)
    
    total = len(parents_list)  # TODO: Implement proper count query
    
    return ParentListResponse(
        parents=parents_list,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=ParentWithUser)
async def create_parent(
    parent_in: ParentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> ParentWithUser:
    """Create a new parent profile (admin only)."""
    
    # Check if parent profile already exists for this user
    existing_parent = parent.get_by_user_id(db, user_id=parent_in.user_id)
    if existing_parent:
        raise ConflictException("Parent profile already exists for this user")
    
    # Create the parent
    db_parent = parent.create(db, obj_in=parent_in)
    
    # Return parent with user information
    return parent.get_with_user(db, parent_id=db_parent.id)


@router.get("/me", response_model=ParentWithUser)
async def get_my_parent_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_parent_user),
) -> ParentWithUser:
    """Get current user's parent profile."""
    
    db_parent = parent.get_by_user_id(db, user_id=current_user.id)
    if not db_parent:
        raise ResourceNotFoundException("Parent profile not found")
    
    return parent.get_with_user(db, parent_id=db_parent.id)


@router.get("/{parent_id}", response_model=ParentWithUser)
async def get_parent(
    parent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentWithUser:
    """Get a specific parent by ID."""
    
    db_parent = parent.get_with_user(db, parent_id=parent_id)
    if not db_parent:
        raise ResourceNotFoundException("Parent not found")
    
    # Check authorization - parents can only view their own profile, admins/teachers can view all
    if current_user.role == "parent" and db_parent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this parent profile")
    
    return db_parent


@router.put("/{parent_id}", response_model=ParentWithUser)
async def update_parent(
    parent_id: str,
    parent_update: ParentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentWithUser:
    """Update a parent profile."""
    
    # Get existing parent
    db_parent = parent.get(db, id=parent_id)
    if not db_parent:
        raise ResourceNotFoundException("Parent not found")
    
    # Check if current user is the parent or an admin
    if current_user.role not in ["admin"] and db_parent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this parent profile")
    
    # Update the parent
    updated_parent = parent.update(db, db_obj=db_parent, obj_in=parent_update)
    
    # Return updated parent with user information
    return parent.get_with_user(db, parent_id=updated_parent.id)


@router.delete("/{parent_id}")
async def delete_parent(
    parent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Delete a parent profile (admin only)."""
    
    # Check if parent exists
    db_parent = parent.get(db, id=parent_id)
    if not db_parent:
        raise ResourceNotFoundException("Parent not found")
    
    # Delete the parent
    success = parent.delete(db, id=parent_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete parent")
    
    return {"message": "Parent deleted successfully"}


@router.get("/user/{user_id}", response_model=ParentWithUser)
async def get_parent_by_user_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentWithUser:
    """Get parent profile by user ID."""
    
    # Check authorization - users can only view their own profile, admins/teachers can view all
    if current_user.role == "parent" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this parent profile")
    
    db_parent = parent.get_by_user_id(db, user_id=user_id)
    if not db_parent:
        raise ResourceNotFoundException("Parent profile not found for this user")
    
    return parent.get_with_user(db, parent_id=db_parent.id)