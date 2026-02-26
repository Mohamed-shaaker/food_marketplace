from pydantic import BaseModel, EmailStr
from typing import List
from app.models.domain import UserRole

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.CUSTOMER

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    restaurant_id: int
    items: List[OrderItemCreate]

class WalletResponse(BaseModel):
    balance: float