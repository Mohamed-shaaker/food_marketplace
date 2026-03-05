import os
import sys
import traceback

# Ensure /app is in the search path
sys.path.append("/app")

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.domain import MenuItem, Restaurant, User, UserRole, Wallet

def seed() -> None:
    db = SessionLocal()
    try:
        print("--- Starting clean seed ---")

        owner_email = "owner@pizza.com"
        existing_owner = db.query(User).filter(User.email == owner_email).first()
        if existing_owner:
            print(f"Deleting existing owner: {owner_email}")
            db.query(MenuItem).filter(
                MenuItem.restaurant_id.in_(
                    db.query(Restaurant.id).filter(Restaurant.owner_id == existing_owner.id)
                )
            ).delete(synchronize_session=False)
            db.query(Restaurant).filter(Restaurant.owner_id == existing_owner.id).delete(
                synchronize_session=False
            )
            db.query(Wallet).filter(Wallet.user_id == existing_owner.id).delete(
                synchronize_session=False
            )
            db.delete(existing_owner)
            db.flush()

        owner = User(
            email=owner_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.RESTAURANT,
        )
        db.add(owner)
        db.flush()
        db.add(Wallet(user_id=owner.id, balance=0.0))

        restaurants_to_add = [
            (
                "Pizza Planet",
                0.10,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop",
                [("Pepperoni Pizza", 14.99), ("Margherita Pizza", 12.50)],
            ),
            (
                "Burger Royale",
                0.12,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop",
                [("Classic Burger", 10.99), ("Double Cheeseburger", 13.49)],
            ),
        ]

        for name, rate, image_url, items in restaurants_to_add:
            restaurant = Restaurant(
                name=name,
                owner_id=owner.id,
                commission_rate=rate,
                image_url=image_url,
            )
            db.add(restaurant)
            db.flush()
            print(f"Added restaurant: {name}")

            db.add_all(
                [
                    MenuItem(name=item_name, price=item_price, restaurant_id=restaurant.id)
                    for item_name, item_price in items
                ]
            )
            print(f"Added menu items for {name}")

        db.commit()
        print("\n--- Success! Database Fully Seeded ---")

    except Exception as e:
        db.rollback()
        print(f"\n--- SEEDING FAILED: {e} ---")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
