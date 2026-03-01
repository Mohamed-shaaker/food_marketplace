from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- NEW: Import this
from app.api import auth, orders, webhooks, restaurants
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# --- CORS CONFIGURATION ---
# This allows your React frontend (5173) to talk to this Backend (8000)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

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
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}