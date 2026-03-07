from app.core.database import SessionLocal
from app.models.domain import User, MenuItem, Restaurant

db = SessionLocal()

print("=== USERS ===")
users = db.query(User).all()
for u in users:
    print(f"  {u.email} - {u.role}")

print("\n=== RESTAURANT & MENU ===")
r = db.query(Restaurant).first()
if r:
    print(f"Restaurant: {r.name}")
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == r.id).all()
    for m in items:
        print(f"  - {m.name}: {m.price} UGX")
else:
    print("No restaurant found!")

db.close()
