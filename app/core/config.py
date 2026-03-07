from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Food Marketplace V1"
    ENV: str = "dev"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    WEBHOOK_SECRET: str
    PAYMENT_PROVIDER: str = "flutterwave"
    APP_BASE_URL: str = "http://localhost:8000"
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    FLW_BASE_URL: str = "https://api.flutterwave.com"
    FLW_PUBLIC_KEY: str = ""
    FLW_SECRET_KEY: str = ""
    FLW_SECRET_HASH: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
