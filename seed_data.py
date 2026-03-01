import sys
import os

# Ensure /app is in the search path
sys.path.append("/app")

# CORRECT IMPORTS based on your 'ls' output
from app.core.database import SessionLocal 
from app.models.domain import User, Restaurant, MenuItem, UserRole, Wallet
from app.core.security import get_password_hash
import traceback # Add this at the top of your file

def seed():
    db = SessionLocal()
    try:
        print("--- Connecting to Database ---")
        
        owner_email = "owner@pizza.com"
        owner = db.query(User).filter(User.email == owner_email).first()
        
        if not owner:
            print(f"Attempting to create owner: {owner_email}")
            owner = User(
                email=owner_email,
                hashed_password=get_password_hash("password123"),
                role="restaurant_owner"  # <--- MUST BE LOWERCASE
            )
            db.add(owner)
            db.flush()
            
            db.add(Wallet(user_id=owner.id, balance=0.0))
            print("Owner and Wallet created successfully.")

        # Restaurants
        for name, rate in [("Pizza Planet", 0.10), ("Burger Royale", 0.12)]:
            if not db.query(Restaurant).filter(Restaurant.name == name).first():
                r = Restaurant(name=name, owner_id=owner.id, commission_rate=rate)
                db.add(r)
                db.flush()
                print(f"Added restaurant: {name}")

        db.commit()
        print("\n--- Success! Database Seeded ---")
        
    except Exception as e:
        db.rollback()
        print("\n--- SEEDING FAILED ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        traceback.print_exc() # This will show us the exact line
    finally:
        db.close()
if __name__ == "__main__":
    seed()