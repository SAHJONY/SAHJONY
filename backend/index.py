"""
Vercel Python Serverless Function wrapper for FastAPI backend
Imports components directly to avoid relative import issues
"""
import os
import sys

# Add this directory to path so 'from app.config' works (on Vercel we're in the backend dir)
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables from Vercel
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://rtwwnxipchwgwegtjqco.supabase.co')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://frontend-ten-pi-73.vercel.app')
DEBUG = os.getenv('DEBUG', 'false')
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-change-in-production')

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['FRONTEND_URL'] = FRONTEND_URL
os.environ['DEBUG'] = DEBUG
os.environ['JWT_SECRET'] = JWT_SECRET

# Import FastAPI and create app
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Try importing from app directly (not backend.app since we're already in backend/)
import sys
import os
try:
    from app.config import settings
    from app.routes import (
        auth_router, agents_router, conversations_router,
        chat_router, keys_router, support_router, admin_router, twenty_router
    )
    HAS_FULL_BACKEND = True
    sys.stderr.write(f"DEBUG: Successfully loaded backend\n")
except Exception as e:
    HAS_FULL_BACKEND = False
    settings = None
    sys.stderr.write(f"DEBUG: Import failed: {type(e).__name__}: {e}\n")
    sys.stderr.write(f"DEBUG: __file__ = {__file__}\n")
    sys.stderr.write(f"DEBUG: sys.path = {sys.path}\n")

@asynccontextmanager
async def lifespan(app: FastAPI):
    if HAS_FULL_BACKEND:
        print("Starting Hermes Agent SaaS Backend")
        print(f"Supabase URL: {SUPABASE_URL[:20]}...")
    yield
    print("Shutting down backend")

# Create FastAPI app
app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers if available
if HAS_FULL_BACKEND:
    app.include_router(auth_router, prefix="/api")
    app.include_router(agents_router, prefix="/api")
    app.include_router(conversations_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")
    app.include_router(keys_router, prefix="/api")
    app.include_router(support_router, prefix="/api")
    app.include_router(admin_router, prefix="/api")
    app.include_router(twenty_router, prefix="/api")

@app.get("/")
async def root():
    if HAS_FULL_BACKEND:
        return {"service": "hermes-agent-saas", "version": "0.1.0", "status": "healthy"}
    return {"service": "hermes-agent-saas", "version": "0.1.0", "status": "healthy", "mode": "minimal"}

@app.get("/health")
async def health():
    if HAS_FULL_BACKEND:
        return {"status": "healthy", "components": {"api": "healthy", "backend": "full"}}
    return {"status": "healthy", "components": {"api": "healthy", "backend": "minimal"}}

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "endpoints": ["/api/auth", "/api/agents", "/api/conversations", "/api/chat"]
    }