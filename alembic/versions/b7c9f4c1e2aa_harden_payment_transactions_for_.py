"""harden_payment_transactions_for_flutterwave

Revision ID: b7c9f4c1e2aa
Revises: acec4de5b8a7
Create Date: 2026-03-07 18:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c9f4c1e2aa'
down_revision: Union[str, None] = 'acec4de5b8a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'payment_transactions',
        sa.Column('provider_reference', sa.String(), nullable=True),
    )
    op.add_column(
        'payment_transactions',
        sa.Column('verified_amount', sa.Numeric(12, 2), nullable=True),
    )
    op.add_column(
        'payment_transactions',
        sa.Column('raw_response', sa.JSON(), nullable=True),
    )
    op.create_index(
        op.f('ix_payment_transactions_provider_reference'),
        'payment_transactions',
        ['provider_reference'],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_payment_transactions_provider_reference'),
        table_name='payment_transactions',
    )
    op.drop_column('payment_transactions', 'raw_response')
    op.drop_column('payment_transactions', 'verified_amount')
    op.drop_column('payment_transactions', 'provider_reference')
