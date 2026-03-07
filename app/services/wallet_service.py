from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.domain import Wallet, Transaction


MONEY_QUANTUM = Decimal("0.01")

def update_wallet_balance(
    db: Session,
    user_id: int,
    amount: Decimal,
    transaction_type: str,
    reference_id: str,
):
    """
    Updates the wallet balance securely using database row-level locking.
    """
    normalized_amount = Decimal(str(amount)).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )

    # 1. Fetch the wallet and lock the row
    # If another process is updating this row, this line will wait until it's finished.
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).with_for_update().first()

    if not wallet:
        # If no wallet exists, create it and lock it immediately
        wallet = Wallet(user_id=user_id, balance=Decimal("0.00"))
        db.add(wallet)
        db.flush() # Send to DB but don't commit yet to get the ID and lock

    # 2. Prevent negative balances for debits
    if transaction_type == "debit" and wallet.balance < normalized_amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # 3. Apply the balance change
    if transaction_type == "credit":
        wallet.balance += normalized_amount
    elif transaction_type == "debit":
        wallet.balance -= normalized_amount
    else:
        raise ValueError("Invalid transaction_type. Must be 'credit' or 'debit'.")

    # 4. Record the transaction ledger
    new_transaction = Transaction(
        wallet_id=wallet.id,
        amount=normalized_amount,
        transaction_type=transaction_type,
        reference_id=reference_id
    )
    db.add(new_transaction)
    db.flush()

    return wallet
