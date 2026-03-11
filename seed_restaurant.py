import sys
from decimal import Decimal
from app.core.database import SessionLocal
from app.models.domain import User, Restaurant, MenuItem

def seed_restaurant():
    print("Connecting to DB...")
    db = SessionLocal()
    try:
        # Get the owner user we created
        owner = db.query(User).filter(User.email == "owner@pizza.com").first()
        if not owner:
            print("Owner not found! Run force_seed.py first.")
            return

        # Check if restaurant exists
        restaurant = db.query(Restaurant).filter(Restaurant.name == "KAMPALA PIZZA CO").first()
        if not restaurant:
            print("Creating KAMPALA PIZZA CO...")
            restaurant = Restaurant(
                name="KAMPALA PIZZA CO",
                owner_id=owner.id,
                commission_rate=0.15,
                image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591",
                rating=4.8
            )
            db.add(restaurant)
            db.flush() # flush to get id
        else:
            print("KAMPALA PIZZA CO already exists, updating image and rating...")
            restaurant.image_url = "https://images.unsplash.com/photo-1513104890138-7c749659a591"
            restaurant.rating = 4.8
            # clean old menu items
            db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).delete()
            db.flush()

        # Add Menu Items
        items = [
            {"name": "Classic Margherita", "price": Decimal("15000")},
            {"name": "Beef Suya Pizza", "price": Decimal("28000")},
            {"name": "Passion Fruit Juice", "price": Decimal("5000")},
        ]
        
        print("Adding menu items...")
        for item_data in items:
            new_item = MenuItem(
                restaurant_id=restaurant.id,
                name=item_data["name"],
                price=item_data["price"]
            )
            db.add(new_item)

        db.commit()
        print("Successfully seeded KAMPALA PIZZA CO with 3 menu items and 4.8 rating.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_restaurant()
