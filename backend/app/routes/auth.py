"""
Authentication routes for hermes-agent SaaS.
"""
from fastapi import APIRouter, HTTPException, Depends
from gotrue.errors import AuthError
from supabase import create_client, Client
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..config import settings
from ..database import get_supabase_admin, get_supabase_anon

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class SignUpResponse(BaseModel):
    user_id: str
    email: str
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None


@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest):
    """Register a new user."""
    try:
        supabase: Client = get_supabase_admin()
        
        # Create auth user
        auth_response = supabase.auth.sign_up(
            credentials={
                "email": request.email,
                "password": request.password,
            },
            options={
                "data": {
                    "display_name": request.display_name or request.email.split("@")[0]
                }
            }
        )
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        return SignUpResponse(
            user_id=auth_response.user.id,
            email=auth_response.user.email,
            message="User registered successfully. Please check your email for confirmation."
        )
    except AuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login with email and password."""
    try:
        supabase: Client = get_supabase_anon()
        
        auth_response = supabase.auth.sign_in_with_password(
            credentials={
                "email": request.email,
                "password": request.password,
            }
        )
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return LoginResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            expires_in=auth_response.expires_in,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
            }
        )
    except AuthError as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/logout")
async def logout(token: str):
    """Logout the current user."""
    try:
        supabase: Client = get_supabase_admin()
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: str):
    """Get the current authenticated user."""
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization.replace("Bearer ", "")
        supabase: Client = get_supabase_admin()
        
        # Get user from token
        user = supabase.auth.get_user(token)
        
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return UserResponse(
            id=user.user.id,
            email=user.user.email,
            display_name=user.user.user_metadata.get("display_name")
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh the access token."""
    try:
        supabase: Client = get_supabase_anon()
        
        session = supabase.auth.refresh_session(refresh_token)
        
        if not session.session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "expires_in": session.expires_in,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")