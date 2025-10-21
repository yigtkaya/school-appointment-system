#!/usr/bin/env python3
"""Script to add specific teachers to the system."""

import sys
import uuid
import hashlib
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.teacher import Teacher
from app.core.constants import UserRole


def simple_hash_password(password: str) -> str:
    """Simple password hashing using SHA-256 (for demo only)."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_email_from_name(full_name: str) -> str:
    """Create email from full name."""
    # Convert to lowercase, remove spaces, add domain
    name_part = full_name.lower().replace(" ", ".")
    return f"{name_part}@school.com"


def add_teachers(db):
    """Add the specified teachers to the system."""
    
    teachers_to_add = [
        "Nermin Talus",
        "Tuğba İlhan", 
        "Esra Kırmızı",
        "Arife Ateş",
        "Özge Cavlak",
        "Canan Eroğlu",
        "Zeynep Emel Marangoz",
        "Seda Şahin"
    ]
    
    created_teachers = []
    
    for teacher_name in teachers_to_add:
        email = create_email_from_name(teacher_name)
        
        # Check if user already exists by email or name
        existing_user = db.query(User).filter(
            (User.email == email) | (User.full_name == teacher_name)
        ).first()
        
        if existing_user:
            print(f"ℹ️  Teacher already exists: {teacher_name} ({email})")
            continue
            
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=simple_hash_password("teacher123"),  # Default password
            full_name=teacher_name,
            role=UserRole.TEACHER,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create teacher profile (without branch as per your requirements)
        teacher = Teacher(
            id=str(uuid.uuid4()),
            user_id=user.id,
            subject=None,  # Can be set later
            branch=None,   # Not required as per your requirements
            bio=None,      # Can be set later
            phone=None     # Can be set later
        )
        db.add(teacher)
        
        created_teachers.append((user, teacher))
        print(f"✅ Created teacher: {teacher_name} ({email})")
    
    return created_teachers


def main():
    """Add teachers to the system."""
    print("🔧 Adding teachers to the system...")
    
    db = SessionLocal()
    
    try:
        created_teachers = add_teachers(db)
        db.commit()
        
        print(f"\n✅ Successfully created {len(created_teachers)} teachers!")
        print("\n📝 Teacher Login Credentials (Default password: teacher123):")
        
        teacher_names = [
            "Nermin Talus",
            "Tuğba İlhan", 
            "Esra Kırmızı",
            "Arife Ateş",
            "Özge Cavlak",
            "Canan Eroğlu",
            "Zeynep Emel Marangoz",
            "Seda Şahin"
        ]
        
        for name in teacher_names:
            email = create_email_from_name(name)
            print(f"   👩‍🏫 {name}")
            print(f"      📧 Email: {email}")
            print(f"      👤 Name: {name}")
            print(f"      🔑 Password: teacher123")
            print()
        
        print("⚠️  Teachers can login using either their email or full name!")
        print("⚠️  Using simple SHA-256 hashing for demo purposes!")
        
    except Exception as e:
        print(f"\n❌ Error adding teachers: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())