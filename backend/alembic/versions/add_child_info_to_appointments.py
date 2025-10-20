"""add child info to appointments

Revision ID: add_child_info_001
Revises: 42dd588b5d6f
Create Date: 2025-10-20

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_child_info_001'
down_revision = '42dd588b5d6f'
branch_labels = None
depends_on = None


def upgrade():
    # Make parent_id nullable
    op.alter_column('appointments', 'parent_id',
                    existing_type=sa.String(),
                    nullable=True)

    # Add child information columns
    op.add_column('appointments', sa.Column('child_name', sa.String(), nullable=False, server_default=''))
    op.add_column('appointments', sa.Column('child_year', sa.String(), nullable=False, server_default=''))
    op.add_column('appointments', sa.Column('child_class', sa.String(), nullable=False, server_default=''))
    op.add_column('appointments', sa.Column('parent_contact', sa.String(), nullable=True))

    # Create indexes for better query performance
    op.create_index('ix_appointments_child_name', 'appointments', ['child_name'])
    op.create_index('ix_appointments_child_year', 'appointments', ['child_year'])
    op.create_index('ix_appointments_child_class', 'appointments', ['child_class'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_appointments_child_class', 'appointments')
    op.drop_index('ix_appointments_child_year', 'appointments')
    op.drop_index('ix_appointments_child_name', 'appointments')

    # Drop child information columns
    op.drop_column('appointments', 'parent_contact')
    op.drop_column('appointments', 'child_class')
    op.drop_column('appointments', 'child_year')
    op.drop_column('appointments', 'child_name')

    # Make parent_id non-nullable again
    op.alter_column('appointments', 'parent_id',
                    existing_type=sa.String(),
                    nullable=False)
