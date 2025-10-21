#!/usr/bin/env python3
"""Reset demo accounts with proper bcrypt hashing."""

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


def reset_demo_accounts(db):
    """Delete existing demo accounts and recreate with proper bcrypt hashing."""
    
    demo_emails = ["admin@school.com", "teacher@school.com"]
    
    # Delete existing demo accounts
    for email in demo_emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.delete(user)
            print(f"🗑️  Deleted existing user: {email}")
    
    db.commit()
    
    # Create new accounts with proper bcrypt hashing
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
        # Create new user with proper bcrypt hashing
        # Ensure password is not too long for bcrypt (max 72 bytes)
        password = account["password"][:72]
        user = User(
            id=str(uuid.uuid4()),
            email=account["email"],
            password_hash=get_password_hash(password),
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
        
        created_users.append(user)
        print(f"✅ Created {account['role']} user: {account['email']}")
    
    return created_users


def main():
    """Reset demo accounts."""
    print("🔧 Resetting demo accounts with proper bcrypt hashing...")
    
    db = SessionLocal()
    
    try:
        created_users = reset_demo_accounts(db)
        db.commit()
        
        print(f"\n✅ Successfully reset {len(created_users)} demo accounts!")
        print("\n📝 Demo Account Credentials:")
        print("   📧 admin@school.com   🔑 password123  (Admin)")
        print("   📧 teacher@school.com 🔑 password123  (Teacher)")
        print("\n✨ All accounts now use proper bcrypt hashing!")
        
    except Exception as e:
        print(f"\n❌ Error resetting demo accounts: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())