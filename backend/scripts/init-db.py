#!/usr/bin/env python3
"""Initialize database with sample data."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.db.base import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.core.constants import UserRole


def create_admin_user(db):
    """Create default admin user if not exists."""
    admin = db.query(User).filter(User.email == "admin@school.com").first()

    if not admin:
        admin = User(
            email="admin@school.com",
            password_hash=get_password_hash("password123"),
            full_name="System Administrator",
            phone_number="+1234567890",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✅ Created admin user: admin@school.com / password123")
    else:
        print(f"ℹ️  Admin user already exists: admin@school.com")

    return admin


def main():
    """Initialize database with sample data."""
    print("🔧 Initializing database...")

    db = SessionLocal()

    try:
        # Create admin user
        create_admin_user(db)

        print("\n✅ Database initialization complete!")
        print("\n📝 Default Credentials:")
        print("   Email: admin@school.com")
        print("   Password: password123")
        print("\n⚠️  Please change the admin password after first login!")

    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        db.rollback()
        return 1

    finally:
        db.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
