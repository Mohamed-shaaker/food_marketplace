"""add_out_for_delivery_order_status

Revision ID: 90398d245386
Revises: 6c365a88f842
Create Date: 2026-03-06 12:26:21.789140

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '90398d245386'
down_revision: Union[str, None] = '6c365a88f842'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY'")


def downgrade() -> None:
    # PostgreSQL enums cannot safely remove values in place.
    pass
