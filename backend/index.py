"""
Vercel Python Serverless Function wrapper for FastAPI backend
Robust version with individual router loading and error handling
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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform - Backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != '*' else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track mode and loaded routers
MODE = "minimal"
loaded_routers = []
config_status = {"loaded": False, "error": None}

# Step 1: Try loading config
try:
    from app.config import settings
    config_status["loaded"] = True
    sys.stderr.write(f"Config loaded: supabase_url={settings.supabase_url[:30]}...\n")
except Exception as e:
    config_status["error"] = f"{type(e).__name__}: {e}"
    sys.stderr.write(f"Config import failed: {config_status['error']}\n")

# Step 2: Load routers individually
router_configs = [
    ('auth', 'auth_router', '/auth'),
    ('agents', 'agents_router', '/agents'),
    ('conversations', 'conversations_router', '/conversations'),
    ('chat', 'chat_router', '/chat'),
    ('keys', 'keys_router', '/keys'),
    ('support', 'support_router', '/support'),
    ('admin', 'admin_router', '/admin'),
    ('twenty', 'twenty_router', '/twenty'),
]

for module_name, router_name, prefix in router_configs:
    if config_status["loaded"]:
        try:
            module = __import__(f'app.routes.{module_name}', fromlist=[router_name])
            router = getattr(module, router_name)
            app.include_router(router, prefix="/api")
            loaded_routers.append(module_name)
            sys.stderr.write(f"Loaded router: {module_name}\n")
        except Exception as e:
            sys.stderr.write(f"Router {module_name} failed: {type(e).__name__}: {e}\n")

# Update mode based on what loaded
if config_status["loaded"] and len(loaded_routers) > 0:
    MODE = "full"
    sys.stderr.write(f"Backend running in FULL mode with {len(loaded_routers)} routers\n")
else:
    sys.stderr.write(f"Backend running in MINIMAL mode - config_status: {config_status}, loaded: {len(loaded_routers)}\n")

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy" if MODE == "full" else "degraded",
        "mode": MODE,
        "loaded_routers": loaded_routers,
        "message": "Backend is running" if MODE == "full" else f"Backend is running in minimal mode - {len(loaded_routers)} routers loaded, full functionality requires Supabase configuration"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if MODE == "full" else "degraded",
        "mode": MODE,
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_ANON_KEY),
        "loaded_routers": loaded_routers,
        "config_loaded": config_status["loaded"]
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
            "auth": "/api/auth" if "auth" in loaded_routers else "not_available",
            "agents": "/api/agents" if "agents" in loaded_routers else "not_available",
            "conversations": "/api/conversations" if "conversations" in loaded_routers else "not_available",
            "chat": "/api/chat" if "chat" in loaded_routers else "not_available"
        }
    }

@app.get("/api/health")
async def api_health():
    return {
        "status": "healthy" if MODE == "full" else "degraded",
        "mode": MODE,
        "loaded_routers": loaded_routers
    }