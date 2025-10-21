#!/usr/bin/env python3
"""Create demo accounts for the school appointment system."""

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


def create_demo_accounts(db):
    """Create demo accounts for admin, teacher, and parent roles."""
    
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
        }
    ]
    
    created_users = []
    
    for account in demo_accounts:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == account["email"]).first()
        
        if existing_user:
            print(f"ℹ️  User already exists: {account['email']}")
            continue
            
        # Create new user
        # Ensure password is not too long for bcrypt (max 72 bytes)
        password = account["password"]
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        
        print(f"Creating user {account['email']} with password length: {len(password)}")
        hashed_password = get_password_hash(password)
        
        user = User(
            id=str(uuid.uuid4()),
            email=account["email"],
            password_hash=hashed_password,
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
                subject="Mathematics",  # Demo subject
                branch="Science"        # Demo branch
            )
            db.add(teacher)
        
        created_users.append(user)
        print(f"✅ Created {account['role']} user: {account['email']}")
    
    return created_users


def main():
    """Create demo accounts."""
    print("🔧 Creating demo accounts...")
    
    db = SessionLocal()
    
    try:
        created_users = create_demo_accounts(db)
        db.commit()
        
        print(f"\n✅ Successfully created {len(created_users)} demo accounts!")
        print("\n📝 Demo Account Credentials:")
        print("   📧 admin@school.com   🔑 password123  (Admin)")
        print("   📧 teacher@school.com 🔑 password123  (Teacher)")
        print("\n⚠️  Please change passwords after first login!")
        
    except Exception as e:
        print(f"\n❌ Error creating demo accounts: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())