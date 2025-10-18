#!/usr/bin/env python3
"""Simple script to create demo accounts."""

import sys
import uuid
import hashlib
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.teacher import Teacher
from app.models.parent import Parent
from app.core.constants import UserRole


def simple_hash_password(password: str) -> str:
    """Simple password hashing using SHA-256 (for demo only)."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_demo_accounts(db):
    """Create demo accounts."""
    
    demo_accounts = [
        {
            "email": "admin@school.com",
            "password": "password123",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN
        },
        {
            "email": "teacher@school.com", 
            "password": "password123",
            "full_name": "Demo Teacher",
            "role": UserRole.TEACHER
        },
        {
            "email": "parent@school.com",
            "password": "password123", 
            "full_name": "Demo Parent",
            "role": UserRole.PARENT
        }
    ]
    
    created_users = []
    
    for account in demo_accounts:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == account["email"]).first()
        
        if existing_user:
            print(f"ℹ️  User already exists: {account['email']}")
            continue
            
        # Create new user with simple hash (for demo)
        user = User(
            id=str(uuid.uuid4()),
            email=account["email"],
            password_hash=simple_hash_password(account["password"]),
            full_name=account["full_name"],
            role=account["role"],
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create role-specific records
        if account["role"] == UserRole.TEACHER:
            teacher = Teacher(
                id=str(uuid.uuid4()),
                user_id=user.id,
                subject="Mathematics",
                branch="Science",
                phone="+1234567890"
            )
            db.add(teacher)
            
        elif account["role"] == UserRole.PARENT:
            parent = Parent(
                id=str(uuid.uuid4()),
                user_id=user.id,
                student_name="Demo Student",
                student_class="Grade 10",
                phone="+1234567890"
            )
            db.add(parent)
        
        created_users.append(user)
        print(f"✅ Created {account['role']} user: {account['email']}")
    
    return created_users


def main():
    """Create demo accounts."""
    print("🔧 Creating demo accounts with simple hashing...")
    
    db = SessionLocal()
    
    try:
        created_users = create_demo_accounts(db)
        db.commit()
        
        print(f"\n✅ Successfully created {len(created_users)} demo accounts!")
        print("\n📝 Demo Account Credentials:")
        print("   📧 admin@school.com   🔑 password123  (Admin)")
        print("   📧 teacher@school.com 🔑 password123  (Teacher)")
        print("   📧 parent@school.com  🔑 password123  (Parent)")
        print("\n⚠️  Using simple SHA-256 hashing for demo purposes!")
        
    except Exception as e:
        print(f"\n❌ Error creating demo accounts: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())