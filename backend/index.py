"""
Minimal Vercel Python test - export app directly
"""
from fastapi import FastAPI

app = FastAPI(title="Test Backend")

@app.get("/")
async def root():
    return {"status": "healthy", "message": "Backend is working!"}

@app.get("/health")
async def health():
    return {"status": "ok"}