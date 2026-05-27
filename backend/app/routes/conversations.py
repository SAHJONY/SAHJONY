"""
Conversation management routes for hermes-agent SaaS.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from uuid import UUID

from ..models.conversation import (
    Conversation, ConversationCreate, ConversationUpdate, 
    ConversationResponse, ConversationListResponse
)
from ..database import get_supabase_admin
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/conversations", tags=["Conversations"])


def get_conversation_by_id(conversation_id: str, user_id: str) -> Optional[dict]:
    """Get a conversation by ID, verifying ownership."""
    try:
        supabase = get_supabase_admin()
        response = supabase.table("conversations").select("*").eq("id", conversation_id).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception:
        return None


def verify_agent_ownership(agent_id: str, user_id: str) -> bool:
    """Verify that an agent belongs to the user."""
    try:
        supabase = get_supabase_admin()
        response = supabase.table("agents").select("id").eq("id", agent_id).eq("user_id", user_id).execute()
        return bool(response.data)
    except Exception:
        return False


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    agent_id: Optional[UUID] = None,
    limit: int = 50,
    offset: int = 0
):
    """List all conversations for the current user, optionally filtered by agent."""
    try:
        supabase = get_supabase_admin()
        
        query = supabase.table("conversations").select("*").eq("user_id", user_id)
        
        if agent_id:
            query = query.eq("agent_id", str(agent_id))
        
        # Get total count
        count_response = query.copy().select("id", count="exact").execute()
        total = count_response.count if hasattr(count_response, 'count') else len(count_response.data)
        
        # Get paginated conversations
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        conversations = [ConversationResponse(**conv) for conv in response.data]
        
        return ConversationListResponse(conversations=conversations, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list conversations: {str(e)}")


@router.post("", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new conversation."""
    # Verify agent ownership
    if not verify_agent_ownership(str(conversation_data.agent_id), user_id):
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        supabase = get_supabase_admin()
        
        insert_data = {
            "agent_id": str(conversation_data.agent_id),
            "user_id": user_id,
            "title": conversation_data.title or "New Conversation",
            "metadata": conversation_data.metadata or {},
        }
        
        response = supabase.table("conversations").insert(insert_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create conversation")
        
        return ConversationResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific conversation by ID."""
    conversation = get_conversation_by_id(str(conversation_id), user_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return ConversationResponse(**conversation)


@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: UUID,
    conversation_data: ConversationUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a conversation."""
    # Verify ownership
    conversation = get_conversation_by_id(str(conversation_id), user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        supabase = get_supabase_admin()
        
        update_data = {}
        if conversation_data.title is not None:
            update_data["title"] = conversation_data.title
        if conversation_data.metadata is not None:
            update_data["metadata"] = conversation_data.metadata
        
        if update_data:
            response = supabase.table("conversations").update(update_data).eq("id", str(conversation_id)).execute()
            
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to update conversation")
            
            return ConversationResponse(**response.data[0])
        
        return ConversationResponse(**conversation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update conversation: {str(e)}")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a conversation and all its messages."""
    # Verify ownership
    conversation = get_conversation_by_id(str(conversation_id), user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        supabase = get_supabase_admin()
        
        # Delete messages first (handled by CASCADE, but explicit for clarity)
        supabase.table("messages").delete().eq("conversation_id", str(conversation_id)).execute()
        
        # Delete conversation
        supabase.table("conversations").delete().eq("id", str(conversation_id)).execute()
        
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")


@router.get("/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: UUID,
    user_id: str = Depends(get_current_user_id),
    limit: int = 100,
    offset: int = 0
):
    """Get all messages in a conversation."""
    # Verify ownership
    conversation = get_conversation_by_id(str(conversation_id), user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        supabase = get_supabase_admin()
        
        response = supabase.table("messages").select("*").eq("conversation_id", str(conversation_id)).order("created_at", asc=True).range(offset, offset + limit - 1).execute()
        
        return {"messages": response.data, "total": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")