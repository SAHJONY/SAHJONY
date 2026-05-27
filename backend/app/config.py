"""
Configuration management for hermes-agent SaaS backend.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "")
    
    # JWT
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7  # 7 days
    
    # Hermes Agent
    hermes_agent_path: Optional[str] = os.getenv("HERMES_AGENT_PATH", None)
    
    # Twenty CRM Integration
    twenty_api_url: str = os.getenv("TWENTY_API_URL", "https://api.twenty.com/graphql")
    twenty_api_key: Optional[str] = os.getenv("TWENTY_API_KEY", None)
    
    # CORS
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()