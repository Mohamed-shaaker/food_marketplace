from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.domain import Order, OrderStatus, PaymentTransaction
from app.services.order_service import process_order_payment

router = APIRouter()


@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.json()

    payment_reference = data.get("payment_reference")
    order_id = data.get("order_id")
    payment_status = str(data.get("status", "succeeded")).lower()

    if not payment_reference:
        raise HTTPException(status_code=400, detail="Missing payment_reference")
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order_id")

    existing_tx = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.payment_reference == payment_reference)
        .first()
    )
    if existing_tx:
        return {
            "status": "already_processed",
            "payment_reference": existing_tx.payment_reference,
            "order_id": existing_tx.order_id,
        }

    order = db.query(Order).filter(Order.id == int(order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tx = PaymentTransaction(
        payment_reference=payment_reference,
        order_id=order.id,
        status="received",
    )
    db.add(tx)
    db.flush()

    success_states = {"succeeded", "success", "paid", "completed"}
    if payment_status in success_states:
        if order.status != OrderStatus.PENDING:
            tx.status = f"ignored_invalid_state_{order.status}"
            db.commit()
            return {"status": "ignored", "detail": "Order is not in PENDING state"}

        success = process_order_payment(db, order.id)
        if not success:
            tx.status = "failed_state_guard"
            db.commit()
            raise HTTPException(status_code=409, detail="Illegal order state transition")

        tx.status = "processed"
        db.commit()
        return {"status": "processed", "order_id": order.id}

    tx.status = f"ignored_provider_status_{payment_status}"
    db.commit()
    return {"status": "ignored", "order_id": order.id}
