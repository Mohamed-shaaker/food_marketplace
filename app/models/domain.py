from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserRole(str, PyEnum):
    CUSTOMER = "customer"
    RESTAURANT = "restaurant"
    ADMIN = "admin"

class OrderStatus(str, PyEnum):
    PENDING = "PENDING"
    PAID = "PAID"
    PREPARING = "PREPARING"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    restaurants = relationship("Restaurant", back_populates="owner")

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    commission_rate = Column(Float, default=0.10)
    image_url = Column(String, nullable=True)
    
    owner = relationship("User", back_populates="restaurants")
    menu_items = relationship("MenuItem", back_populates="restaurant")
class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    restaurant = relationship("Restaurant", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    
    # NEW: Added driver_id and payment_status from your implementation plan
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    payment_status = Column(String, default="pending") # e.g., pending, completed, failed
    
    # Financial snapshots (Strict Logic)
    total_amount = Column(Float, nullable=False)      # What customer pays
    commission_amount = Column(Float, nullable=False) # 10% Platform fee
    payout_amount = Column(Float, nullable=False)     # What restaurant gets
    
    status = Column(
        Enum(OrderStatus, name="orderstatus", create_type=False),
        default=OrderStatus.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("OrderItem", back_populates="order")
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Float, default=0.0)
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    amount = Column(Float, nullable=False)
    transaction_type = Column(String) # 'credit' or 'debit'
    reference_id = Column(String) # e.g., "order_123"
    created_at = Column(DateTime, default=datetime.utcnow)
    wallet = relationship("Wallet", back_populates="transactions")
