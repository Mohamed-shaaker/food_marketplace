from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_role
from app.models.domain import UserRole, User
from app.schemas.dto import OrderCreate
from app.services.order_service import create_order

router = APIRouter()

@router.post("/", status_code=201)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CUSTOMER]))
):
    """Customer places an order."""
    try:
        return create_order(db, current_user.id, order_in.restaurant_id, order_in.items)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))