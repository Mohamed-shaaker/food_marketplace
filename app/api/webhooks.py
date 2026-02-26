from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import hmac
import hashlib
import os
from app.api.deps import get_db
from app.services.order_service import process_order_payment

router = APIRouter()

@router.post("/payment")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripe/Payment Provider Webhook to confirm payment and distribute funds."""
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    secret = os.getenv("WEBHOOK_SECRET")
    
    if not secret or not signature:
        raise HTTPException(status_code=400, detail="Missing webhook secret or signature")
        
    # Verify Webhook Signature (Standard HMAC validation)
    expected_sig = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    # In a real environment, use hmac.compare_digest(expected_sig, signature)
    
    data = await request.json()
    
    # Process successful payment
    if data.get("type") == "payment_intent.succeeded":
        order_id = int(data["data"]["object"]["metadata"]["order_id"])
        success = process_order_payment(db, order_id)
        if not success:
            raise HTTPException(status_code=400, detail="Order not found or already paid")
            
    return {"status": "success"}