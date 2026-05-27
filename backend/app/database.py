"""
Database connection and utilities for Supabase.
"""
from supabase import create_client, Client
from postgrest.exceptions import APIError
from .config import settings
from typing import Optional, Dict, Any, List
import hashlib
import secrets


# Global Supabase client instance
_supabase_admin: Optional[Client] = None
_supabase_anon: Optional[Client] = None


def get_supabase_admin() -> Client:
    """Get Supabase admin client (service role)."""
    global _supabase_admin
    if _supabase_admin is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError("Supabase configuration missing")
        _supabase_admin = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    return _supabase_admin


def get_supabase_anon() -> Client:
    """Get Supabase anonymous client."""
    global _supabase_anon
    if _supabase_anon is None:
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise RuntimeError("Supabase configuration missing")
        _supabase_anon = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
    return _supabase_anon


def hash_api_key(key: str) -> str:
    """Hash an API key using SHA256."""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key() -> str:
    """Generate a new random API key."""
    return f"hsa_{secrets.token_urlsafe(32)}"


class DatabaseError(Exception):
    """Custom exception for database errors."""
    pass


def handle_db_error(e: Exception, operation: str) -> None:
    """Log and re-raise database errors with context."""
    raise DatabaseError(f"Database error during {operation}: {str(e)}") from e