import logging
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.domain import Order, OrderStatus, PaymentTransaction
from app.schemas.payments import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentWebhookResponse,
)
from app.services.order_service import process_verified_payment
from app.services.payments import FlutterwavePaymentProvider

router = APIRouter()
logger = logging.getLogger(__name__)
provider = FlutterwavePaymentProvider()


UGANDA_NETWORK_PREFIXES = {
    "MTN": ("077", "078", "076", "086"),
    "AIRTEL": ("075", "070", "074"),
}


def detect_uganda_network(phone_number: str) -> str:
    for network, prefixes in UGANDA_NETWORK_PREFIXES.items():
        if phone_number.startswith(prefixes):
            return network
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported Uganda mobile money prefix",
    )


@router.post("/initiate", response_model=PaymentInitiateResponse)
async def initiate_payment(
    payload: PaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == payload.order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=409, detail="Order is not pending payment")
    if not settings.FLW_SECRET_KEY or not settings.FLW_SECRET_HASH:
        raise HTTPException(status_code=503, detail="Payment provider is not configured")

    network = detect_uganda_network(payload.phone_number)
    tx_ref = f"order_{order.id}_{int(datetime.utcnow().timestamp())}"

    try:
        result = await provider.initiate_mobile_money_payment(
            order_id=order.id,
            amount=order.total_amount,
            phone_number=payload.phone_number,
            email=current_user.email,
            network=network,
            tx_ref=tx_ref,
        )
    except httpx.HTTPError as exc:
        logger.exception("Flutterwave initiate failed for order %s", order.id)
        raise HTTPException(status_code=502, detail="Payment provider request failed") from exc
    except Exception as exc:
        logger.exception("Unexpected payment initiation failure for order %s", order.id)
        raise HTTPException(status_code=500, detail="Unable to start payment") from exc

    db.add(
        PaymentTransaction(
            payment_reference=result.tx_ref,
            order_id=order.id,
            status="PENDING_PROVIDER_CONFIRMATION",
            raw_response=result.meta,
        )
    )
    db.commit()

    return PaymentInitiateResponse(
        provider=result.provider,
        tx_ref=result.tx_ref,
        flw_tx_id=result.flw_tx_id,
        status=result.status,
        message=result.message,
    )


@router.post("/webhook/flutterwave", response_model=PaymentWebhookResponse)
async def flutterwave_webhook(
    request: Request,
    verif_hash: str | None = Header(default=None, alias="verif-hash"),
    db: Session = Depends(get_db),
):
    if not settings.FLW_SECRET_HASH or verif_hash != settings.FLW_SECRET_HASH:
        logger.warning("Rejected Flutterwave webhook due to invalid verif-hash")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = await request.json()
    event_data = payload.get("data") or {}
    flutterwave_tx_id = event_data.get("id")
    tx_ref = event_data.get("tx_ref")

    if not flutterwave_tx_id or not tx_ref:
        raise HTTPException(status_code=400, detail="Missing transaction verification data")

    existing_tx = db.query(PaymentTransaction).filter(
        PaymentTransaction.payment_reference == tx_ref
    ).first()
    if not existing_tx:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    if existing_tx.status == "SUCCESS":
        return PaymentWebhookResponse(status="already_processed", detail="Event ignored")
    db.rollback()

    try:
        verification = await provider.verify_transaction(int(flutterwave_tx_id))
    except httpx.HTTPError as exc:
        logger.exception("Flutterwave verification failed for tx %s", flutterwave_tx_id)
        raise HTTPException(status_code=502, detail="Verification request failed") from exc
    except Exception as exc:
        logger.exception("Unexpected verification failure for tx %s", flutterwave_tx_id)
        raise HTTPException(status_code=500, detail="Unable to verify payment") from exc

    verified = verification.get("data") or {}
    verified_status = str(verified.get("status", "")).lower()
    verified_currency = str(verified.get("currency") or "").upper()
    verified_amount = Decimal(str(verified.get("amount") or "0")).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    provider_reference = str(verified.get("id") or flutterwave_tx_id)

    if verified_status != "successful":
        payment_tx = db.query(PaymentTransaction).filter(
            PaymentTransaction.payment_reference == tx_ref
        ).first()
        if not payment_tx:
            raise HTTPException(status_code=404, detail="Payment transaction not found")
        payment_tx.status = f"FAILED_PROVIDER_STATUS_{verified_status or 'unknown'}".upper()
        payment_tx.provider_reference = provider_reference
        payment_tx.raw_response = {"webhook": payload, "verification": verification}
        db.commit()
        return PaymentWebhookResponse(status="ignored", detail="Payment not successful")

    if verified_currency != "UGX":
        payment_tx = db.query(PaymentTransaction).filter(
            PaymentTransaction.payment_reference == tx_ref
        ).first()
        if not payment_tx:
            raise HTTPException(status_code=404, detail="Payment transaction not found")
        payment_tx.status = "FAILED_CURRENCY_MISMATCH"
        payment_tx.provider_reference = provider_reference
        payment_tx.verified_amount = verified_amount
        payment_tx.raw_response = {"webhook": payload, "verification": verification}
        db.commit()
        raise HTTPException(status_code=409, detail="Verified currency mismatch")

    try:
        success = process_verified_payment(
            db,
            tx_ref=tx_ref,
            provider_reference=provider_reference,
            verified_amount=verified_amount,
            raw_response={"webhook": payload, "verification": verification},
        )
    except ValueError as exc:
        logger.exception("Payment idempotency conflict for tx_ref %s", tx_ref)
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Order payment processing failed for tx_ref %s", tx_ref)
        raise HTTPException(status_code=500, detail="Failed to process paid order") from exc

    if not success:
        raise HTTPException(status_code=409, detail="Payment verification failed state guards")

    return PaymentWebhookResponse(status="processed", detail="Payment verified and applied")
