from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user 
from app.models.domain import Order, OrderItem, MenuItem, Restaurant, OrderStatus
from app.schemas.dto import OrderCreate, OrderOut

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) 
):
    # 1. Validate Restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.id == order_in.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    total_amount = 0.0
    items_to_save = []

    # 2. Validate Items & Fetch Live Prices
    for item in order_in.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id,
            MenuItem.restaurant_id == order_in.restaurant_id
        ).first()

        if not menu_item:
            raise HTTPException(
                status_code=400, 
                detail=f"Item {item.menu_item_id} does not belong to this restaurant"
            )

        total_amount += menu_item.price * item.quantity
        items_to_save.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                price_at_time=menu_item.price
            )
        )

    # 3. Calculate 10% Commission
    commission = total_amount * 0.10
    payout = total_amount - commission

    # 4. Atomic Database Transaction
    new_order = Order(
        user_id=current_user.id,
        restaurant_id=order_in.restaurant_id,
        total_amount=total_amount,
        commission_amount=commission,
        payout_amount=payout,
        status=OrderStatus.PENDING, # Aligned with your DB enum fix
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

# --- NEW: Added for the OrderStatus.jsx page ---
@router.get("/{order_id}", response_model=OrderOut)
def get_order_status(
    order_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id, 
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order