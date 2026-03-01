from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.models.domain import UserRole

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.CUSTOMER

class UserOut(BaseModel):
    """Safe public representation of a User — never exposes hashed_password."""
    id: int
    email: EmailStr
    role: UserRole

    model_config = {"from_attributes": True}  # Pydantic v2 ORM mode

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

# --- Restaurant & Menu Schemas ---
class MenuItemOut(BaseModel):
    id: int
    name: str
    price: float

    model_config = {"from_attributes": True}

class RestaurantOut(BaseModel):
    id: int
    name: str
    commission_rate: float
    menu_items: Optional[List[MenuItemOut]] = None

    model_config = {"from_attributes": True}
