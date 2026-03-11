from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class MenuItemSchema(BaseModel):
    """Pydantic schema for a menu item."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category: str | None = None
    is_available: bool
    restaurant_id: int