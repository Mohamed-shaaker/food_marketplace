from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_driver
from app.models.domain import Driver, Order, OrderStatus, User
from app.schemas.dto import DriverLocationUpdate, DriverProfileOut, DriverStatusUpdate, OrderOut
from app.services.order_service import transition_order_status

router = APIRouter()


def _get_driver_profile(db: Session, user: User, require_online: bool = False) -> Driver:
    driver = db.query(Driver).filter(Driver.user_id == user.id).first()
    if not driver:
        raise HTTPException(status_code=403, detail="Driver profile not found")
    if require_online and not driver.is_online:
        raise HTTPException(status_code=409, detail="Driver must be online to claim orders")
    return driver


@router.get("/me", response_model=DriverProfileOut)
def get_driver_profile(
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    return _get_driver_profile(db, current_driver)


@router.patch("/location", response_model=DriverProfileOut)
def update_driver_location(
    payload: DriverLocationUpdate,
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    driver = _get_driver_profile(db, current_driver)
    driver.current_lat = payload.lat
    driver.current_lng = payload.lng
    driver.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


@router.get("/orders/ready", response_model=List[OrderOut])
def list_ready_orders(
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    _get_driver_profile(db, current_driver, require_online=True)
    return (
        db.query(Order)
        .filter(
            Order.ready_for_pickup_at.isnot(None),
            Order.driver_id.is_(None),
            Order.status == OrderStatus.PREPARING,
        )
        .order_by(Order.ready_for_pickup_at.asc())
        .all()
    )


@router.get("/orders/active", response_model=List[OrderOut])
def list_active_orders(
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    driver = _get_driver_profile(db, current_driver, require_online=True)
    return (
        db.query(Order)
        .filter(
            Order.driver_id == driver.id,
            Order.status != OrderStatus.DELIVERED,
        )
        .order_by(Order.created_at.desc())
        .all()
    )


@router.post("/orders/{order_id}/claim", response_model=OrderOut)
def claim_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    driver = _get_driver_profile(db, current_driver, require_online=True)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.driver_id is not None:
        raise HTTPException(status_code=409, detail="Order already claimed")
    if order.ready_for_pickup_at is None:
        raise HTTPException(status_code=409, detail="Order is not ready for pickup")

    order.driver_id = driver.id
    db.commit()
    db.refresh(order)
    return order


@router.post("/orders/{order_id}/status", response_model=OrderOut)
@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: DriverStatusUpdate,
    db: Session = Depends(get_db),
    current_driver: User = Depends(require_driver),
):
    driver = _get_driver_profile(db, current_driver, require_online=True)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.driver_id != driver.id:
        raise HTTPException(status_code=403, detail="Driver can only update claimed orders")

    try:
        transition_order_status(order, OrderStatus(payload.status))
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    db.commit()
    db.refresh(order)
    return order
