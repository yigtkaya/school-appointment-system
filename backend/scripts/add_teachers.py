#!/usr/bin/env python3
"""Add teachers to the school appointment system."""

import sys
import uuid
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.teacher import Teacher
from app.core.security import get_password_hash
from app.core.constants import UserRole


def add_teachers(db):
    """Add teachers to the database."""
    
    teachers_data = [
        {"full_name": "Nermin Talus", "email": "nermin.talus@school.com"},
        {"full_name": "Tuğba İlhan", "email": "tugba.ilhan@school.com"},
        {"full_name": "Esra Kırmızı", "email": "esra.kirmizi@school.com"},
        {"full_name": "Arife Ateş", "email": "arife.ates@school.com"},
        {"full_name": "Özge Cavlak", "email": "ozge.cavlak@school.com"},
        {"full_name": "Canan Eroğlu", "email": "canan.eroglu@school.com"},
        {"full_name": "Zeynep Emel Marangoz", "email": "zeynep.marangoz@school.com"},
        {"full_name": "Seda Şahin", "email": "seda.sahin@school.com"}
    ]
    
    created_users = []
    
    for teacher_data in teachers_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == teacher_data["email"]).first()
        
        if existing_user:
            print(f"ℹ️  Teacher already exists: {teacher_data['email']}")
            continue
            
        # Create new user with default password
        default_password = "teacher123"
        hashed_password = get_password_hash(default_password)
        
        user = User(
            id=str(uuid.uuid4()),
            email=teacher_data["email"],
            password_hash=hashed_password,
            full_name=teacher_data["full_name"],
            role=UserRole.TEACHER,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create teacher profile
        teacher = Teacher(
            id=str(uuid.uuid4()),
            user_id=user.id,
            subject="To be assigned",  # Default subject
            branch="To be assigned"   # Default branch
        )
        db.add(teacher)
        
        created_users.append(user)
        print(f"✅ Created teacher: {teacher_data['full_name']} ({teacher_data['email']})")
    
    return created_users


def main():
    """Add teachers to the database."""
    print("🔧 Adding teachers to the database...")
    
    db = SessionLocal()
    
    try:
        created_users = add_teachers(db)
        db.commit()
        
        print(f"\n✅ Successfully added {len(created_users)} teachers!")
        print("\n📝 Default credentials for new teachers:")
        print("   🔑 Default password: teacher123")
        print("\n⚠️  Teachers should change their passwords after first login!")
        print("⚠️  Subjects and branches are set to 'To be assigned' - please update them in the system!")
        
    except Exception as e:
        print(f"\n❌ Error adding teachers: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())