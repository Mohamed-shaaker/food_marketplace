import os
import sys
import traceback

# Ensure /app is in the search path
sys.path.append("/app")

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.domain import Driver, MenuItem, Order, OrderItem, PaymentTransaction, Restaurant, Transaction, User, UserRole, Wallet


def seed() -> None:
    db = SessionLocal()
    try:
        print("--- Starting clean seed ---")

        owner_email = "owner@pizza.com"
        existing_owner = db.query(User).filter(User.email == owner_email).first()
        if existing_owner:
            print(f"Deleting existing owner: {owner_email}")
            owner_restaurant_ids = [
                r.id for r in db.query(Restaurant.id).filter(Restaurant.owner_id == existing_owner.id).all()
            ]
            if owner_restaurant_ids:
                owner_order_ids = [
                    o.id
                    for o in db.query(Order.id)
                    .filter(Order.restaurant_id.in_(owner_restaurant_ids))
                    .all()
                ]
                if owner_order_ids:
                    db.query(PaymentTransaction).filter(
                        PaymentTransaction.order_id.in_(owner_order_ids)
                    ).delete(synchronize_session=False)
                    db.query(OrderItem).filter(OrderItem.order_id.in_(owner_order_ids)).delete(
                        synchronize_session=False
                    )
                    db.query(Order).filter(Order.id.in_(owner_order_ids)).delete(
                        synchronize_session=False
                    )
            db.query(MenuItem).filter(
                MenuItem.restaurant_id.in_(
                    db.query(Restaurant.id).filter(Restaurant.owner_id == existing_owner.id)
                )
            ).delete(synchronize_session=False)
            db.query(Restaurant).filter(Restaurant.owner_id == existing_owner.id).delete(
                synchronize_session=False
            )
            owner_wallet_ids = [
                w.id for w in db.query(Wallet.id).filter(Wallet.user_id == existing_owner.id).all()
            ]
            if owner_wallet_ids:
                db.query(Transaction).filter(Transaction.wallet_id.in_(owner_wallet_ids)).delete(
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

        driver_email = "driver@fleet.com"
        existing_driver = db.query(User).filter(User.email == driver_email).first()
        if existing_driver:
            print(f"Deleting existing driver: {driver_email}")
            db.query(Order).filter(Order.driver_id.in_(db.query(Driver.id).filter(Driver.user_id == existing_driver.id))).update(
                {Order.driver_id: None},
                synchronize_session=False,
            )
            db.query(Driver).filter(Driver.user_id == existing_driver.id).delete(synchronize_session=False)
            driver_wallet_ids = [
                w.id for w in db.query(Wallet.id).filter(Wallet.user_id == existing_driver.id).all()
            ]
            if driver_wallet_ids:
                db.query(Transaction).filter(Transaction.wallet_id.in_(driver_wallet_ids)).delete(
                    synchronize_session=False
                )
            db.query(Wallet).filter(Wallet.user_id == existing_driver.id).delete(synchronize_session=False)
            db.delete(existing_driver)
            db.flush()

        driver_user = User(
            email=driver_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.DRIVER,
        )
        db.add(driver_user)
        db.flush()
        db.add(Wallet(user_id=driver_user.id, balance=0.0))
        db.add(Driver(user_id=driver_user.id, is_online=True, vehicle_type="motorbike"))
        print("Created test driver profile: driver@fleet.com / password123")

        admin_email = "admin@marketplace.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
            )
            db.add(admin_user)
            db.flush()
            db.add(Wallet(user_id=admin_user.id, balance=0.0))
            print("Created admin profile: admin@marketplace.com / admin123")
        else:
            admin_user.hashed_password = get_password_hash("admin123")
            admin_user.role = UserRole.ADMIN
            existing_wallet = db.query(Wallet).filter(Wallet.user_id == admin_user.id).first()
            if not existing_wallet:
                db.add(Wallet(user_id=admin_user.id, balance=0.0))
            print("Updated admin profile credentials: admin@marketplace.com / admin123")

        restaurants_to_add = [
            (
                "Pizza Planet",
                0.10,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop",
                [
                    ("Pepperoni Pizza", 14.99),
                    ("Margherita Pizza", 12.50),
                ],
            ),
            (
                "Burger Royale",
                0.12,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop",
                [
                    ("Classic Burger", 10.99),
                    ("Double Cheeseburger", 13.49),
                ],
            ),
        ]

        created_restaurants = []
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
            created_restaurants.append(restaurant)

            created_items = []
            for item_name, item_price in items:
                menu_item = MenuItem(
                    restaurant_id=restaurant.id,
                    name=item_name,
                    price=item_price,
                )
                db.add(menu_item)
                db.flush()
                created_items.append(menu_item)
                print(
                    f"Added menu item id={menu_item.id} name={menu_item.name} "
                    f"restaurant_id={menu_item.restaurant_id}"
                )

            if any(item.restaurant_id != restaurant.id for item in created_items):
                raise RuntimeError(f"Menu item linkage mismatch detected for {name}")
            print(f"Added menu items for: {name}")

        print("--- Link verification ---")
        for restaurant in created_restaurants:
            linked_items = (
                db.query(MenuItem)
                .filter(MenuItem.restaurant_id == restaurant.id)
                .all()
            )
            linked_ids = [item.id for item in linked_items]
            print(
                f"Restaurant id={restaurant.id} name={restaurant.name} "
                f"linked_menu_item_ids={linked_ids}"
            )

        db.commit()
        print("\n--- Success! Database Seeded ---")

    except Exception as e:
        db.rollback()
        print("\n--- SEEDING FAILED ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
