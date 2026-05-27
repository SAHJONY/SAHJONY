# Hermes Agent SaaS

**Multi-user AI Agent Platform** powered by hermes-agent with a modern web interface.

## Overview

This is a full-stack SaaS application that allows multiple users to create and manage AI agents, have conversations, and access hermes-agent capabilities via API.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Web UI / Mobile App / API Clients)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Next.js Frontend (Vercel)                      │
│  - User Auth (Supabase)                                         │
│  - Agent Builder UI                                             │
│  - Real-time Chat Interface                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   FastAPI Backend                                │
│  - REST API + WebSocket                                         │
│  - User Management                                              │
│  - Agent CRUD                                                   │
│  - Chat Streaming                                               │
│  - API Key Management                                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
    │ Supabase│  │ hermes- │  │ OpenAI  │
    │ Postgres│  │ agent   │  │ APIs    │
    └─────────┘  └─────────┘  └─────────┘
```

## Features

- **User Authentication**: Email/password signup and login via Supabase Auth
- **Agent Management**: Create, configure, and manage AI agents
- **Real-time Chat**: WebSocket-based streaming conversations
- **API Keys**: Programmatic access for external integrations
- **Multi-tenancy**: Isolated per-user data with Row Level Security

## Tech Stack

- **Backend**: Python 3.11+ / FastAPI / WebSockets
- **Frontend**: Next.js 15 / TypeScript / Tailwind CSS / shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI Engine**: hermes-agent
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## Project Structure

```
hermes-agent-saas/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt
│   └── app/
│       ├── config.py              # Configuration
│       ├── database.py            # Supabase connection
│       ├── models/                # Pydantic models
│       ├── routes/                # API endpoints
│       ├── services/              # Business logic
│       └── middleware/            # Auth middleware
├── frontend/                      # Next.js application (separate repo)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
└── README.md
```

## Getting Started

### 1. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Get your project URL, anon key, and service role key
3. Run the migration SQL in `supabase/migrations/`

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\bin\trigger

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
python main.py
# Or: uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# See the agent-platform project for the frontend implementation
# It can be adapted to work with this backend
```

### 4. Environment Variables

**Backend (.env)**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - List user's agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/conversations/:id/messages` - Get messages

### Chat
- `POST /api/chat/:conversation_id` - Send message (non-streaming)
- `WebSocket /api/ws/chat/:conversation_id` - Real-time streaming

### API Keys
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create API key
- `DELETE /api/keys/:id` - Revoke API key

## Authentication

### Bearer Token (JWT)
```bash
curl -H "Authorization: Bearer <token>" https://api.example.com/api/agents
```

### API Key
```bash
curl -H "X-API-Key: hsa_xxxxxxxx" https://api.example.com/api/agents
```

## WebSocket Chat

Connect to `/api/ws/chat/{conversation_id}?token={jwt_token}`

Send JSON messages:
```json
{"content": "Hello, how can you help me?"}
```

Receive streaming responses:
```json
{"type": "chunk", "content": "Hello"}
{"type": "chunk", "content": "!"}
{"type": "done", "message_id": "..."}
```

## Deployment

### Backend (Railway/Render)

1. Connect your GitHub repo
2. Set environment variables
3. Deploy with the `main.py` entry point

### Frontend (Vercel)

1. Connect the Next.js frontend to Vercel
2. Set environment variables (Supabase credentials)
3. Deploy

## License

MIT License - See LICENSE file for details.