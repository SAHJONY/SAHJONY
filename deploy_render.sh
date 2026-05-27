#!/bin/bash
# Deploy FastAPI backend to Render using REST API

API_KEY="rnd_lmbuL6HH353zw3FPooSpiWXcCIRs"
BASE_URL="https://api.render.com/v1"

echo "Deploying SAHJONY backend to Render..."

# Create the web service
curl -X POST "${BASE_URL}/services" \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "type": "web_service",
    "name": "sahjony-backend",
    "repo": "https://github.com/SAHJONY/SAHJONY",
    "branch": "master",
    "rootDirectory": "backend",
    "runtime": "python",
    "pythonVersion": "3.11",
    "buildCommand": "pip install -r requirements.txt",
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}",
    "healthCheckPath": "/health",
    "envVars": [
      {"key": "PYTHON_VERSION", "value": "3.11"},
      {"key": "DEBUG", "value": "false"},
      {"key": "SUPABASE_URL", "value": "https://rtwwnxipchwgwegtjqco.supabase.co"},
      {"key": "FRONTEND_URL", "value": "https://frontend-ten-pi-73.vercel.app"}
    ]
  }'

echo ""
echo "Deployment initiated! Check Render dashboard for status."