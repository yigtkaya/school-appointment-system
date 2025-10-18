"""Admin user management routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.user import crud_user
from app.middleware.dependencies import get_admin_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.exceptions.http import ResourceNotFoundException, ConflictException

router = APIRouter()


@router.post("/", response_model=UserResponse)
async def create_user_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> UserResponse:
    """Create a new user (admin only)."""
    
    # Check if user already exists
    existing_user = crud_user.get_by_email(db, user_in.email)
    if existing_user:
        raise ConflictException("Email already registered")
    
    # Create user
    user = crud_user.create_with_hashed_password(db, user_in)
    return user


@router.get("/", response_model=List[UserResponse])
async def get_users_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> List[UserResponse]:
    """Get all users (admin only)."""
    
    users = crud_user.get_multi(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> UserResponse:
    """Get a specific user by ID (admin only)."""
    
    user = crud_user.get(db, id=user_id)
    if not user:
        raise ResourceNotFoundException("User not found")
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> UserResponse:
    """Update a user (admin only)."""
    
    # Get existing user
    db_user = crud_user.get(db, id=user_id)
    if not db_user:
        raise ResourceNotFoundException("User not found")
    
    # Update the user
    updated_user = crud_user.update(db, db_obj=db_user, obj_in=user_update)
    
    return updated_user


@router.delete("/{user_id}")
async def delete_user_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
) -> dict:
    """Delete a user (admin only)."""
    
    # Check if user exists
    db_user = crud_user.get(db, id=user_id)
    if not db_user:
        raise ResourceNotFoundException("User not found")
    
    # Delete the user
    success = crud_user.delete(db, id=user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}