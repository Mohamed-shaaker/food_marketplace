from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from app.models.domain import UserRole

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

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
    driver_id: Optional[int] = None
    delivery_fee: float
    restaurant_accepted_at: Optional[datetime] = None
    ready_for_pickup_at: Optional[datetime] = None
    payment_reference: Optional[str] = None
    total_amount: Decimal
    platform_fee: Decimal
    commission_amount: Decimal
    restaurant_payout: Decimal
    created_at: datetime  # Added for history sorting
    
    model_config = {"from_attributes": True}  

class WalletResponse(BaseModel):
    balance: Decimal


class DriverStatusUpdate(BaseModel):
    status: str


class DriverLocationUpdate(BaseModel):
    lat: float
    lng: float


class DriverProfileOut(BaseModel):
    id: int
    user_id: int
    is_online: bool
    vehicle_type: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    last_seen: Optional[datetime] = None
    model_config = {"from_attributes": True}


class RecentDeliveryOut(BaseModel):
    order_id: int
    restaurant_name: str
    platform_cut: Decimal
    delivered_at: datetime


class AdminStatsOut(BaseModel):
    gross_sales: Decimal
    platform_profit: Decimal
    total_deliveries: int
    recent_deliveries: List[RecentDeliveryOut]

# --- Restaurant & Menu Schemas ---
class MenuItemOut(BaseModel):
    id: int
    name: str
    price: Decimal
    model_config = {"from_attributes": True}

class RestaurantOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    commission_rate: float
    image_url: Optional[str] = None
    rating: Optional[float] = None
    is_active: bool
    menu_items: List[MenuItemOut] = Field(default_factory=list)
    model_config = {"from_attributes": True}
