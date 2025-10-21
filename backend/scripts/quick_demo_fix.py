#!/usr/bin/env python3
"""Quick fix for demo accounts."""

import sys
import uuid
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.teacher import Teacher
from app.core.constants import UserRole

# Simple bcrypt hash for password123
# Generated using: python -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print(ctx.hash('password123'))"
BCRYPT_HASH = "$2b$12$LQv3c1yqBwx2A9PKOCQOd.8q6KEZdGYqk8W4VPZwZlj1pZ5fKDqsG"

def create_demo_accounts(db):
    """Create demo accounts with hardcoded bcrypt hash."""
    
    demo_accounts = [
        {
            "email": "admin@school.com",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN
        },
        {
            "email": "teacher@school.com",
            "full_name": "Demo Teacher",
            "role": UserRole.TEACHER
        }
    ]
    
    created_users = []
    
    for account in demo_accounts:
        # Create new user with hardcoded bcrypt hash
        user = User(
            id=str(uuid.uuid4()),
            email=account["email"],
            password_hash=BCRYPT_HASH,  # Hardcoded bcrypt hash for password123
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
    """Create demo accounts."""
    print("🔧 Creating demo accounts with hardcoded bcrypt hash...")
    
    db = SessionLocal()
    
    try:
        created_users = create_demo_accounts(db)
        db.commit()
        
        print(f"\n✅ Successfully created {len(created_users)} demo accounts!")
        print("\n📝 Demo Account Credentials:")
        print("   📧 admin@school.com   🔑 password123  (Admin)")
        print("   📧 teacher@school.com 🔑 password123  (Teacher)")
        print("\n✨ All accounts use bcrypt hashing!")
        
    except Exception as e:
        print(f"\n❌ Error creating demo accounts: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())