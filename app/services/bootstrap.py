from decimal import Decimal

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.domain import Driver, MenuItem, Restaurant, User, UserRole, Wallet


def run_demo_bootstrap() -> None:
    db = SessionLocal()
    try:
        owner_email = "owner@pizza.com"
        owner = db.query(User).filter(User.email == owner_email).first()
        if not owner:
            owner = User(
                email=owner_email,
                hashed_password=get_password_hash("password123"),
                role=UserRole.RESTAURANT,
            )
            db.add(owner)
            db.flush()
        else:
            owner.role = UserRole.RESTAURANT

        owner_wallet = db.query(Wallet).filter(Wallet.user_id == owner.id).first()
        if not owner_wallet:
            db.add(Wallet(user_id=owner.id, balance=Decimal("0.00")))

        driver_email = "driver@fleet.com"
        driver_user = db.query(User).filter(User.email == driver_email).first()
        if not driver_user:
            driver_user = User(
                email=driver_email,
                hashed_password=get_password_hash("password123"),
                role=UserRole.DRIVER,
            )
            db.add(driver_user)
            db.flush()
        else:
            driver_user.role = UserRole.DRIVER

        driver_wallet = db.query(Wallet).filter(Wallet.user_id == driver_user.id).first()
        if not driver_wallet:
            db.add(Wallet(user_id=driver_user.id, balance=Decimal("0.00")))

        driver_profile = db.query(Driver).filter(Driver.user_id == driver_user.id).first()
        if not driver_profile:
            driver_profile = Driver(user_id=driver_user.id, is_online=True, vehicle_type="motorbike")
            db.add(driver_profile)
        else:
            driver_profile.is_online = True

        restaurant_name = "Kampala Pizza Express"
        restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
        if not restaurant:
            restaurant = Restaurant(
                name=restaurant_name,
                owner_id=owner.id,
                commission_rate=0.10,
                image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop",
            )
            db.add(restaurant)
            db.flush()
        else:
            restaurant.owner_id = owner.id
            restaurant.commission_rate = 0.10

        # Add Admin account
        admin_email = "admin@foodmarket.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
            )
            db.add(admin)
            db.flush()
        else:
            admin.role = UserRole.ADMIN

        admin_wallet = db.query(Wallet).filter(Wallet.user_id == admin.id).first()
        if not admin_wallet:
            db.add(Wallet(user_id=admin.id, balance=Decimal("0.00")))

        menu_items = [
            ("Kampala Meat Lovers Pizza", 32000.0),
            ("Chicken Wrap", 18000.0),
            ("Veggie Wrap", 16000.0),
            ("Masala Chips", 8000.0),
            ("Cola", 5000.0),
            ("Fresh Juice", 7000.0),
        ]

        existing_items = {
            m.name: m for m in db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()
        }
        for name, price in menu_items:
            if name in existing_items:
                existing_items[name].price = price
            else:
                db.add(MenuItem(restaurant_id=restaurant.id, name=name, price=price))

        db.commit()
    finally:
        db.close()
