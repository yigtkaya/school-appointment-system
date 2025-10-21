"""Change require_approval from integer to boolean

Revision ID: 002_require_approval_bool
Revises: 001_initial_schema
Create Date: 2025-10-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_require_approval_bool'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Change require_approval column from integer to boolean."""
    # For PostgreSQL, we need to cast the integer to boolean using USING clause
    op.execute("ALTER TABLE users ALTER COLUMN require_approval TYPE BOOLEAN USING (require_approval::boolean)")
    op.alter_column('users', 'require_approval',
                    existing_type=sa.Boolean(),
                    nullable=False,
                    server_default=False)


def downgrade() -> None:
    """Revert require_approval column back to integer."""
    op.alter_column('users', 'require_approval',
                    existing_type=sa.Boolean(),
                    type_=sa.Integer(),
                    existing_nullable=False,
                    existing_server_default=sa.text('0'))
