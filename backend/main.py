"""
Hermes Agent SaaS - FastAPI Backend
Main application entry point.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

from .config import settings
from .routes import (
    auth_router,
    agents_router,
    conversations_router,
    chat_router,
    keys_router,
    support_router,
    admin_router,
    twenty_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    logger.info("Starting Hermes Agent SaaS Backend")
    logger.info(f"Supabase URL: {settings.supabase_url[:20]}..." if settings.supabase_url else "No Supabase URL configured")
    logger.info(f"Frontend URL: {settings.frontend_url}")
    
    # Validate configuration
    if not settings.supabase_url:
        logger.warning("SUPABASE_URL not set - some features may not work")
    if not settings.supabase_anon_key:
        logger.warning("SUPABASE_ANON_KEY not set - anonymous features disabled")
    
    yield
    
    logger.info("Shutting down Hermes Agent SaaS Backend")


# Create FastAPI app
app = FastAPI(
    title="Hermes Agent SaaS API",
    description="Multi-user AI Agent Platform powered by hermes-agent",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
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
    """Root endpoint - health check."""
    return {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    health_status = {
        "service": "hermes-agent-saas",
        "version": "0.1.0",
        "status": "healthy",
        "components": {
            "api": "healthy",
            "database": "unknown",  # Would check Supabase connection
        }
    }
    
    # Could add Supabase health check here
    try:
        from .database import get_supabase_admin
        supabase = get_supabase_admin()
        # Simple query to verify connection
        supabase.table("user_profiles").select("id").limit(1).execute()
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "name": "Hermes Agent SaaS API",
        "version": "0.1.0",
        "description": "Multi-user AI Agent Platform powered by hermes-agent",
        "endpoints": {
            "auth": "/api/auth",
            "agents": "/api/agents",
            "conversations": "/api/conversations",
            "chat": "/api/chat",
            "api_keys": "/api/keys",
            "support": "/api/support",
            "admin": "/api/admin",
            "twenty": "/api/twenty",
            "websocket": "/api/ws/chat/{conversation_id}",
            "support_websocket": "/api/ws/support/{session_id}",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )