"""
Vercel Python Serverless Function wrapper for FastAPI backend
With direct auth endpoints for testing Supabase connection
"""
import os
import sys

# Add this directory to path - /var/task on Vercel
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables from Vercel
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', '*')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
JWT_SECRET = os.getenv('JWT_SECRET', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['FRONTEND_URL'] = FRONTEND_URL
os.environ['DEBUG'] = 'true' if DEBUG else 'false'
os.environ['JWT_SECRET'] = JWT_SECRET
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform - Backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if FRONTEND_URL == "*" else [FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test Supabase connection
supabase_client = None
supabase_status = "not_configured"

if SUPABASE_URL and SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        supabase_status = "connected"
    except Exception as e:
        supabase_status = f"error: {str(e)}"

# Models for auth endpoints
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
        "status": "operational",
        "supabase_status": supabase_status,
        "message": "Backend is running with Supabase" if supabase_client else "Backend is running without Supabase"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if supabase_client else "degraded",
        "supabase_status": supabase_status
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "status": "operational" if supabase_client else "limited",
        "supabase_status": supabase_status
    }

@app.get("/api/health")
async def api_health():
    return {"status": "healthy" if supabase_client else "degraded", "supabase_status": supabase_status}

@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    """Register a new user."""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        auth_response = supabase_client.auth.sign_up(
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
    """Login with email and password."""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        auth_response = supabase_client.auth.sign_in_with_password(
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
async def me(authorization: str = None):
    """Get current user."""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        user = supabase_client.auth.get_user(token)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "id": user.user.id,
            "email": user.user.email,
            "display_name": user.user.user_metadata.get("display_name")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Try to load full routers from app.routes
loaded_routers = []
try:
    from app.routes import auth_router, agents_router, conversations_router, chat_router
    app.include_router(auth_router, prefix="/api")
    app.include_router(agents_router, prefix="/api")
    app.include_router(conversations_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")
    loaded_routers = ['auth', 'agents', 'conversations', 'chat']
    sys.stderr.write(f"Full routers loaded: {loaded_routers}\n")
except Exception as e:
    sys.stderr.write(f"Router imports failed: {type(e).__name__}: {e}\n")
    sys.stderr.write("Running with direct auth endpoints only\n")