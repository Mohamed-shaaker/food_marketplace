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

app = FastAPI(title=settings.PROJECT_NAME)
logger = logging.getLogger(__name__)

# --- CORS CONFIGURATION ---
# Local development and default URLs
local_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://tibibu-backend.onrender.com",
    "https://tibibu-frontend.vercel.app",
]

# Safely get ALLOWED_ORIGINS from settings, fallback to standard os.getenv
allowed_origins_env = getattr(settings, "ALLOWED_ORIGINS", os.getenv("ALLOWED_ORIGINS", ""))

if allowed_origins_env:
    env_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    env_origins = []

# Combine local origins with environment-provided origins and remove duplicates
origins = list(dict.fromkeys(local_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, DELETE, etc.
    allow_headers=["*"],  # Allows all headers
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
    # Step 1: Ensure all tables are created
    logger.info("[Bootstrap] Creating database tables...")
    try:
        # This is safe to run on every startup. It only creates tables that don't exist.
        await asyncio.to_thread(Base.metadata.create_all, bind=engine)
        logger.info("[Bootstrap] Tables created successfully.")
    except Exception:
        logger.exception("[Bootstrap] Table creation failed.")
        return  # Do not proceed if table creation fails

    # FORCE: Always run bootstrap for this demo environment to ensure restaurants exist
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