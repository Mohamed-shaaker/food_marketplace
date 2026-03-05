from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user 
from app.models.domain import Order, OrderItem, MenuItem, Restaurant, OrderStatus
from app.schemas.dto import OrderCreate, OrderOut

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == order_in.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    total_amount = 0.0
    items_to_save = []

    for item in order_in.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id, MenuItem.restaurant_id == order_in.restaurant_id).first()
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Item {item.menu_item_id} invalid")
        
        total_amount += menu_item.price * item.quantity
        items_to_save.append(OrderItem(menu_item_id=menu_item.id, quantity=item.quantity, price_at_time=menu_item.price))

    commission = total_amount * 0.10
    new_order = Order(
        user_id=current_user.id,
        restaurant_id=order_in.restaurant_id,
        total_amount=total_amount,
        commission_amount=commission,
        payout_amount=total_amount - commission,
        status=OrderStatus.PENDING,
        payment_status="pending"
    )
    
    db.add(new_order)
    db.flush()
    for oi in items_to_save:
        oi.order_id = new_order.id
        db.add(oi)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my", response_model=List[OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user), limit: int = 10, offset: int = 0):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

@router.post("/{order_id}/confirm-payment")
def confirm_payment(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "completed":
        return {"status": "already_paid"}

    order.payment_status = "completed"
    order.status = OrderStatus.PAID
    db.commit()
    return {"status": "success", "new_order_status": order.status}

@router.get("/{order_id}", response_model=OrderOut)
def get_order_status(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
