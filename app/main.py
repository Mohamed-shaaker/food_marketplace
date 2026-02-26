from fastapi import FastAPI
from app.api import auth, orders, webhooks
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Include the routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])

@app.get("/health")
def health_check():
    """Simple health check endpoint for Docker/Kubernetes."""
    return {"status": "healthy"}