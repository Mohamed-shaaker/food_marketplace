from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_owner
from app.models.domain import Order, OrderStatus, Restaurant, User
from app.schemas.dto import OrderOut
from app.services.order_service import transition_order_status

router = APIRouter()


def _get_owned_order(db: Session, order_id: int, owner: User) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    if not restaurant or restaurant.owner_id != owner.id:
        raise HTTPException(status_code=403, detail="Owner can only manage own restaurant orders")

    return order


@router.post("/orders/{order_id}/accept", response_model=OrderOut)
def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_owner: User = Depends(require_owner),
):
    order = _get_owned_order(db, order_id, current_owner)

    if order.status != OrderStatus.PAID:
        raise HTTPException(status_code=409, detail="Only PAID orders can be accepted")

    try:
        transition_order_status(order, OrderStatus.PREPARING)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    order.restaurant_accepted_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[OrderOut])
def list_owner_orders(
    db: Session = Depends(get_db),
    current_owner: User = Depends(require_owner),
):
    restaurant_ids = [
        row.id for row in db.query(Restaurant.id).filter(Restaurant.owner_id == current_owner.id).all()
    ]
    if not restaurant_ids:
        return []

    return (
        db.query(Order)
        .filter(
            Order.restaurant_id.in_(restaurant_ids),
            Order.status.in_([OrderStatus.PAID, OrderStatus.PREPARING]),
        )
        .order_by(Order.created_at.desc())
        .all()
    )


@router.post("/orders/{order_id}/ready", response_model=OrderOut)
def mark_ready_for_pickup(
    order_id: int,
    db: Session = Depends(get_db),
    current_owner: User = Depends(require_owner),
):
    order = _get_owned_order(db, order_id, current_owner)

    if order.status != OrderStatus.PREPARING:
        raise HTTPException(status_code=409, detail="Only PREPARING orders can be marked ready")

    order.ready_for_pickup_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order
