from decimal import Decimal, ROUND_HALF_UP
import uuid
import time

import httpx

from app.core.config import settings
from app.services.payments.base import MobileMoneyPaymentResult, PaymentProvider


MONEY_QUANTUM = Decimal("0.01")


class FlutterwavePaymentProvider(PaymentProvider):
    def __init__(self) -> None:
        self.base_url = settings.FLW_BASE_URL.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {settings.FLW_SECRET_KEY}",
            "Content-Type": "application/json",
        }

    def _detect_network(self, phone_number: str) -> str:
        """
        Detect network provider based on Ugandan mobile number prefixes.
        MTN: 077, 078
        AIRTEL: 075, 070
        """
        # Clean phone number - remove spaces, dashes, etc.
        clean_number = ''.join(c for c in phone_number if c.isdigit())
        
        # Handle different formats (with country code or without)
        if clean_number.startswith('256'):
            # Remove country code if present
            clean_number = clean_number[3:]
        elif clean_number.startswith('0'):
            # Remove leading zero if present
            clean_number = clean_number[1:]
        
        # Detect network based on prefix
        if clean_number.startswith(('77', '78')):
            return "MTN"
        elif clean_number.startswith(('75', '70')):
            return "AIRTEL"
        else:
            # Default to MTN if unknown prefix
            return "MTN"

    def _generate_unique_tx_ref(self, order_id: int) -> str:
        """
        Generate a unique transaction reference for every payment attempt.
        Format: ORDER_{order_id}_{timestamp}_{uuid}
        """
        timestamp = str(int(time.time() * 1000))  # Milliseconds timestamp
        unique_id = str(uuid.uuid4())[:8]  # Short UUID for uniqueness
        return f"ORDER_{order_id}_{timestamp}_{unique_id}".upper()

    async def initiate_mobile_money_payment(
        self,
        *,
        order_id: int,
        amount: Decimal,
        phone_number: str,
        email: str,
        network: str | None = None,
        tx_ref: str | None = None,
    ) -> MobileMoneyPaymentResult:
        # Detect network if not provided
        if not network:
            network = self._detect_network(phone_number)
        
        # Generate unique transaction reference if not provided
        if not tx_ref:
            tx_ref = self._generate_unique_tx_ref(order_id)
        
        normalized_amount = Decimal(str(amount)).quantize(
            MONEY_QUANTUM,
            rounding=ROUND_HALF_UP,
        )
        
        payload = {
            "tx_ref": tx_ref,
            "amount": str(normalized_amount),
            "currency": "UGX",
            "type": "mobile_money_uganda",
            "email": email,
            "phone_number": phone_number,
            "network": network.upper(),  # Ensure uppercase as Flutterwave requires
            "redirect_url": f"{settings.FRONTEND_BASE_URL}/my-orders",
            "meta": {"order_id": order_id},
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/v3/charges?type=mobile_money_uganda",
                json=payload,
                headers=self.headers,
            )
            response.raise_for_status()
            data = response.json()

        result = data.get("data", {})
        return MobileMoneyPaymentResult(
            provider="flutterwave",
            tx_ref=tx_ref,
            flw_tx_id=result.get("id"),
            status=str(data.get("status", "unknown")).lower(),
            message=result.get("processor_response")
            or data.get("message")
            or "Payment initiated.",
            meta=data,
        )

    async def verify_transaction(self, transaction_id: int) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/v3/transactions/{transaction_id}/verify",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()
