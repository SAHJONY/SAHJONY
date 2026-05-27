"""
Vercel Python Serverless Function wrapper for FastAPI backend
This bridges the FastAPI app to Vercel's serverless environment
"""
import os
import sys

# Add the repo root directory to the path (parent of backend and api)
# __file__ = hermes-agent-saas/api/index.py
# dirname(__file__) = hermes-agent-saas/api
# dirname(dirname(__file__)) = hermes-agent-saas (repo root)
REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, REPO_ROOT)

# Set environment variables from Vercel if not already set
# Only set from Vercel env vars - don't override with empty defaults
os.environ.setdefault('SUPABASE_URL', 'https://rtwwnxipchwgwegtjqco.supabase.co')
os.environ.setdefault('FRONTEND_URL', 'https://frontend-ten-pi-73.vercel.app')
os.environ.setdefault('DEBUG', 'false')
os.environ.setdefault('JWT_SECRET', 'dev-secret-change-in-production')

# Import the FastAPI app from main
try:
    # First import the backend package to initialize it
    import backend
    # Then import main (which uses relative imports from .config, .routes)
    import backend.main as main_module
    app = main_module.app
    
    # Export the handlers
    handler = app
    
except Exception as e:
    # If import fails, create a minimal app that shows the error
    from fastapi import FastAPI
    app = FastAPI(title="SAHJONY API")
    
    @app.get("/")
    async def error_root():
        return {
            "status": "error",
            "message": "Failed to load backend module",
            "error": str(e),
            "hint": "Check that all environment variables are configured in Vercel dashboard"
        }
    
    @app.get("/health")
    async def error_health():
        return {"status": "error", "message": str(e)}
    
    handler = app