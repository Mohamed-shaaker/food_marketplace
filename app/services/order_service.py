from sqlalchemy.orm import Session
from app.models.domain import Order, OrderItem, MenuItem, OrderStatus, Restaurant, User
from app.services.wallet_service import update_wallet_balance
from fastapi import HTTPException


ALLOWED_ORDER_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.PREPARING},
    OrderStatus.PREPARING: {OrderStatus.OUT_FOR_DELIVERY},
    OrderStatus.OUT_FOR_DELIVERY: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


def transition_order_status(order: Order, new_status: OrderStatus) -> None:
    if isinstance(new_status, str):
        new_status = OrderStatus(new_status)

    current_status = order.status
    if isinstance(current_status, str):
        current_status = OrderStatus(current_status)

    if current_status == new_status:
        return

    allowed_targets = ALLOWED_ORDER_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_targets:
        raise ValueError(f"Illegal order status transition: {current_status} -> {new_status}")

    order.status = new_status

def create_order(
    db: Session,
    user_id: int,
    restaurant_id: int,
    items_data: list,
    idempotency_key: str | None = None,
):
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

    commission = total_amount * restaurant.commission_rate
    restaurant_payout = total_amount - commission
    platform_fee = 1.50

    # 2. Create Order with NEW columns
    db_order = Order(
        user_id=user_id, 
        restaurant_id=restaurant_id, 
        total_amount=total_amount,
        platform_fee=platform_fee,
        commission_amount=commission,
        restaurant_payout=restaurant_payout,
        status=OrderStatus.PENDING,
        payment_status="pending",
        idempotency_key=idempotency_key,
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
    if not order:
        return False

    try:
        transition_order_status(order, OrderStatus.PAID)
    except ValueError:
        return False

    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    
    subtotal = order.total_amount
    commission_amount = subtotal * restaurant.commission_rate
    restaurant_payout = subtotal - commission_amount
    platform_fee = 1.50

    order.commission_amount = commission_amount
    order.restaurant_payout = restaurant_payout
    order.platform_fee = platform_fee

    order.payment_status = "completed"

    # Update Restaurant Owner Wallet
    update_wallet_balance(db, restaurant.owner_id, restaurant_payout, "credit", f"order_{order.id}")
    
    # Update Admin Wallet only if a platform user exists.
    admin_user = db.query(User).filter(User.id == 1).first()
    if admin_user:
        update_wallet_balance(db, 1, commission_amount, "credit", f"commission_order_{order.id}")

    db.commit()
    return True
