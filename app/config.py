from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SpaceOps API"
    APP_ENV: str = "local"
    DEBUG: bool = True

    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/spaceops"

    # Cache / Message Broker
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # API Keys
    NASA_API_KEY: str = "DEMO_KEY"

    # Groq Settings
    GROQ_API_KEY: str = "your_groq_api_key_here"
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
