"""
User models for hermes-agent SaaS.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class User(BaseModel):
    """Supabase auth user representation."""
    id: UUID
    email: EmailStr
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProfile(BaseModel):
    """User profile with additional information."""
    id: UUID
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    settings: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileCreate(BaseModel):
    """Model for creating a user profile."""
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None