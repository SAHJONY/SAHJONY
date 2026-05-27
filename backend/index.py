"""
Vercel Python Serverless Function wrapper for FastAPI backend
Step 1: Add Supabase client creation
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

# Environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['SUPABASE_ANON_KEY'] = SUPABASE_ANON_KEY
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = SUPABASE_SERVICE_ROLE_KEY

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hermes Agent SaaS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to create Supabase client
supabase_client = None
supabase_status = "not_configured"

if SUPABASE_URL and SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        supabase_status = "connected"
        sys.stderr.write(f"Supabase connected: {SUPABASE_URL[:30]}...\n")
    except Exception as e:
        supabase_status = f"error: {type(e).__name__}: {str(e)[:100]}"
        sys.stderr.write(f"Supabase error: {supabase_status}\n")
else:
    sys.stderr.write(f"Supabase not configured: url={'set' if SUPABASE_URL else 'missing'}, anon={'set' if SUPABASE_ANON_KEY else 'missing'}, service={'set' if SUPABASE_SERVICE_ROLE_KEY else 'missing'}\n")

@app.get("/")
async def root():
    return {
        "service": "hermes-agent-saas",
        "status": "ok",
        "version": "0.1.0",
        "supabase_status": supabase_status
    }

@app.get("/health")
async def health():
    return {"status": "ok", "supabase_status": supabase_status}

@app.get("/api")
async def api_info():
    return {"name": "Hermes Agent SaaS API", "version": "0.1.0", "supabase_status": supabase_status}

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "supabase_status": supabase_status}