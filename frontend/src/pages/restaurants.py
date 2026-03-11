from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.domain import Restaurant
from app.models.schemas.restaurant import RestaurantSchema

router = APIRouter()


@router.get("/", response_model=List[RestaurantSchema])
def get_restaurants(db: Session = Depends(get_db)):
    """
    Retrieve all restaurants with their menu items.
    """
    restaurants = db.query(Restaurant).options(joinedload(Restaurant.menu_items)).all()
    return restaurants


@router.get("/{restaurant_id}", response_model=RestaurantSchema)
def get_restaurant_by_id(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single restaurant by its ID, including its menu items.
    """
    restaurant = (
        db.query(Restaurant)
        .options(joinedload(Restaurant.menu_items))
        .filter(Restaurant.id == restaurant_id)
        .first()
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant