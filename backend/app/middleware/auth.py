"""
Authentication middleware for hermes-agent SaaS.
"""
from fastapi import HTTPException, Header
from typing import Optional
from gotrue.errors import AuthError
from ..database import get_supabase_admin
from ..routes.keys import verify_api_key


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> str:
    """
    Extract and verify user ID from either:
    1. JWT Bearer token in Authorization header
    2. API key in X-API-Key header
    
    Returns the user_id string.
    """
    user_id = None
    
    # Try Bearer token first
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format. Use: Bearer <token>"
            )
        
        token = authorization.replace("Bearer ", "")
        
        try:
            supabase = get_supabase_admin()
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except AuthError as e:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        except Exception as e:
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Try API key
    elif x_api_key:
        try:
            supabase = get_supabase_admin()
            user_id = verify_api_key(supabase, x_api_key)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid or expired API key")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail="API key verification failed")
    
    else:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication. Provide either Authorization: Bearer <token> or X-API-Key: <key>"
        )
    
    return user_id


def verify_bearer_token(token: str) -> Optional[str]:
    """
    Verify a JWT Bearer token and return the user_id.
    Returns None if invalid.
    
    Note: This is a synchronous function. For async contexts, consider
    using an async Supabase client wrapper.
    """
    try:
        supabase = get_supabase_admin()
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        return None