"""
API Key management routes for hermes-agent SaaS.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List
from uuid import UUID

from pydantic import BaseModel
from ..database import get_supabase_admin, hash_api_key, generate_api_key
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/keys", tags=["API Keys"])


class APIKeyCreate(BaseModel):
    name: str


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str  # First 8 chars for identification
    created_at: str
    expires_at: str | None = None
    last_used_at: str | None = None


class APIKeyCreatedResponse(BaseModel):
    """Response when creating a key - only shows the full key once."""
    id: str
    name: str
    full_key: str  # Only returned on creation!
    key_prefix: str
    created_at: str
    expires_at: str | None = None


@router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(user_id: str = Depends(get_current_user_id)):
    """List all API keys for the current user."""
    try:
        supabase = get_supabase_admin()
        
        response = supabase.table("api_keys").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        keys = []
        for key in response.data:
            keys.append(APIKeyResponse(
                id=key["id"],
                name=key["name"],
                key_prefix=key["key_hash"][:8],  # First 8 chars of hash for identification
                created_at=key["created_at"],
                expires_at=key.get("expires_at"),
                last_used_at=key.get("last_used_at"),
            ))
        
        return keys
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list API keys: {str(e)}")


@router.post("", response_model=APIKeyCreatedResponse)
async def create_api_key(
    key_data: APIKeyCreate,
    user_id: str = Depends(get_current_user_id),
    expires_days: int = 365
):
    """Create a new API key. Returns the full key only once!"""
    try:
        supabase = get_supabase_admin()
        
        # Generate new key
        full_key = generate_api_key()
        key_hash = hash_api_key(full_key)
        
        # Calculate expiration
        expires_at = None
        if expires_days > 0:
            from datetime import datetime, timedelta
            expires_at = (datetime.utcnow() + timedelta(days=expires_days)).isoformat()
        
        insert_data = {
            "user_id": user_id,
            "name": key_data.name,
            "key_hash": key_hash,
            "expires_at": expires_at,
        }
        
        response = supabase.table("api_keys").insert(insert_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create API key")
        
        created_key = response.data[0]
        
        return APIKeyCreatedResponse(
            id=created_key["id"],
            name=created_key["name"],
            full_key=full_key,  # Only returned on creation!
            key_prefix=full_key[:8],
            created_at=created_key["created_at"],
            expires_at=created_key.get("expires_at"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create API key: {str(e)}")


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: UUID,
    user_id: str = Depends(get_current_user_id)
):
    """Revoke (delete) an API key."""
    try:
        supabase = get_supabase_admin()
        
        # Verify ownership
        response = supabase.table("api_keys").select("id").eq("id", str(key_id)).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        supabase.table("api_keys").delete().eq("id", str(key_id)).execute()
        
        return {"message": "API key revoked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke API key: {str(e)}")


def verify_api_key(supabase, key: str) -> str | None:
    """
    Verify an API key and return the user_id if valid.
    Returns None if invalid or expired.
    """
    try:
        key_hash = hash_api_key(key)
        
        response = supabase.table("api_keys").select("*").eq("key_hash", key_hash).execute()
        
        if not response.data:
            return None
        
        api_key = response.data[0]
        
        # Check expiration
        if api_key.get("expires_at"):
            from datetime import datetime
            if datetime.utcnow() > datetime.fromisoformat(api_key["expires_at"]):
                return None
        
        # Update last used timestamp
        supabase.table("api_keys").update({
            "last_used_at": datetime.utcnow().isoformat()
        }).eq("id", api_key["id"]).execute()
        
        return api_key["user_id"]
    except Exception:
        return None