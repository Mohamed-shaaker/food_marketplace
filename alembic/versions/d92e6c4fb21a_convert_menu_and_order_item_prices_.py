"""convert_menu_and_order_item_prices_to_numeric

Revision ID: d92e6c4fb21a
Revises: c41d2f7a9f0e
Create Date: 2026-03-07 19:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd92e6c4fb21a'
down_revision: Union[str, None] = 'c41d2f7a9f0e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


MONEY_TYPE = sa.Numeric(12, 2)


def upgrade() -> None:
    op.alter_column(
        'menu_items',
        'price',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(price::numeric, 2)',
    )
    op.alter_column(
        'order_items',
        'price_at_time',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(price_at_time::numeric, 2)',
    )


def downgrade() -> None:
    op.alter_column(
        'order_items',
        'price_at_time',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='price_at_time::double precision',
    )
    op.alter_column(
        'menu_items',
        'price',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='price::double precision',
    )
