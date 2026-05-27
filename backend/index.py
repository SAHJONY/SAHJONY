"""
Vercel Python Serverless Function wrapper for FastAPI backend
Minimal functional version without router imports (to avoid env var loading issues)
"""
import os
import sys

# Add this directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables from Vercel
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://rtwwnxipchwgwegtjqco.supabase.co')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://frontend-ten-pi-73.vercel.app')
DEBUG = os.getenv('DEBUG', 'false')
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-change-in-production')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['FRONTEND_URL'] = FRONTEND_URL
os.environ['DEBUG'] = DEBUG
os.environ['JWT_SECRET'] = JWT_SECRET
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform - Backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
        "message": "Backend is running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "supabase_configured": bool(SUPABASE_URL),
        "frontend_url": FRONTEND_URL
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "info": "/api"
        }
    }

@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "hermes-agent-saas-api"}

@app.post("/api/auth/signup")
async def signup(email: str = "", password: str = ""):
    return {"message": "Signup endpoint - configure Supabase credentials in Vercel dashboard", "email": email}

@app.post("/api/auth/login")
async def login(email: str = "", password: str = ""):
    return {"message": "Login endpoint - configure Supabase credentials in Vercel dashboard", "email": email}

@app.get("/api/auth/me")
async def me():
    return {"message": "Auth endpoint - configure Supabase credentials in Vercel dashboard"}

# Try to load full routers - if they fail, continue with minimal version
try:
    # Attempt to load full backend routers
    from app.config import settings
    from app.routes import auth_router, agents_router, conversations_router, chat_router
    app.include_router(auth_router, prefix="/api")
    app.include_router(agents_router, prefix="/api")
    app.include_router(conversations_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")
    sys.stderr.write("Full backend routers loaded successfully\n")
except Exception as e:
    sys.stderr.write(f"Full backend not available: {type(e).__name__}: {e}\n")
    sys.stderr.write("Running in minimal mode - basic endpoints only\n")