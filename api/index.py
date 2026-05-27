"""
Vercel Python Serverless Function wrapper for FastAPI backend
This bridges the FastAPI app to Vercel's serverless environment
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'hermes-agent-saas', 'backend'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app for Vercel serverless
app = FastAPI(title="SAHJONY Backend API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include the actual backend routes
try:
    from app.routes import auth, health, appointments, messages, knowledge_base, admin, twenty_crm
    from app.config import settings
    
    # Include all routers
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(health.router, tags=["health"])
    app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
    app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
    app.include_router(knowledge_base.router, prefix="/api/knowledge", tags=["knowledge"])
    app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
    app.include_router(twenty_crm.router, prefix="/api/twenty", tags=["twenty"])
    
    BACKEND_LOADED = True
except Exception as e:
    BACKEND_LOADED = False
    LOAD_ERROR = str(e)

@app.get("/")
async def root():
    if BACKEND_LOADED:
        return {
            "status": "running",
            "service": "SAHJONY Backend API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/health",
                "auth": "/api/auth",
                "appointments": "/api/appointments",
                "messages": "/api/messages",
                "knowledge": "/api/knowledge",
                "admin": "/api/admin",
                "twenty_crm": "/api/twenty"
            }
        }
    else:
        return {
            "status": "error",
            "message": "Backend not loaded",
            "error": LOAD_ERROR if not BACKEND_LOADED else None
        }

@app.get("/api")
async def api_info():
    return {
        "name": "SAHJONY Backend API",
        "version": "1.0.0",
        "documentation": "/docs" if BACKEND_LOADED else None
    }

# For Vercel serverless - export the app
handler = app