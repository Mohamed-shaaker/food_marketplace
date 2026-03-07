from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator


class PaymentInitiateRequest(BaseModel):
    order_id: int
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if digits.startswith("256"):
            digits = f"0{digits[3:]}"
        if len(digits) != 10 or not digits.startswith("0"):
            raise ValueError("Phone number must be a valid Uganda mobile number")
        return digits


class PaymentInitiateResponse(BaseModel):
    provider: str
    tx_ref: str
    status: str
    message: str
    flw_tx_id: int | None = None


class PaymentWebhookResponse(BaseModel):
    status: str
    detail: str | None = None


class PaymentStatusOut(BaseModel):
    id: int
    payment_reference: str
    provider_reference: str | None = None
    status: str
    verified_amount: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
