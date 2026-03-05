from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from app.api.deps import get_db
from app.models.domain import Restaurant, MenuItem
from app.schemas.dto import RestaurantOut, MenuItemOut

router = APIRouter()

@router.get("/", response_model=list[RestaurantOut])
def list_restaurants(db: Session = Depends(get_db)):
    return (
        db.query(Restaurant)
        .options(selectinload(Restaurant.menu_items))
        .all()
    )

@router.get("/{id}/", response_model=RestaurantOut) # Added trailing slash
def get_restaurant(id: int, db: Session = Depends(get_db)):
    restaurant = (
        db.query(Restaurant)
        .options(selectinload(Restaurant.menu_items))
        .filter(Restaurant.id == id)
        .first()
    )
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/{id}/menu/", response_model=list[MenuItemOut]) # Added trailing slash
def list_menu_items(id: int, db: Session = Depends(get_db)):
    return db.query(MenuItem).filter(MenuItem.restaurant_id == id).all()
