from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.domain import Order, OrderStatus, Restaurant, User
from app.schemas.dto import AdminStatsOut, RecentDeliveryOut

router = APIRouter()


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    delivered_filter = Order.status == OrderStatus.DELIVERED

    gross_sales = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0.0))
        .filter(delivered_filter)
        .scalar()
    )
    total_platform_fees = (
        db.query(func.coalesce(func.sum(Order.platform_fee), 0.0))
        .filter(delivered_filter)
        .scalar()
    )
    total_commission = (
        db.query(func.coalesce(func.sum(Order.commission_amount), 0.0))
        .filter(delivered_filter)
        .scalar()
    )
    total_deliveries = (
        db.query(func.count(Order.id))
        .filter(delivered_filter)
        .scalar()
    )

    rows = (
        db.query(Order, Restaurant.name)
        .join(Restaurant, Restaurant.id == Order.restaurant_id)
        .filter(delivered_filter)
        .order_by(Order.created_at.desc())
        .limit(20)
        .all()
    )

    recent_deliveries = [
        RecentDeliveryOut(
            order_id=order.id,
            restaurant_name=restaurant_name,
            platform_cut=float(order.platform_fee + order.commission_amount),
            delivered_at=order.created_at,
        )
        for order, restaurant_name in rows
    ]

    return AdminStatsOut(
        gross_sales=float(gross_sales),
        platform_profit=float(total_platform_fees + total_commission),
        total_deliveries=int(total_deliveries),
        recent_deliveries=recent_deliveries,
    )
