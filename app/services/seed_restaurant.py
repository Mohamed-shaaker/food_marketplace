"""
Restaurant seeding script to create sample data for testing the UI.

This script creates:
- 6 diverse restaurants including Rolex Street Kitchen and Burger Bros
- 3-4 menu items per restaurant with UGX prices
- Placeholder images from Unsplash
"""

from decimal import Decimal
from app.core.database import SessionLocal
from app.models.domain import User, Restaurant, MenuItem, UserRole
from app.core.security import get_password_hash
from sqlalchemy.orm import joinedload, Session


def seed_restaurant_data(db: Session, owner: User):
    """
    Create or update sample restaurants and menu items.
    This function should be called within an existing database session.
    """
    try:
        # The 'owner' and 'db' session are now passed in directly.
        # This prevents transaction locks from creating a new session.
        print(f"Starting to seed restaurants for owner: {owner.email} (ID: {owner.id})")
        
        # Create restaurants with their menu items
        restaurants_data = [
            {
                'name': "Mama's Pizza Palace",
                'description': "Authentic Italian pizza made with love and fresh ingredients.",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 001",
                'contact_email': "info@pizzapalace.ug",
                'image_url': "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
                'menu': [
                    {'name': 'Margherita Pizza', 'description': 'Classic pizza with fresh mozzarella, tomatoes, and basil.', 'price': Decimal('25000.00'), 'category': 'Pizzas'},
                    {'name': 'Pepperoni Pizza', 'description': 'Our signature pizza topped with spicy pepperoni and extra cheese.', 'price': Decimal('28000.00'), 'category': 'Pizzas'},
                    {'name': 'Hawaiian Pizza', 'description': 'Ham, pineapple, and mozzarella cheese.', 'price': Decimal('27000.00'), 'category': 'Pizzas'},
                    {'name': 'Veggie Pizza', 'description': 'Mixed vegetables with mozzarella cheese.', 'price': Decimal('26000.00'), 'category': 'Pizzas'}
                ]
            },
            {
                'name': "Burger Bros",
                'description': "Juicy burgers made with premium beef and fresh buns.",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 002",
                'contact_email': "info@burgerbros.ug",
                'image_url': "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
                'menu': [
                    {'name': 'Classic Cheeseburger', 'description': 'Beef patty, cheddar, lettuce, tomato, and special sauce.', 'price': Decimal('15000.00'), 'category': 'Burgers'},
                    {'name': 'Bacon Burger', 'description': 'Beef patty, bacon, cheddar, and special sauce.', 'price': Decimal('18000.00'), 'category': 'Burgers'},
                    {'name': 'Veggie Burger', 'description': 'Plant-based patty with fresh vegetables and sauce.', 'price': Decimal('14000.00'), 'category': 'Burgers'},
                    {'name': 'Double Cheeseburger', 'description': 'Double beef patty with extra cheese and sauce.', 'price': Decimal('20000.00'), 'category': 'Burgers'}
                ]
            },
            {
                'name': "Rolex Street Kitchen",
                'description': "Authentic Ugandan street food - the best rolex in town!",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 003",
                'contact_email': "info@rolexkitchen.ug",
                'image_url': "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
                'menu': [
                    {'name': 'Classic Rolex', 'description': 'Eggs, onions, and chapati - the original!', 'price': Decimal('8000.00'), 'category': 'Street Food'},
                    {'name': 'Chicken Rolex', 'description': 'Grilled chicken, eggs, onions, and chapati.', 'price': Decimal('10000.00'), 'category': 'Street Food'},
                    {'name': 'Vegetable Rolex', 'description': 'Mixed vegetables, eggs, and chapati.', 'price': Decimal('7000.00'), 'category': 'Street Food'},
                    {'name': 'Spicy Rolex', 'description': 'Eggs, onions, hot sauce, and chapati.', 'price': Decimal('9000.00'), 'category': 'Street Food'}
                ]
            },
            {
                'name': "African Spice House",
                'description': "Traditional African cuisine with authentic flavors and recipes.",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 004",
                'contact_email': "info@africanspice.ug",
                'image_url': "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
                'menu': [
                    {'name': 'Ugali and Sukuma', 'description': 'Traditional Ugandan staple with collard greens.', 'price': Decimal('12000.00'), 'category': 'Traditional'},
                    {'name': 'Nyama Choma', 'description': 'Grilled meat with traditional sides.', 'price': Decimal('25000.00'), 'category': 'Grilled'},
                    {'name': 'Matoke', 'description': 'Steamed green bananas with meat.', 'price': Decimal('15000.00'), 'category': 'Traditional'},
                    {'name': 'Chapati and Beans', 'description': 'Flatbread with bean stew.', 'price': Decimal('10000.00'), 'category': 'Street Food'}
                ]
            },
            {
                'name': "Green Leaf Bistro",
                'description': "Healthy and fresh meals made with organic ingredients.",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 005",
                'contact_email': "info@greenleaf.ug",
                'image_url': "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
                'menu': [
                    {'name': 'Quinoa Salad', 'description': 'Quinoa with fresh vegetables and herbs.', 'price': Decimal('18000.00'), 'category': 'Salads'},
                    {'name': 'Grilled Chicken Bowl', 'description': 'Grilled chicken with brown rice and vegetables.', 'price': Decimal('22000.00'), 'category': 'Bowls'},
                    {'name': 'Avocado Toast', 'description': 'Sourdough bread with smashed avocado and toppings.', 'price': Decimal('15000.00'), 'category': 'Breakfast'},
                    {'name': 'Smoothie Bowl', 'description': 'Acai or fruit base with fresh toppings.', 'price': Decimal('16000.00'), 'category': 'Bowls'}
                ]
            },
            {
                'name': "Cold Brew & Chill",
                'description': "Refreshing drinks and cold beverages for every occasion.",
                'location': "Kampala, Uganda",
                'contact_phone': "+256 700 000 006",
                'contact_email': "info@coldbrew.ug",
                'image_url': "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
                'menu': [
                    {'name': 'Cold Brew Coffee', 'description': 'Smooth cold brew coffee served over ice.', 'price': Decimal('8000.00'), 'category': 'Coffee'},
                    {'name': 'Fresh Juice', 'description': 'Freshly squeezed fruit juice.', 'price': Decimal('10000.00'), 'category': 'Juices'},
                    {'name': 'Smoothie', 'description': 'Fresh fruit smoothie with your choice of fruits.', 'price': Decimal('12000.00'), 'category': 'Smoothies'},
                    {'name': 'Iced Tea', 'description': 'Refreshing iced tea with lemon.', 'price': Decimal('6000.00'), 'category': 'Tea'}
                ]
            }
        ]
        
        # Get existing restaurants for this owner, keyed by name for efficient lookup
        existing_restaurants = {
            r.name: r for r in db.query(Restaurant).filter(Restaurant.owner_id == owner.id).all()
        }
        total_menu_items_created = 0
        
        for restaurant_data in restaurants_data:
            restaurant_name = restaurant_data['name']
            restaurant = existing_restaurants.get(restaurant_name)

            if restaurant:
                # UPDATE existing restaurant
                print(f"   - Updating existing restaurant: '{restaurant_name}' (ID: {restaurant.id})")
                restaurant.description = restaurant_data['description']
                restaurant.location = restaurant_data['location']
                restaurant.contact_phone = restaurant_data['contact_phone']
                restaurant.contact_email = restaurant_data['contact_email']
                restaurant.image_url = restaurant_data['image_url']
                restaurant.is_active = True
                
                # Delete old menu items to ensure a clean slate
                num_deleted = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).delete(synchronize_session=False)
                if num_deleted > 0:
                    print(f"     - Cleared {num_deleted} old menu items.")
            else:
                # CREATE new restaurant
                print(f"   - Creating new restaurant: '{restaurant_name}'")
                restaurant = Restaurant(
                    name=restaurant_data['name'],
                    description=restaurant_data['description'],
                    location=restaurant_data['location'],
                    contact_phone=restaurant_data['contact_phone'],
                    contact_email=restaurant_data['contact_email'],
                    owner_id=owner.id,
                    image_url=restaurant_data['image_url'],
                    is_active=True
                )
                db.add(restaurant)
                db.flush()  # Flush to get the restaurant ID for menu items

            # Create menu items
            items_created_for_restaurant = 0
            for item_data in restaurant_data['menu']:
                menu_item = MenuItem(
                    name=item_data['name'],
                    description=item_data['description'],
                    price=item_data['price'],
                    image_url=restaurant_data['image_url'],  # Use restaurant image for simplicity
                    category=item_data['category'],
                    restaurant_id=restaurant.id,
                    is_available=True
                )
                db.add(menu_item)
                items_created_for_restaurant += 1
            
            total_menu_items_created += items_created_for_restaurant
            print(f"     - Staged {items_created_for_restaurant} menu items for creation.")
        
        # The final commit is handled by the calling function (run_demo_bootstrap)
        print(f"\nSuccessfully staged {len(restaurants_data)} restaurants and {total_menu_items_created} total menu items.")
        
    except Exception as e:
        print(f"An error occurred during restaurant seeding: {e}")
        # Re-raise the exception to allow the calling transaction to roll back
        raise


def verify_restaurant_data():
    """Verify the restaurants and menu items were created successfully."""
    db = SessionLocal()
    
    try:
        # Get all restaurants for the owner with their menu items
        restaurants = db.query(Restaurant).options(
            joinedload(Restaurant.menu_items)
        ).join(User).filter(User.email == 'owner@pizza.com').all()
        
        if not restaurants:
            print("No restaurants found for owner@pizza.com")
            return False
        
        print(f"\nRestaurant Details ({len(restaurants)} restaurants):")
        
        for restaurant in restaurants:
            print(f"\n{restaurant.name}")
            print(f"   Description: {restaurant.description}")
            print(f"   Location: {restaurant.location}")
            print(f"   Contact: {restaurant.contact_phone}")
            print(f"   Email: {restaurant.contact_email}")
            print(f"   Active: {restaurant.is_active}")
            print(f"   Image: {restaurant.image_url}")
            print(f"   Menu Items ({len(restaurant.menu_items)}):")
            
            for item in restaurant.menu_items:
                print(f"     • {item.name} - UGX {item.price:,}")
                print(f"       Description: {item.description}")
                print(f"       Category: {item.category}")
                print(f"       Available: {item.is_available}")
        
        return True
        
    except Exception as e:
        print(f"Error verifying data: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting restaurant data seeding...")
    
    # Seed the data
    success = seed_restaurant_data()
    
    if success:
        print("\nVerifying created data...")
        verify_restaurant_data()
        print("\nRestaurant seeding completed successfully!")
    else:
        print("\nRestaurant seeding failed!")