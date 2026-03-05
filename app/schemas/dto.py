from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from app.models.domain import UserRole

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.CUSTOMER

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    model_config = {"from_attributes": True}

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
    
class OrderOut(BaseModel):
    id: int
    restaurant_id: int
    status: str
    payment_status: str
    total_amount: float
    created_at: datetime  # Added for history sorting
    
    model_config = {"from_attributes": True}  

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
    image_url: Optional[str] = None
    menu_items: List[MenuItemOut] = Field(default_factory=list)
    model_config = {"from_attributes": True}
