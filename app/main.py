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
# Parse ALLOWED_ORIGINS from env var (comma-separated list).
# Falls back to wildcard only when no origins are configured (local dev).
_raw_origins = settings.ALLOWED_ORIGINS or ""
_origin_list = [o.strip() for o in _raw_origins.split(",") if o.strip()]
allow_origins = _origin_list if _origin_list else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=bool(_origin_list),   # True only when explicit domains set
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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