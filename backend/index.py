"""
Vercel Python Serverless Function wrapper for FastAPI backend
This bridges the FastAPI app to Vercel's serverless environment
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
    # Import as package to ensure relative imports work
    import backend
    import backend.main as main_module
    app = main_module.app
except Exception as e:
    # If import fails, create a minimal app
    from fastapi import FastAPI
    app = FastAPI(title="SAHJONY Backend - Error")
    
    @app.get("/")
    async def error_root():
        return {
            "status": "error", 
            "message": "Failed to load backend module", 
            "error": str(e)
        }
    
    @app.get("/health")
    async def error_health():
        return {"status": "error", "message": str(e)}

# Vercel Python serverless handler
def handler(event, context):
    """Handle Vercel serverless request and return FastAPI response."""
    from fastapi.requests import Request
    from fastapi.responses import JSONResponse
    
    # Build the request object from Vercel event
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    body = event.get('body', '')
    
    # Create a mock Request object for FastAPI
    scope = {
        'type': 'http',
        'method': method,
        'path': path,
        'headers': [(k.lower().encode(), v.encode()) for k, v in headers.items()],
        'query_string': b'',
        'root_path': '',
    }
    
    async def receive():
        return {'type': 'http.request', 'body': body.encode() if body else b''}
    
    request = Request(scope, receive)
    
    # Call FastAPI app
    response = app.handle(request)
    
    # Convert FastAPI response to Vercel format
    async def run_response():
        await response.body_consumed
        body_bytes = response.body
        return {
            'statusCode': response.status_code,
            'headers': {k: v for k, v in response.headers.items()},
            'body': body_bytes.decode() if body_bytes else ''
        }
    
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(run_response())
    loop.close()
    
    return result