# SAHJONY - Unified AI Brain Engine

**SAHJONY** is the powerful combination of **Freebuff** (Multi-Agent AI Orchestration) and **Hermes Agent** (Persistent Memory) working as a single, unified brain and engine.

```
    ╔═══════════════════════════════════════════════════════════╗
    ║                      SAHJONY BRAIN                        ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║   ┌─────────────────┐        ┌─────────────────────┐     ║
    ║   │   FREEBUFF      │    +   │   HERMES AGENT      │     ║
    ║   │   Multi-Agent   │        │   Persistent Memory │     ║
    ║   │   Orchestration │        │   SQLite + FTS5     │     ║
    ║   └────────┬────────┘        └──────────┬──────────┘     ║
    ║            │                              │               ║
    ║            ▼                              ▼               ║
    ║   ┌──────────────────────────────────────────────┐       ║
    ║   │  FilePicker │ Planner │ Editor │ Reviewer    │       ║
    ║   │         SAHJONY Core (Orchestrator)          │       ║
    ║   │         Session Memory + Streaming           │       ║
    ║   └──────────────────────────────────────────────┘       ║
    ║                        ║                                  ║
    ║                        ▼                                  ║
    ║              🤖 ONE SINGLE BRAIN 🤖                       ║
    ╚═══════════════════════════════════════════════════════════╝
```

## Architecture Overview

### The Two Pillars

#### 1. Freebuff - Multi-Agent AI Orchestration

Freebuff provides the intelligent multi-agent system that processes requests through specialized agents:

| Agent | Purpose | Capabilities |
|-------|---------|--------------|
| **FilePicker** | Analyzes codebase structure | Pattern extraction, file relevance scoring, codebase navigation |
| **Planner** | Breaks down complex tasks | Task decomposition, step sequencing, priority assignment |
| **Editor** | Generates and modifies code | Multi-language code templates (Python, TypeScript, Go, etc.) |
| **Reviewer** | Validates and provides feedback | Code analysis, issue detection, best practices suggestions |
| **SahjonyCore** | Central intelligence coordinator | Task routing, context management, response synthesis |
| **Orchestrator** | Coordinates multi-agent workflow | Agent sequencing, context chaining, result aggregation |

#### 2. Hermes Agent - Persistent Memory

Hermes provides the memory layer that enables persistent, searchable conversation history:

- **SQLite + FTS5**: Full-text search across all conversations
- **Session Management**: Persistent sessions with unique IDs
- **Message Appending**: Automatic history tracking
- **Cross-Session Context**: Remembers past interactions
- **Token Counting**: Tracks usage for cost analysis

### How They Work Together

```
User Message
     │
     ▼
┌─────────────────────────────────────────┐
│           SAHJONY BRAIN                 │
│                                         │
│  1. Hermes Memory Check                 │
│     └─► Load session context (if any)   │
│                                         │
│  2. Freebuff Orchestration              │
│     └─► Route to appropriate agents     │
│     └─► FilePicker analyzes context     │
│     └─► Planner creates task steps      │
│     └─► Editor generates code/response  │
│     └─► Reviewer validates output       │
│                                         │
│  3. Hermes Memory Update                │
│     └─► Persist conversation            │
│     └─► Update session history          │
│                                         │
│  4. Streaming Response                  │
│     └─► Stream chunks to client         │
└─────────────────────────────────────────┘
     │
     ▼
Response (Powered by Freebuff + Hermes)
```

## Features

### Core Capabilities

- **🧠 Intelligent Multi-Agent Processing**: Tasks are routed through specialized agents based on intent
- **💾 Persistent Memory**: Conversation history is stored and searchable across sessions
- **⚡ Real-Time Streaming**: Responses stream to clients with proper timing delays
- **📝 Code Generation**: Templates for API endpoints, React components, database models, and more
- **🔍 Code Review**: Automated analysis with issue detection and suggestions
- **🗺️ Task Planning**: Decomposes complex requests into actionable steps
- **🔎 Full-Text Search**: Search across all past conversations using Hermes FTS5

### Available Agents

| Agent | Response Time | Best For |
|-------|--------------|----------|
| SahjonyCore | ~100ms | General queries, explanations, routing decisions |
| FilePicker | ~50ms | Codebase analysis, finding relevant files |
| Planner | ~30ms | Task breakdown, creating implementation plans |
| Editor | ~200ms | Code generation, templates |
| Reviewer | ~100ms | Code validation, feedback |

## API Endpoints

### SAHJONY-Specific Endpoints

```
GET  /sahjony/status      - Get SAHJONY Brain status and capabilities
POST /sahjony/analyze     - Analyze code using Reviewer agent
POST /sahjony/generate    - Generate code using Editor agent
GET  /sahjony/search      - Search conversation history via Hermes
```

### Chat Endpoints (Powered by SAHJONY)

```
POST /chat/{conversation_id}     - Non-streaming chat response
WS   /ws/chat/{conversation_id}  - Real-time streaming chat
```

## File Structure

```
hermes-agent-saas/
├── backend/
│   └── app/
│       ├── services/
│       │   ├── sahjony_brain.py      # Main SAHJONY Brain implementation
│       │   └── hermes_engine.py      # HermesEngine wrapper (powered by SAHJONY)
│       └── routes/
│           └── chat.py              # Chat routes with SAHJONY integration
├── frontend/
│   └── src/
│       ├── app/(app)/dashboard/chat/
│       │   └── page.tsx             # SAHJONY-powered chat interface
│       ├── components/chat/
│       │   └── chat-window.tsx      # Chat UI with SAHJONY branding
│       └── components/layout/
│           └── top-nav.tsx          # Navigation with SAHJONY branding
└── SAHJONY.md                       # This documentation
```

## Usage Examples

### Chat Request (via HermesEngine → SAHJONY)

```python
from app.services.hermes_engine import HermesEngine

engine = HermesEngine(agent_config)
response = await engine.process_message(
    conversation_history=[
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ],
    new_message="Help me create a React button component",
    user_id="user123",
    agent_id="agent456"
)
# Response powered by SAHJONY (Freebuff + Hermes)
```

### Streaming Chat (via WebSocket → HermesEngine → SAHJONY)

```python
async for chunk in engine.process_message_stream(messages, content):
    if chunk.get("type") == "chunk":
        # Stream to client
        await websocket.send_json({"type": "chunk", "content": chunk["content"]})
    elif chunk.get("type") == "done":
        # Complete
        break
```

### Direct SAHJONY Brain Usage

```python
from app.services.sahjony_brain import sahjony_brain

# Code analysis
result = await sahjony_brain.analyze_code(
    user_id="user123",
    agent_id="agent456",
    agent_config={},
    code="def hello(): pass"
)

# Code generation
result = await sahjony_brain.generate_code(
    user_id="user123",
    agent_id="agent456",
    agent_config={},
    task="Create a FastAPI endpoint",
    language="python"
)

# Search history
results = await sahjony_brain.search_memory(
    user_id="user123",
    query="React components"
)
```

## Configuration

### Hermes State Integration

SAHJONY automatically detects and integrates with Hermes Agent's state module:

```python
# Automatic detection paths:
# 1. {project_root}/hermes-agent/
# 2. {home}/hermes-agent/
# 3. /opt/hermes-agent/ (Unix/Linux)
```

If Hermes state is not available, SAHJONY falls back to in-memory session storage.

### Agent Configuration

```python
agent_config = {
    "model_provider": "openai",           # or "anthropic", "google"
    "model_name": "gpt-4o",              # Model identifier
    "system_prompt": "You are a helpful assistant",
    "config": {
        "tools": [],                     # Configured tools
        "skills": []                     # Configured skills
    }
}
```

## Response Format

### SAHJONY responses include metadata:

```python
{
    "response": "...",                   # Response content
    "agent_type": "sahjony_core",        # Processing agent
    "confidence": 0.95,                  # Confidence score
    "tools_used": ["sahjony_core", "freebuff_multi_agent", "hermes_memory"]
}
```

### Streaming Response Chunks

```python
{"type": "status", "content": "thinking", "agent": "sahjony"}
{"type": "chunk", "content": "Hello! I'm SAHJ"}
{"type": "chunk", "content": "ONY..."}
# ... more chunks ...
{"type": "done", "content": ""}
{"type": "error", "content": "Error message if something fails"}
```

**Event Types:**
- `status` - Indicates SAHJONY is processing (includes `agent` field)
- `chunk` - Response text chunk for streaming display
- `done` - Streaming complete (includes `message_id` for saved message)
- `error` - Error occurred during processing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `HERMES_AGENT_PATH` | Path to hermes-agent | Auto-detected |

## Authentication

All SAHJONY endpoints require authentication via Supabase JWT tokens:

- **REST Endpoints**: Use `Depends(get_current_user_id)` for automatic JWT verification
- **WebSocket**: Pass token as query parameter `?token=<jwt_token>`

The `verify_bearer_token` middleware validates tokens and extracts `user_id` for context.

### Backend (Python)

- `fastapi>=0.100` - Web framework
- `supabase>=2.0` - Database client
- `asyncio` - Async/await support (stdlib)
- `pydantic>=2.0` - Data validation
- `websockets>=12.0` - WebSocket support

### Frontend (JavaScript/TypeScript)

- `next@15.x` - React framework
- `react@19.x` - UI library
- `@supabase/supabase-js@2.x` - Database client
- `lucide-react` - Icon library

## Future Enhancements

- [ ] Integrate actual LLM providers (OpenAI, Anthropic, Google)
- [ ] Connect to real hermes-agent CLI subprocess
- [ ] Implement token-based usage tracking
- [ ] Add conversation compression for long sessions
- [ ] Enable multi-agent parallel processing
- [ ] Add file system access for FilePicker agent

## License

MIT - See main project license

---

**SAHJONY**: Where Freebuff's intelligence meets Hermes' memory, creating one powerful brain for all your AI assistance needs.