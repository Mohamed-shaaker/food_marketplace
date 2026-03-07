"""convert_financial_columns_to_numeric

Revision ID: c41d2f7a9f0e
Revises: b7c9f4c1e2aa
Create Date: 2026-03-07 19:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c41d2f7a9f0e'
down_revision: Union[str, None] = 'b7c9f4c1e2aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


MONEY_TYPE = sa.Numeric(12, 2)


def upgrade() -> None:
    op.alter_column(
        'orders',
        'total_amount',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(total_amount::numeric, 2)',
    )
    op.alter_column(
        'orders',
        'platform_fee',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(platform_fee::numeric, 2)',
    )
    op.alter_column(
        'orders',
        'commission_amount',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(commission_amount::numeric, 2)',
    )
    op.alter_column(
        'orders',
        'restaurant_payout',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(restaurant_payout::numeric, 2)',
    )
    op.alter_column(
        'wallets',
        'balance',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(balance::numeric, 2)',
    )
    op.alter_column(
        'transactions',
        'amount',
        existing_type=sa.Float(),
        type_=MONEY_TYPE,
        postgresql_using='round(amount::numeric, 2)',
    )
    op.alter_column(
        'payment_transactions',
        'verified_amount',
        existing_type=sa.Numeric(),
        type_=MONEY_TYPE,
        postgresql_using='round(verified_amount::numeric, 2)',
    )


def downgrade() -> None:
    op.alter_column(
        'payment_transactions',
        'verified_amount',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='verified_amount::double precision',
    )
    op.alter_column(
        'transactions',
        'amount',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='amount::double precision',
    )
    op.alter_column(
        'wallets',
        'balance',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='balance::double precision',
    )
    op.alter_column(
        'orders',
        'restaurant_payout',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='restaurant_payout::double precision',
    )
    op.alter_column(
        'orders',
        'commission_amount',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='commission_amount::double precision',
    )
    op.alter_column(
        'orders',
        'platform_fee',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='platform_fee::double precision',
    )
    op.alter_column(
        'orders',
        'total_amount',
        existing_type=MONEY_TYPE,
        type_=sa.Float(),
        postgresql_using='total_amount::double precision',
    )
