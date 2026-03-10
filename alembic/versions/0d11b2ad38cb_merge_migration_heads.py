"""Merge migration heads

Revision ID: 0d11b2ad38cb
Revises: d92e6c4fb21a, f1a2b3c4d5e6
Create Date: 2026-03-10 14:00:18.246163

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d11b2ad38cb'
down_revision: Union[str, None] = ('d92e6c4fb21a', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
