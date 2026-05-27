"""
Vercel Python Serverless Function wrapper for FastAPI backend
Exports 'app' for Vercel's @vercel/python ASGI support
"""
import os
import sys

# Add this directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables from Vercel if not already set
os.environ.setdefault('SUPABASE_URL', 'https://rtwwnxipchwgwegtjqco.supabase.co')
os.environ.setdefault('FRONTEND_URL', 'https://frontend-ten-pi-73.vercel.app')
os.environ.setdefault('DEBUG', 'false')
os.environ.setdefault('JWT_SECRET', 'dev-secret-change-in-production')

# Import the FastAPI app from main
try:
    import backend
    import backend.main as main_module
    app = main_module.app
except Exception as e:
    # If import fails, create a minimal app for error reporting
    from fastapi import FastAPI
    app = FastAPI(title="SAHJONY Backend - Error")
    
    @app.get("/")
    async def error_root():
        return {"status": "error", "message": "Failed to load backend module", "error": str(e)}
    
    @app.get("/health")
    async def error_health():
        return {"status": "error", "message": str(e)}