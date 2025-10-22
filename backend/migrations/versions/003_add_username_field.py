"""Add username field to users table

Revision ID: 003_add_username_field
Revises: 002_require_approval_bool
Create Date: 2025-10-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_username_field'
down_revision = '002_require_approval_bool'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add username column (nullable first)
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))
    
    # For existing users, generate usernames from email (take part before @)
    # PostgreSQL syntax: SPLIT_PART(email, '@', 1)
    bind = op.get_bind()
    bind.execute(sa.text(
        """UPDATE users SET username = SPLIT_PART(email, '@', 1) 
           WHERE username IS NULL"""
    ))
    
    # Now make username non-nullable and unique
    op.alter_column('users', 'username', nullable=False)
    op.create_unique_constraint('uq_users_username', 'users', ['username'])
    op.create_index('ix_users_username', 'users', ['username'])


def downgrade() -> None:
    op.drop_index('ix_users_username', table_name='users')
    op.drop_constraint('uq_users_username', 'users', type_='unique')
    op.drop_column('users', 'username')
