# Deploying Hermes Agent SaaS Backend

## Deployment Options

### Option 1: Railway (Recommended - Easy)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `SAHJONY/SAHJONY` repository

2. **Configure Backend**
   - Navigate to the `backend` directory
   - Railway will auto-detect Python and use `railway.toml`

3. **Set Environment Variables**
   In Railway dashboard, add these variables:
   ```
   SUPABASE_URL=https://rtwwnxipchwgwegtjqco.supabase.co
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
   JWT_SECRET=<generate-a-secure-random-string>
   TWENTY_API_KEY=<your-twenty-api-key>
   FRONTEND_URL=https://frontend-ten-pi-73.vercel.app
   DEBUG=false
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Health check at `/health` will confirm deployment

### Option 2: Render (Blueprint Deployment)

1. **Deploy via Blueprint**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Create "New" → "Blueprint"
   - Connect your `SAHJONY/SAHJONY` repo
   - Render will use `render.yaml` in the backend directory

2. **Or Deploy Manually**
   - Create "New" → "Web Service"
   - Connect GitHub repo
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   Add the same environment variables as Railway in the Render dashboard.

### Option 3: Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t hermes-agent-backend .
docker run -p 8000:8000 --env-file .env hermes-agent-backend
```

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `TWENTY_API_KEY` | Twenty CRM API key | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `DEBUG` | Enable debug mode | No |

## API Endpoints

Once deployed, the backend provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health check |
| GET | `/api` | API info |
| POST | `/api/auth/*` | Authentication routes |
| GET/POST | `/api/agents/*` | Agent management |
| GET/POST | `/api/conversations/*` | Conversation management |
| POST | `/api/chat/*` | Chat endpoints |
| GET | `/api/twenty/*` | Twenty CRM integration |

## Verifying Deployment

```bash
# Check health
curl https://your-backend-url.railway.app/health

# Check API info
curl https://your-backend-url.railway.app/api
```

## Troubleshooting

1. **Build fails**: Check that Python 3.11 is available
2. **Import errors**: Verify `requirements.txt` has all dependencies
3. **CORS errors**: Ensure `FRONTEND_URL` matches your frontend URL
4. **Auth errors**: Check Supabase environment variables are correct