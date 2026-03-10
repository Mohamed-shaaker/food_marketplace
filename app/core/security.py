import bcrypt
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from app.core.config import settings


def _prehash(password: str) -> bytes:
    """SHA-256 pre-hash to a fixed 64-char hex string before feeding into bcrypt.

    This sidesteps bcrypt's 72-byte truncation limit and eliminates the
    long-password DoS vector where bcrypt CPU time scales with input length.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(_prehash(plain_password), hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(_prehash(password), salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)