"""
Vercel Python Serverless Function wrapper for FastAPI backend
This bridges the FastAPI app to Vercel's serverless environment
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set environment variables from Vercel if not already set
# This ensures os.getenv() in config.py works correctly
if 'SUPABASE_URL' not in os.environ:
    os.environ['SUPABASE_URL'] = os.getenv('SUPABASE_URL', '')
if 'SUPABASE_ANON_KEY' not in os.environ:
    os.environ['SUPABASE_ANON_KEY'] = os.getenv('SUPABASE_ANON_KEY', '')
if 'SUPABASE_SERVICE_ROLE_KEY' not in os.environ:
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
if 'JWT_SECRET' not in os.environ:
    os.environ['JWT_SECRET'] = os.getenv('JWT_SECRET', 'dev-secret-change-in-production')
if 'FRONTEND_URL' not in os.environ:
    os.environ['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'https://frontend-ten-pi-73.vercel.app')
if 'DEBUG' not in os.environ:
    os.environ['DEBUG'] = 'false'

# Import the FastAPI app from main
try:
    from main import app
    from main import health_check, root, api_info
    
    # Export the handlers
    handler = app
    
except Exception as e:
    # If import fails, create a minimal app that shows the error
    from fastapi import FastAPI
    app = FastAPI(title="SAHJONY Backend - Error")
    
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