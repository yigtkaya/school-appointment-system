"""API dependencies."""

from app.db.session import SessionLocal


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()