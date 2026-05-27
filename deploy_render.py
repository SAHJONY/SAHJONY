import requests
import json

API_KEY = "rnd_lmbuL6HH353zw3FPooSpiWXcCIRs"
BASE_URL = "https://api.render.com/v1"
OWNER_ID = "tea-d8bg8h6q1p3s73ea0hb0"

payload = {
    "type": "web_service",
    "name": "sahjony-backend",
    "ownerId": OWNER_ID,
    "repo": {
        "url": "https://github.com/SAHJONY/SAHJONY",
        "branch": "master"
    },
    "runtime": "python",
    "pythonVersion": "3.11",
    "buildCommand": "pip install -r requirements.txt",
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthCheckPath": "/health",
    "envVars": [
        {"key": "PYTHON_VERSION", "value": "3.11"},
        {"key": "DEBUG", "value": "false"},
        {"key": "SUPABASE_URL", "value": "https://rtwwnxipchwgwegtjqco.supabase.co"},
        {"key": "FRONTEND_URL", "value": "https://frontend-ten-pi-73.vercel.app"}
    ]
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

print("Deploying sahjony-backend to Render...")

try:
    response = requests.post(
        f"{BASE_URL}/services",
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code in [200, 201]:
        print("\n[SUCCESS] Deployment initiated successfully!")
        data = response.json()
        if 'id' in data:
            print(f"Service ID: {data['id']}")
        if 'dashboardUrl' in data:
            print(f"Dashboard URL: {data['dashboardUrl']}")
    else:
        print(f"\n[FAILED] Deployment failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n[ERROR] Request failed: {str(e)}")