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

# Try importing config
try:
    from app.config import settings
    sys.stderr.write("Config loaded\n")
except Exception as e:
    sys.stderr.write(f"Config failed: {type(e).__name__}: {e}\n")
    settings = None

# Try importing routers - hardcoded one at a time to find issues
routers = []
router_names = []

try:
    from app.routes.auth import router as auth_r
    routers.append(auth_r)
    router_names.append('auth')
    sys.stderr.write("Auth loaded\n")
except Exception as e:
    sys.stderr.write(f"Auth failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.agents import router as agents_r
    routers.append(agents_r)
    router_names.append('agents')
    sys.stderr.write("Agents loaded\n")
except Exception as e:
    sys.stderr.write(f"Agents failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.conversations import router as conv_r
    routers.append(conv_r)
    router_names.append('conversations')
    sys.stderr.write("Conversations loaded\n")
except Exception as e:
    sys.stderr.write(f"Conversations failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.chat import router as chat_r
    routers.append(chat_r)
    router_names.append('chat')
    sys.stderr.write("Chat loaded\n")
except Exception as e:
    sys.stderr.write(f"Chat failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.keys import router as keys_r
    routers.append(keys_r)
    router_names.append('keys')
    sys.stderr.write("Keys loaded\n")
except Exception as e:
    sys.stderr.write(f"Keys failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.support import router as support_r
    routers.append(support_r)
    router_names.append('support')
    sys.stderr.write("Support loaded\n")
except Exception as e:
    sys.stderr.write(f"Support failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.admin import router as admin_r
    routers.append(admin_r)
    router_names.append('admin')
    sys.stderr.write("Admin loaded\n")
except Exception as e:
    sys.stderr.write(f"Admin failed: {type(e).__name__}: {e}\n")

try:
    from app.routes.twenty_crm import router as twenty_r
    routers.append(twenty_r)
    router_names.append('twenty')
    sys.stderr.write("Twenty loaded\n")
except Exception as e:
    sys.stderr.write(f"Twenty failed: {type(e).__name__}: {e}\n")

# Create FastAPI app
app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform",
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

# Include routers
for router in routers:
    app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
        "routers_loaded": router_names,
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "routers": router_names,
    }

@app.get("/api")
async def api_info():
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "loaded_routers": router_names,
    }