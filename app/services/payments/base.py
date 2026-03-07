from decimal import Decimal
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(slots=True)
class MobileMoneyPaymentResult:
    provider: str
    tx_ref: str
    flw_tx_id: int | None
    status: str
    message: str
    meta: dict


class PaymentProvider(ABC):
    @abstractmethod
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
        raise NotImplementedError

    @abstractmethod
    async def verify_transaction(self, transaction_id: int) -> dict:
        raise NotImplementedError
