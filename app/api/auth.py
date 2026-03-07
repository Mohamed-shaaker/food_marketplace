from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.core import security
from app.models.domain import User, Wallet
from app.schemas.dto import UserCreate, UserOut, Token

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and atomically create their Wallet.

    ATOMICITY GUARANTEE:
    - db.flush() assigns the user's DB id within the open transaction (no commit yet).
    - We use that id to build the Wallet in the same transaction.
    - A single db.commit() writes BOTH rows. If anything raises before commit,
      PostgreSQL rolls back both — you can never end up with a User but no Wallet.
    """
    # 1. Guard: reject duplicate emails
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Hash the password (bcrypt via passlib)
    hashed_password = security.get_password_hash(user_in.password)

    # 3. Stage the User object — NOT committed yet
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
    )
    db.add(db_user)

    # 4. flush() sends the INSERT to the DB session so PostgreSQL assigns an id,
    #    but the transaction is still OPEN — nothing is durable yet.
    db.flush()

    # 5. Stage the Wallet using the now-known user id — still in the same transaction
    new_wallet = Wallet(user_id=db_user.id, balance=Decimal("0.00"))
    db.add(new_wallet)

    # 6. ONE commit — writes User + Wallet atomically.
    #    If this raises, the entire transaction is rolled back by SQLAlchemy.
    db.commit()
    db.refresh(db_user)

    # 7. Return the safe UserOut schema (id, email, role — no password)
    return db_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )

    access_token = security.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
