"""Update available_slots to use date instead of day_of_week

Revision ID: 004_date_based_slots
Revises: 003_add_username_field
Create Date: 2025-10-22 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_date_based_slots'
down_revision = '003_add_username_field'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the day_of_week column and make date non-nullable
    op.drop_column('available_slots', 'day_of_week')
    op.alter_column('available_slots', 'date', 
               existing_type=sa.DateTime(),
               type_=sa.Date(),
               nullable=False)


def downgrade() -> None:
    # Reverse: convert date back to datetime, add day_of_week
    op.alter_column('available_slots', 'date',
               existing_type=sa.Date(),
               type_=sa.DateTime(),
               nullable=True)
    op.add_column('available_slots', sa.Column('day_of_week', sa.Integer(), nullable=True))
