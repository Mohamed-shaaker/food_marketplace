from pydantic import BaseModel, ConfigDict
from .menu import MenuItemSchema


class RestaurantSchema(BaseModel):
    """Pydantic schema for a restaurant, including its menu items."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    location: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    image_url: str | None = None
    is_active: bool
    rating: float | None = None
    menu_items: list[MenuItemSchema] = []