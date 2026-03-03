from sqlalchemy.orm import Session
from app.models.domain import Order, OrderItem, MenuItem, OrderStatus, Restaurant
from app.services.wallet_service import update_wallet_balance
from fastapi import HTTPException

def create_order(db: Session, user_id: int, restaurant_id: int, items_data: list):
    # Fetch restaurant to get commission rate
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    total_amount = 0.0
    order_items = []
    
    for item in items_data:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id, 
            MenuItem.restaurant_id == restaurant_id
        ).first()
        
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Invalid item: {item.menu_item_id}")
            
        total_amount += menu_item.price * item.quantity
        order_items.append(
            OrderItem(menu_item_id=menu_item.id, quantity=item.quantity, price_at_time=menu_item.price)
        )

    # NEW: Calculate financials immediately for the database
    commission = total_amount * restaurant.commission_rate
    payout = total_amount - commission

    # 2. Create Order with NEW columns
    db_order = Order(
        user_id=user_id, 
        restaurant_id=restaurant_id, 
        total_amount=total_amount,
        commission_amount=commission, # Matches your domain.py
        payout_amount=payout,         # Matches your domain.py
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    db.flush() # Get ID

    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def process_order_payment(db: Session, order_id: int):
    """Triggered by Payment Webhook"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or order.status != OrderStatus.PENDING:
        return False
        
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    
    # Calculate Commission
    commission_amount = order.total_amount * restaurant.commission_rate
    restaurant_payout = order.total_amount - commission_amount

    # Update Restaurant Owner Wallet
    update_wallet_balance(db, restaurant.owner_id, restaurant_payout, "credit", f"order_{order.id}")
    
    # Update Admin Wallet (Assuming Admin user_id = 1 for this example)
    update_wallet_balance(db, 1, commission_amount, "credit", f"commission_order_{order.id}")

    order.status = OrderStatus.PAID
    db.commit()
    return True
