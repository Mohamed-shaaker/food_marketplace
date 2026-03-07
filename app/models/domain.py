from decimal import Decimal
from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserRole(str, PyEnum):
    CUSTOMER = "customer"
    RESTAURANT = "restaurant"
    OWNER = "restaurant"
    DRIVER = "driver"
    ADMIN = "admin"

class OrderStatus(str, PyEnum):
    PENDING = "PENDING"
    PAID = "PAID"
    PREPARING = "PREPARING"
    READY = "READY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
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
    driver_profile = relationship("Driver", back_populates="user", uselist=False)


class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    vehicle_type = Column(String, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="driver_profile")

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
    price = Column(Numeric(12, 2), nullable=False)
    restaurant = relationship("Restaurant", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    idempotency_key = Column(String, unique=True, nullable=True)
    
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    payment_status = Column(String, default="pending") # e.g., pending, completed, failed
    delivery_fee = Column(Float, default=2.0)
    restaurant_accepted_at = Column(DateTime, nullable=True)
    ready_for_pickup_at = Column(DateTime, nullable=True)
    
    # Financial snapshots (Strict Logic)
    total_amount = Column(Numeric(12, 2), nullable=False)         # Item subtotal
    platform_fee = Column(Numeric(12, 2), default=Decimal("1.50"), nullable=False)
    commission_amount = Column(Numeric(12, 2), nullable=False)
    restaurant_payout = Column(Numeric(12, 2), nullable=False)
    
    status = Column(
        Enum(OrderStatus, name="orderstatus", create_type=False),
        default=OrderStatus.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("OrderItem", back_populates="order")
    payment_transactions = relationship(
        "PaymentTransaction",
        back_populates="order",
        order_by="PaymentTransaction.created_at",
    )
    status_history = relationship(
        "OrderStatusHistory",
        back_populates="order",
        order_by="OrderStatusHistory.changed_at",
    )

    @property
    def payment_reference(self):
        if not self.payment_transactions:
            return None
        return self.payment_transactions[-1].payment_reference


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    id = Column(Integer, primary_key=True, index=True)
    payment_reference = Column(String, unique=True, nullable=False, index=True)
    provider_reference = Column(String, unique=True, nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(String, nullable=False)
    verified_amount = Column(Numeric(12, 2), nullable=True)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    order = relationship("Order", back_populates="payment_transactions")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    order = relationship("Order", back_populates="status_history")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Numeric(12, 2), nullable=False)
    order = relationship("Order", back_populates="items")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Numeric(12, 2), default=Decimal("0.00"))
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_type = Column(String) # 'credit' or 'debit'
    reference_id = Column(String) # e.g., "order_123"
    created_at = Column(DateTime, default=datetime.utcnow)
    wallet = relationship("Wallet", back_populates="transactions")
