import sys
from sqlalchemy import text
from app.core.database import engine
from app.core import security
from app.models.domain import UserRole

def force_seed():
    print("Hashing password...")
    # This uses our new SHA-256 pre-hashed bcrypt mechanism
    hashed_pw = security.get_password_hash("password123")
    
    print("Executing raw SQL seed...")
    with engine.begin() as conn:
        # Check if user already exists
        result = conn.execute(text("SELECT id FROM users WHERE email = 'owner@pizza.com'")).fetchone()
        if result:
            print("User already exists, updating password and role...")
            conn.execute(
                text("UPDATE users SET hashed_password = :hash, role = :role WHERE email = 'owner@pizza.com'"),
                {"hash": hashed_pw, "role": "OWNER"}
            )
        else:
            print("Inserting new user...")
            conn.execute(
                text("INSERT INTO users (email, hashed_password, role) VALUES (:email, :hash, :role)"),
                {"email": "owner@pizza.com", "hash": hashed_pw, "role": "OWNER"}
            )
    print("Seed complete. User owner@pizza.com successfully created/updated.")

if __name__ == "__main__":
    force_seed()
