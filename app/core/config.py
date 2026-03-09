from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Food Marketplace V1"
    ENV: str = "dev"
    DATABASE_URL: str
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    WEBHOOK_SECRET: str = ""
    PAYMENT_PROVIDER: str = "flutterwave"
    APP_BASE_URL: str = "http://localhost:8000"
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    FLW_BASE_URL: str = "https://api.flutterwave.com"
    FLW_PUBLIC_KEY: str = ""
    FLW_SECRET_KEY: str = ""
    FLW_SECRET_HASH: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (
            init_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )


settings = Settings()
