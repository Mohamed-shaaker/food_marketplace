from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.api.deps import get_current_user, get_db
from app.models.domain import User, Order, OrderItem, MenuItem
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new order from the user's cart. This is an atomic operation.
    """
    # Fetch all menu items at once to be efficient
    menu_item_ids = [item.menu_item_id for item in order_in.items]
    menu_items_db = db.query(MenuItem).filter(MenuItem.id.in_(menu_item_ids)).all()

    if len(menu_items_db) != len(set(menu_item_ids)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="One or more menu items not found."
        )

    # Verify all items are from the same restaurant
    restaurant_id = menu_items_db[0].restaurant_id
    if not all(item.restaurant_id == restaurant_id for item in menu_items_db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All items in an order must be from the same restaurant.",
        )

    # Create a map for easy lookup and calculate total
    menu_items_map = {item.id: item for item in menu_items_db}
    total_amount = Decimal(0)
    order_items_to_create = []

    for item_in in order_in.items:
        menu_item = menu_items_map.get(item_in.menu_item_id)
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{menu_item.name}' is currently unavailable.",
            )

        total_amount += menu_item.price * item_in.quantity
        order_items_to_create.append(
            OrderItem(
                menu_item_id=item_in.menu_item_id,
                quantity=item_in.quantity,
                price=menu_item.price,
            )
        )

    # Create the order and its items in a single transaction
    try:
        new_order = Order(
            user_id=current_user.id,
            restaurant_id=restaurant_id,
            total_amount=total_amount,
            status="PENDING",
            items=order_items_to_create,
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order.",
        )