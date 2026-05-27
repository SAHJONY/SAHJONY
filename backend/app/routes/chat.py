"""
Chat routes for hermes-agent SaaS with streaming support.

Powered by SAHJONY - The unified AI brain combining:
- Freebuff Multi-Agent System (FilePicker, Planner, Editor, Reviewer)
- Hermes Agent Persistent Memory (SQLite + FTS5)
"""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import Optional
from uuid import UUID
import asyncio
import json
from datetime import datetime

from ..models.message import ChatRequest, MessageResponse
from ..database import get_supabase_admin
from ..middleware.auth import get_current_user_id
from ..services.hermes_engine import HermesEngine
from ..services.sahjony_brain import sahjony_brain

router = APIRouter(tags=["Chat"])


def get_conversation_with_agent(conversation_id: str, user_id: str) -> Optional[dict]:
    """Get a conversation with its agent, verifying ownership."""
    try:
        supabase = get_supabase_admin()
        
        # Get conversation
        conv_response = supabase.table("conversations").select("*").eq("id", conversation_id).eq("user_id", user_id).execute()
        if not conv_response.data:
            return None
        
        conversation = conv_response.data[0]
        
        # Get agent
        agent_response = supabase.table("agents").select("*").eq("id", conversation["agent_id"]).eq("user_id", user_id).execute()
        if not agent_response.data:
            return None
        
        conversation["agent"] = agent_response.data[0]
        return conversation
    except Exception:
        return None


@router.get("/sahjony/status")
async def get_sahjony_status():
    """Get SAHJONY Brain status and capabilities."""
    return {
        "status": "active",
        "name": "SAHJONY Brain",
        "description": "Unified AI Brain (Freebuff Multi-Agent + Hermes Memory)",
        "powered_by": "sahjony_brain",
        "unified_brain": True,
        **sahjony_brain.get_capabilities()
    }


@router.post("/sahjony/analyze")
async def analyze_code_endpoint(
    code: str,
    user_id: str = Depends(get_current_user_id)
):
    """Analyze code using SAHJONY Brain's Reviewer agent."""
    try:
        result = await sahjony_brain.analyze_code(
            user_id=user_id,
            agent_id="default",
            agent_config={},
            code=code
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")


@router.post("/sahjony/generate")
async def generate_code_endpoint(
    task: str,
    language: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Generate code using SAHJONY Brain's Editor agent."""
    try:
        result = await sahjony_brain.generate_code(
            user_id=user_id,
            agent_id="default",
            agent_config={},
            task=task,
            language=language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


@router.get("/sahjony/search")
async def search_history_endpoint(
    query: str,
    user_id: str = Depends(get_current_user_id)
):
    """Search user's conversation history using Hermes memory."""
    try:
        results = await sahjony_brain.search_memory(user_id=user_id, query=query)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/chat/{conversation_id}", response_model=MessageResponse)
async def send_message(
    conversation_id: UUID,
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Send a message and get a response (non-streaming)."""
    # Verify conversation ownership and get agent
    conversation_data = get_conversation_with_agent(str(conversation_id), user_id)
    if not conversation_data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    agent = conversation_data["agent"]
    
    try:
        supabase = get_supabase_admin()
        
        # Save user message
        user_message_response = supabase.table("messages").insert({
            "conversation_id": str(conversation_id),
            "role": "user",
            "content": request.content,
            "metadata": {},
        }).execute()
        
        user_message = user_message_response.data[0]
        
        # Get conversation history
        history_response = supabase.table("messages").select("*").eq("conversation_id", str(conversation_id)).order("created_at", asc=True).execute()
        messages = history_response.data
        
        # Process with hermes-agent engine
        engine = HermesEngine(agent)
        response_content = await engine.process_message(messages, request.content)
        
        # Save assistant message
        assistant_message_response = supabase.table("messages").insert({
            "conversation_id": str(conversation_id),
            "role": "assistant",
            "content": response_content,
            "metadata": {"model": agent["model_name"], "provider": agent["model_provider"]},
        }).execute()
        
        # Update conversation title if it's the first message
        if len(messages) == 1:  # This was the first user message
            title = request.content[:50] + ("..." if len(request.content) > 50 else "")
            supabase.table("conversations").update({"title": title}).eq("id", str(conversation_id)).execute()
        
        return MessageResponse(**assistant_message_response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")


@router.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: str):
    """WebSocket endpoint for real-time streaming chat."""
    # Get token from query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return
    
    # Verify user using proper JWT verification via middleware
    from ..middleware.auth import verify_bearer_token
    user_id = verify_bearer_token(token)
    if not user_id:
        await websocket.close(code=4002, reason="Invalid authentication token")
        return
    
    # Get conversation with agent
    conversation_data = get_conversation_with_agent(conversation_id, user_id)
    if not conversation_data:
        await websocket.close(code=4004, reason="Conversation not found")
        return
    
    agent = conversation_data["agent"]
    
    await websocket.accept()
    
    # Message handling loop
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                
                if not content:
                    await websocket.send_json({"error": "Empty message content"})
                    continue
                
                # Send user message
                supabase = get_supabase_admin()
                user_message_response = supabase.table("messages").insert({
                    "conversation_id": conversation_id,
                    "role": "user",
                    "content": content,
                    "metadata": {},
                }).execute()
                
                # Get conversation history
                history_response = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at", asc=True).execute()
                messages = history_response.data
                
                # Process with streaming
                engine = HermesEngine(agent)
                
                # Send typing indicator
                await websocket.send_json({"type": "typing", "content": ""})
                
                full_response = ""
                async for chunk in engine.process_message_stream(messages, content):
                    if chunk.get("type") == "chunk":
                        full_response += chunk.get("content", "")
                        await websocket.send_json({
                            "type": "chunk",
                            "content": chunk["content"]
                        })
                    elif chunk.get("type") == "error":
                        await websocket.send_json({
                            "type": "error",
                            "content": chunk["content"]
                        })
                        break
                
                # Save assistant message
                if full_response:
                    assistant_message_response = supabase.table("messages").insert({
                        "conversation_id": conversation_id,
                        "role": "assistant",
                        "content": full_response,
                        "metadata": {"model": agent["model_name"], "provider": agent["model_provider"]},
                    }).execute()
                    
                    # Update conversation title if first message
                    if len(messages) == 1:
                        title = content[:50] + ("..." if len(content) > 50 else "")
                        supabase.table("conversations").update({"title": title}).eq("id", conversation_id).execute()
                    
                    await websocket.send_json({
                        "type": "done",
                        "message_id": assistant_message_response.data[0]["id"]
                    })
                    
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
                
    except WebSocketDisconnect:
        pass  # Client disconnected gracefully
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except:
            pass