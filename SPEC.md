# Hermes Agent SaaS - Technical Specification

## Overview

Build a **multi-user AI Agent SaaS platform** using:
- **Backend**: FastAPI service layer wrapping hermes-agent with REST API + WebSocket streaming
- **Frontend**: Next.js 15 with modern web UI
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Agent Engine**: hermes-agent as the core AI processing engine

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Web UI / Mobile App / API Clients)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS/WSS
┌─────────────────────▼───────────────────────────────────────────┐
│                      Next.js Frontend (Vercel)                   │
│  - User Auth (Supabase)                                         │
│  - Agent Builder UI                                             │
│  - Real-time Chat Interface                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │ REST API + WebSocket
┌─────────────────────▼───────────────────────────────────────────┐
│                   FastAPI Service Layer                          │
│  - User Management & Auth                                       │
│  - Agent CRUD Operations                                        │
│  - Chat Message Routing                                         │
│  - WebSocket Streaming                                          │
│  - API Key Management                                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
    │ Supabase│  │ hermes- │  │ OpenAI  │
    │ Postgres│  │ agent   │  │ / Anthropic │
    │ + Auth  │  │ Engine  │  │ APIs    │
    └─────────┘  └─────────┘  └─────────┘
```

## Database Schema (Supabase/PostgreSQL)

### Tables

1. **users** (managed by Supabase Auth)
   - id (uuid, primary key)
   - email (unique)
   - created_at, updated_at

2. **user_profiles**
   - id (uuid, primary key, FK to auth.users)
   - display_name (varchar)
   - avatar_url (text)
   - settings (jsonb)
   - created_at, updated_at

3. **agents**
   - id (uuid, primary key)
   - user_id (uuid, FK to auth.users)
   - name (varchar)
   - description (text)
   - model_provider (varchar) - 'openai' | 'anthropic' | 'google'
   - model_name (varchar)
   - system_prompt (text)
   - config (jsonb) - tool preferences, skills, etc.
   - is_active (boolean)
   - created_at, updated_at

4. **conversations**
   - id (uuid, primary key)
   - agent_id (uuid, FK to agents)
   - user_id (uuid, FK to auth.users)
   - title (varchar)
   - metadata (jsonb)
   - created_at, updated_at

5. **messages**
   - id (uuid, primary key)
   - conversation_id (uuid, FK to conversations)
   - role (varchar) - 'user' | 'assistant' | 'system'
   - content (text)
   - metadata (jsonb) - token counts, model info, etc.
   - created_at

6. **api_keys**
   - id (uuid, primary key)
   - user_id (uuid, FK to auth.users)
   - name (varchar)
   - key_hash (varchar) - SHA256 of actual key
   - last_used_at (timestamp)
   - expires_at (timestamp)
   - created_at

### Row Level Security (RLS)

- Users can only access their own agents, conversations, and messages
- API keys are scoped to the user who created them
- Agents are isolated per user

## API Design

### Authentication

```
POST   /api/auth/signup         - Register new user
POST   /api/auth/login          - Login (email/password)
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user
```

### Agents

```
GET    /api/agents              - List user's agents
POST   /api/agents              - Create new agent
GET    /api/agents/:id          - Get agent details
PUT    /api/agents/:id          - Update agent
DELETE /api/agents/:id          - Delete agent
```

### Conversations

```
GET    /api/conversations                    - List user's conversations
POST   /api/conversations                    - Create new conversation
GET    /api/conversations/:id                - Get conversation with messages
DELETE /api/conversations/:id                - Delete conversation
```

### Chat (Streaming)

```
POST   /api/chat/:conversation_id            - Send message (REST, returns JSON)
WebSocket /api/ws/chat/:conversation_id      - Real-time streaming chat
```

### API Keys

```
GET    /api/keys               - List user's API keys
POST   /api/keys               - Create new API key
DELETE /api/keys/:id           - Revoke API key
```

## Core Features

### 1. User Authentication
- Email/password signup and login via Supabase Auth
- JWT-based session management
- OAuth support (Google, GitHub)

### 2. Agent Management
- Create AI agents with custom names, descriptions
- Configure model provider and name
- Customize system prompt
- Enable/disable tools and skills

### 3. Real-time Chat
- Send messages and receive streaming responses
- WebSocket-based real-time communication
- Message history persistence
- Token usage tracking

### 4. API Key Management
- Create scoped API keys for programmatic access
- Track usage and last used timestamp
- Expiration support

## Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **hermes-agent** as the core agent engine
- **Supabase Python client** for database access
- **SQLAlchemy** for ORM
- **WebSocket** for real-time streaming

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Supabase JavaScript client** for auth and data

### Infrastructure
- **Supabase** for PostgreSQL + Auth
- **Vercel** for frontend deployment
- **hermes-agent** running as the AI engine

## Project Structure

```
hermes-agent-saas/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   ├── database.py         # Supabase/database connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── agent.py
│   │   │   ├── conversation.py
│   │   │   └── message.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── agents.py
│   │   │   ├── conversations.py
│   │   │   ├── chat.py
│   │   │   └── keys.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── agent_service.py
│   │   │   ├── chat_service.py
│   │   │   └── hermes_engine.py
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── auth.py
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── README.md
```

## Implementation Notes

1. **hermes-agent Integration**: The FastAPI backend will use hermes-agent as a library/dependency, calling into its agent runtime to process messages while maintaining proper session isolation per user/conversation.

2. **Streaming Response**: Use Server-Sent Events (SSE) or WebSocket for streaming AI responses to provide real-time feedback.

3. **Session Isolation**: Each user's conversations are isolated via database RLS policies and session keys include user_id.

4. **API Key Auth**: For programmatic access, users can create API keys that are hashed and stored, then passed as Bearer tokens.

## Security Considerations

- All API routes require authentication (JWT or API key)
- Row Level Security ensures data isolation
- API keys are hashed (never stored in plaintext)
- Input validation on all endpoints
- Rate limiting on chat endpoints
- CORS configuration for frontend domain