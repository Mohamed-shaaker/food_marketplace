import asyncio
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import admin_ops, auth, driver_ops, orders, payments, restaurant_ops, restaurants, webhooks
from app.core.config import settings
from app.core.database import engine
from app.models.domain import Base
from app.services.bootstrap import run_demo_bootstrap

app = FastAPI(title=settings.PROJECT_NAME, redirect_slashes=False)
logger = logging.getLogger(__name__)

# --- CORS CONFIGURATION ---
# Using wildcard origin to rule out any domain mismatch as root cause.
# NOTE: allow_origins=["*"] and allow_credentials=True cannot be combined;
# we drop allow_credentials here while debugging, then restore once the
# domain-specific list is re-enabled.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------

# Include the routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(admin_ops.router, prefix="/api/admin", tags=["AdminOps"])
app.include_router(restaurant_ops.router, prefix="/api/restaurant-ops", tags=["RestaurantOps"])
app.include_router(driver_ops.router, prefix="/api/driver-ops", tags=["DriverOps"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])

@app.on_event("startup")
async def bootstrap_demo_environment():
    logger.info("[Bootstrap] Creating database tables...")
    try:
        await asyncio.to_thread(Base.metadata.create_all, bind=engine)
        logger.info("[Bootstrap] Tables created successfully.")
    except Exception:
        logger.exception("[Bootstrap] Table creation failed.")
        return  

    logger.info("[Bootstrap] Running data seeder (Creating Restaurants & Menus)...")
    try:
        await asyncio.to_thread(run_demo_bootstrap)
    except Exception:
        logger.exception("Demo bootstrap failed during startup")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/", include_in_schema=False)
def health_check_slash():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"status": "ok", "service": settings.PROJECT_NAME}