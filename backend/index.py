"""
Vercel Python Serverless Function wrapper for FastAPI backend
Minimal functional version - falls back to basic endpoints when full router imports fail
"""
import os
import sys

# Add this directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables from Vercel
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', '*')
DEBUG = os.getenv('DEBUG', 'false')
JWT_SECRET = os.getenv('JWT_SECRET', '')
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

# Track mode
MODE = "minimal"
loaded_routers = []

# Try to load full backend
try:
    from app.config import settings
    from app.routes import auth_router, agents_router, conversations_router, chat_router, keys_router, support_router, admin_router, twenty_router
    
    app.include_router(auth_router, prefix="/api")
    app.include_router(agents_router, prefix="/api")
    app.include_router(conversations_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")
    app.include_router(keys_router, prefix="/api")
    app.include_router(support_router, prefix="/api")
    app.include_router(admin_router, prefix="/api")
    app.include_router(twenty_router, prefix="/api")
    
    MODE = "full"
    loaded_routers = ['auth', 'agents', 'conversations', 'chat', 'keys', 'support', 'admin', 'twenty']
    sys.stderr.write(f"Full backend loaded successfully with {len(loaded_routers)} routers\n")
except Exception as e:
    sys.stderr.write(f"Full backend not available: {type(e).__name__}: {e}\n")
    sys.stderr.write("Running in minimal mode - basic endpoints only\n")

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
        "mode": MODE,
        "message": "Backend is running" if MODE == "full" else "Backend is running in minimal mode - configure Vercel env vars for full functionality"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if MODE == "full" else "degraded",
        "mode": MODE,
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_ANON_KEY),
        "loaded_routers": loaded_routers
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "status": "operational" if MODE == "full" else "minimal",
        "mode": MODE,
        "loaded_routers": loaded_routers,
        "endpoints": {
            "health": "/health",
            "info": "/api",
            "auth": "/api/auth" if MODE == "full" else "not_available",
            "agents": "/api/agents" if MODE == "full" else "not_available"
        }
    }

@app.get("/api/health")
async def api_health():
    return {
        "status": "healthy" if MODE == "full" else "degraded",
        "mode": MODE
    }