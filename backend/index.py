"""
Vercel Python Serverless Function wrapper for FastAPI backend
Minimal working version - auth endpoints embedded directly
"""
import os
import sys

# Add this directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', '*')
JWT_SECRET = os.getenv('JWT_SECRET', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['FRONTEND_URL'] = FRONTEND_URL
os.environ['JWT_SECRET'] = JWT_SECRET
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if FRONTEND_URL == "*" else [FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config status
SUPABASE_CONFIGURED = bool(SUPABASE_URL and SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY)

# Auth models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "operational" if SUPABASE_CONFIGURED else "degraded",
        "supabase_configured": SUPABASE_CONFIGURED
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if SUPABASE_CONFIGURED else "degraded",
        "supabase_configured": SUPABASE_CONFIGURED
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "status": "operational" if SUPABASE_CONFIGURED else "degraded",
        "endpoints": {
            "auth": "/api/auth/signup, /api/auth/login, /api/auth/me",
            "agents": "/api/agents (when configured)",
            "conversations": "/api/conversations (when configured)"
        }
    }

@app.get("/api/health")
async def api_health():
    return {"status": "healthy" if SUPABASE_CONFIGURED else "degraded"}

@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    if not SUPABASE_CONFIGURED:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        auth_response = supabase.auth.sign_up(
            credentials={"email": request.email, "password": request.password},
            options={"data": {"display_name": request.display_name or request.email.split("@")[0]}}
        )
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        return {
            "user_id": auth_response.user.id,
            "email": auth_response.user.email,
            "message": "User registered successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    if not SUPABASE_CONFIGURED:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        auth_response = supabase.auth.sign_in_with_password(
            credentials={"email": request.email, "password": request.password}
        )
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "expires_in": auth_response.expires_in,
            "user": {"id": auth_response.user.id, "email": auth_response.user.email}
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/api/auth/me")
async def me(authorization: Optional[str] = None):
    if not SUPABASE_CONFIGURED:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        user = supabase.auth.get_user(token)
        
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "id": user.user.id,
            "email": user.user.email,
            "display_name": user.user.user_metadata.get("display_name")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")