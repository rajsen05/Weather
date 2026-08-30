import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkyGuard AI"
    TAGLINE: str = "From Raw Weather Data to Trusted Weather Intelligence"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    JWT_SECRET: str = "skyguard-meteorological-super-secure-secret-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database (defaults to SQLite local zero-setup with full MySQL PyMySQL support)
    DATABASE_URL: str = "sqlite:///./skyguard.db"
    
    # Weather Providers
    PRIMARY_PROVIDER: str = "open_meteo" # Options: open_meteo, open_weather, imd
    OPENMETEO_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPENMETEO_GEOCODING_URL: str = "https://geocoding-api.open-meteo.com/v1/search"
    
    OPENWEATHER_API_KEY: Optional[str] = None
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"
    
    IMD_API_KEY: Optional[str] = None
    IMD_ENDPOINT: Optional[str] = None
    
    # Scheduler & Polling
    WEATHER_REFRESH_SECONDS: int = 60
    DATA_STALE_THRESHOLD_SECONDS: int = 300 # 5 minutes
    
    # ML & Anomaly Parameters
    ISOLATION_FOREST_CONTAMINATION: float = 0.05
    Z_SCORE_THRESHOLD: float = 3.0
    VERIFICATION_WINDOW_SIZE: int = 3
    CONSENSUS_AGREEMENT_THRESHOLD: float = 0.85 # 85% agreement
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow"
    )

settings = Settings()
