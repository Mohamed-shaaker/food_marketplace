import os
import sys

# Add the root directory to the python path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.domain import Restaurant

def populate_restaurants():
    print("Connecting to the database...")
    db: Session = SessionLocal()
    try:
        restaurants = db.query(Restaurant).all()
        
        updates_made = 0
        for r in restaurants:
            # Check for Kampala Pizza
            if r.name and "Kampala Pizza" in r.name:
                if not r.image_url or "pexels" not in r.image_url:
                    r.image_url = "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg"
                if not r.description:
                    r.description = "The best wood-fired pizzas in Kampala. Fresh ingredients and authentic recipe."
                r.rating = 4.8
                r.is_active = True
                updates_made += 1
                
            # Check for Rolex
            elif r.name and "Rolex" in r.name:
                if not r.image_url or "pexels" not in r.image_url:
                    r.image_url = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                if not r.description:
                    r.description = "Iconic Ugandan street food. Freshly rolled rolexes with premium ingredients."
                r.rating = 4.6
                r.is_active = True
                updates_made += 1
                
            # Generic fallback for any other restaurants missing an image or description
            else:
                if not r.image_url:
                    r.image_url = "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg"
                    updates_made += 1
                if not r.description:
                    r.description = "A wonderful place to enjoy delicious meals with your family and friends."
                    updates_made += 1
                if r.rating is None:
                    r.rating = 4.0
                    updates_made += 1
                if r.is_active is None:
                    r.is_active = True
                    updates_made += 1

        if updates_made > 0:
            db.commit()
            print(f"✅ Successfully updated {updates_made} restaurant entries with images and descriptions.")
        else:
            print("✨ All restaurants already have images and descriptions. No updates needed.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error updating restaurants: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate_restaurants()
