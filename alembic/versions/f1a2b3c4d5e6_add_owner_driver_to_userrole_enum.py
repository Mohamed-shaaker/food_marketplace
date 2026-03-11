"""add owner and driver to userrole enum

Revision ID: f1a2b3c4d5e6
Revises: a2b861a22462
Create Date: 2026-03-10 16:36:00.000000

"""
from typing import Sequence, Union
from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'd92e6c4fb21a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL only allows adding values to an enum, not removing them.
    # We use raw SQL because Alembic has no built-in op for ALTER TYPE ... ADD VALUE.
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'DRIVER'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'OWNER'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values without recreating the type.
    # A full recreation is complex; we leave downgrade as a no-op and document it.
    pass
