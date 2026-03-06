from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from typing import List
from app.api.deps import get_db, get_current_user 
from app.models.domain import Order, OrderStatus
from app.schemas.dto import OrderCreate, OrderOut
from app.services.order_service import create_order as create_order_service
from app.services.order_service import transition_order_status

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    response: Response,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if idempotency_key:
        existing_order = (
            db.query(Order)
            .options(selectinload(Order.payment_transactions))
            .filter(
                Order.user_id == current_user.id,
                Order.idempotency_key == idempotency_key,
            )
            .first()
        )
        if existing_order:
            response.status_code = status.HTTP_200_OK
            return existing_order

        foreign_order = (
            db.query(Order)
            .filter(Order.idempotency_key == idempotency_key)
            .first()
        )
        if foreign_order and foreign_order.user_id != current_user.id:
            raise HTTPException(status_code=409, detail="Idempotency key already used")

    new_order = create_order_service(
        db=db,
        user_id=current_user.id,
        restaurant_id=order_in.restaurant_id,
        items_data=order_in.items,
        idempotency_key=idempotency_key,
    )
    return new_order

@router.get("/my", response_model=List[OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user), limit: int = 10, offset: int = 0):
    return (
        db.query(Order)
        .options(selectinload(Order.payment_transactions))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.post("/{order_id}/confirm-payment")
def confirm_payment(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "completed":
        return {"status": "already_paid"}

    try:
        transition_order_status(order, OrderStatus.PAID)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    order.payment_status = "completed"
    db.commit()
    return {"status": "success", "new_order_status": order.status}

@router.get("/{order_id}", response_model=OrderOut)
def get_order_status(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = (
        db.query(Order)
        .options(selectinload(Order.payment_transactions))
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
