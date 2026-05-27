"""
Vercel Python Serverless Function wrapper for FastAPI backend
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

# Import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Try importing from app
HAS_FULL_BACKEND = False
app_components = {}

try:
    from app.config import settings
    app_components['config'] = settings
    HAS_FULL_BACKEND = True
except Exception as e:
    sys.stderr.write(f"Config import failed: {type(e).__name__}: {e}\n")
    from app.config import Settings
    settings = Settings()
    app_components['config'] = settings

# Try importing routers individually
router_names = ['auth', 'agents', 'conversations', 'chat', 'keys', 'support', 'admin', 'twenty']
loaded_routers = []

if HAS_FULL_BACKEND:
    for name in router_names:
        try:
            from app.routes import globals()[f'{name}_router']
            loaded_routers.append(globals()[f'{name}_router'])
            sys.stderr.write(f"Loaded router: {name}\n")
        except Exception as e:
            sys.stderr.write(f"Router {name} failed: {type(e).__name__}: {e}\n")

# Create FastAPI app
app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform" if HAS_FULL_BACKEND else "Backend deployment in progress",
    version="0.1.0",
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

# Include routers if loaded
for router in loaded_routers:
    app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
        "mode": "full" if HAS_FULL_BACKEND else "setup",
        "routers_loaded": len(loaded_routers),
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if HAS_FULL_BACKEND else "degraded",
        "mode": "full" if HAS_FULL_BACKEND else "setup",
        "components": {
            "api": "healthy",
            "database": "configured" if SUPABASE_URL else "missing"
        }
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "status": "operational" if HAS_FULL_BACKEND else "setup_required",
        "endpoints": ["/api/auth", "/api/agents", "/api/conversations", "/api/chat", "/api/keys", "/api/support", "/api/admin", "/api/twenty"] if HAS_FULL_BACKEND else [],
        "frontend_url": FRONTEND_URL,
    }