"""
Vercel Python Serverless Function wrapper for FastAPI backend
Vercel expects either 'app' (ASGI app) or 'handler' (function) at top level
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

# Also export handler for Vercel serverless events
async def handler(event, context):
    """Handle Vercel serverless request and return FastAPI response."""
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    body = event.get('body', '')
    
    # Normalize headers to lowercase keys
    normalized_headers = {}
    for k, v in headers.items():
        normalized_headers[k.lower()] = v
    
    # Build ASGI scope
    scope = {
        'type': 'http',
        'method': method,
        'path': path,
        'headers': [(k.lower().encode(), v.encode()) for k, v in normalized_headers.items()],
        'query_string': b'',
        'root_path': '',
    }
    
    # Create receive function
    async def receive():
        return {'type': 'http.request', 'body': body.encode() if body else b''}
    
    # Collect response parts
    status_code = 200
    response_headers = []
    response_body = b''
    
    async def send(message):
        nonlocal status_code, response_headers, response_body
        if message['type'] == 'http.response.start':
            status_code = message['status']
            response_headers = message.get('headers', [])
        elif message['type'] == 'http.response.body':
            response_body += message.get('body', b'')
    
    # Call FastAPI ASGI app
    await app(scope, receive, send)
    
    # Convert headers to dict
    headers_dict = {}
    for key, value in response_headers:
        headers_dict[key.decode()] = value.decode()
    
    return {
        'statusCode': status_code,
        'headers': headers_dict,
        'body': response_body.decode() if response_body else ''
    }