from decimal import Decimal, ROUND_HALF_UP

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

    async def initiate_mobile_money_payment(
        self,
        *,
        order_id: int,
        amount: Decimal,
        phone_number: str,
        email: str,
        network: str,
        tx_ref: str,
    ) -> MobileMoneyPaymentResult:
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
            "network": network,
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
