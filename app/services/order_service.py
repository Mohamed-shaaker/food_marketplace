from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session
from app.models.domain import (
    Order,
    OrderItem,
    OrderStatus,
    OrderStatusHistory,
    MenuItem,
    PaymentTransaction,
    Restaurant,
    User,
)
from app.services.wallet_service import update_wallet_balance
from fastapi import HTTPException

MONEY_QUANTUM = Decimal("0.01")
DEFAULT_PLATFORM_FEE = Decimal("1.50")
DEFAULT_COMMISSION_RATE = Decimal("0.10")


VALID_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.PREPARING},
    OrderStatus.PREPARING: {OrderStatus.READY},
    OrderStatus.READY: {OrderStatus.OUT_FOR_DELIVERY},
    OrderStatus.OUT_FOR_DELIVERY: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


def transition_order_status(
    db: Session,
    order: Order,
    new_status: OrderStatus,
    changed_by_user_id: int | None = None,
) -> None:
    if isinstance(new_status, str):
        new_status = OrderStatus(new_status)

    current_status = order.status
    if isinstance(current_status, str):
        current_status = OrderStatus(current_status)

    if current_status == new_status:
        return

    allowed_targets = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_targets:
        raise ValueError(f"Invalid transition: {current_status} -> {new_status}")

    db.add(
        OrderStatusHistory(
            order_id=order.id,
            from_status=current_status.value,
            to_status=new_status.value,
            changed_by_user_id=changed_by_user_id,
        )
    )
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

    total_amount = Decimal("0.00")
    order_items = []
    
    for item in items_data:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id, 
            MenuItem.restaurant_id == restaurant_id
        ).first()
        
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Invalid item: {item.menu_item_id}")
            
        menu_price = Decimal(str(menu_item.price)).quantize(
            MONEY_QUANTUM,
            rounding=ROUND_HALF_UP,
        )
        line_total = (menu_price * item.quantity).quantize(
            MONEY_QUANTUM,
            rounding=ROUND_HALF_UP,
        )
        total_amount = (total_amount + line_total).quantize(
            MONEY_QUANTUM,
            rounding=ROUND_HALF_UP,
        )
        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                price_at_time=menu_price,
            )
        )

    commission_rate = Decimal(str(restaurant.commission_rate or DEFAULT_COMMISSION_RATE))
    commission = (total_amount * commission_rate).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )
    restaurant_payout = (total_amount - commission).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )
    platform_fee = DEFAULT_PLATFORM_FEE

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
    db.add(
        OrderStatusHistory(
            order_id=db_order.id,
            from_status=None,
            to_status=OrderStatus.PENDING.value,
            changed_by_user_id=user_id,
        )
    )

    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def process_order_payment(db: Session, order_id: int):
    with db.begin():
        order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
        if not order:
            return False

        if order.status == OrderStatus.PAID and order.payment_status == "completed":
            return True

        try:
            transition_order_status(db, order, OrderStatus.PAID)
        except ValueError:
            return False

        _apply_order_payment_effects(db, order)
        return True


def process_verified_payment(
    db: Session,
    *,
    tx_ref: str,
    provider_reference: str,
    verified_amount: Decimal,
    raw_response: dict,
) -> bool:
    normalized_amount = verified_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    with db.begin():
        payment_tx = (
            db.query(PaymentTransaction)
            .filter(PaymentTransaction.payment_reference == tx_ref)
            .with_for_update()
            .first()
        )
        if not payment_tx:
            return False

        if payment_tx.status == "SUCCESS":
            return True

        duplicate_provider_tx = (
            db.query(PaymentTransaction)
            .filter(
                PaymentTransaction.provider_reference == provider_reference,
                PaymentTransaction.payment_reference != tx_ref,
            )
            .first()
        )
        if duplicate_provider_tx:
            raise ValueError("Provider reference already linked to another transaction")

        order = (
            db.query(Order)
            .filter(Order.id == payment_tx.order_id)
            .with_for_update()
            .first()
        )
        if not order:
            return False

        expected_amount = Decimal(str(order.total_amount)).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
        if normalized_amount != expected_amount:
            payment_tx.status = "FAILED_AMOUNT_MISMATCH"
            payment_tx.provider_reference = provider_reference
            payment_tx.verified_amount = normalized_amount
            payment_tx.raw_response = raw_response
            return False

        if order.status == OrderStatus.PAID and order.payment_status == "completed":
            payment_tx.status = "SUCCESS"
            payment_tx.provider_reference = provider_reference
            payment_tx.verified_amount = normalized_amount
            payment_tx.raw_response = raw_response
            return True

        try:
            transition_order_status(db, order, OrderStatus.PAID)
        except ValueError:
            payment_tx.status = f"FAILED_INVALID_STATE_{order.status}"
            payment_tx.provider_reference = provider_reference
            payment_tx.verified_amount = normalized_amount
            payment_tx.raw_response = raw_response
            return False

        payment_tx.provider_reference = provider_reference
        payment_tx.verified_amount = normalized_amount
        payment_tx.raw_response = raw_response
        payment_tx.status = "SUCCESS"

        _apply_order_payment_effects(db, order)

    return True


def _apply_order_payment_effects(db: Session, order: Order) -> None:
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == order.restaurant_id)
        .with_for_update()
        .first()
    )
    if not restaurant:
        raise ValueError("Restaurant not found for order payment")

    subtotal = Decimal(str(order.total_amount)).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )
    commission_rate = Decimal(str(restaurant.commission_rate or DEFAULT_COMMISSION_RATE))
    commission_amount = (subtotal * commission_rate).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )
    restaurant_payout = (subtotal - commission_amount).quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )
    platform_fee = DEFAULT_PLATFORM_FEE

    order.commission_amount = commission_amount
    order.restaurant_payout = restaurant_payout
    order.platform_fee = platform_fee
    order.payment_status = "completed"

    update_wallet_balance(
        db,
        restaurant.owner_id,
        restaurant_payout,
        "credit",
        f"order_{order.id}",
    )

    admin_user = db.query(User).filter(User.id == 1).with_for_update().first()
    if admin_user:
        update_wallet_balance(
            db,
            1,
            commission_amount,
            "credit",
            f"commission_order_{order.id}",
        )
