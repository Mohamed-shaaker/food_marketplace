from pydantic import BaseModel, conlist
from typing import List
from decimal import Decimal


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: conlist(OrderItemCreate, min_length=1)


class OrderOut(BaseModel):
    id: int
    restaurant_id: int
    total_amount: Decimal
    status: str

    class Config:
        from_attributes = True