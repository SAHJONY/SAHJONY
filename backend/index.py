"""
Vercel Python Serverless Function wrapper for FastAPI backend
ABSOLUTE MINIMAL VERSION - test if basic FastAPI works
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

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

@app.get("/")
async def root():
    return {"service": "hermes-agent-saas", "status": "ok", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api")
async def api_info():
    return {"name": "Hermes Agent SaaS API", "version": "0.1.0"}