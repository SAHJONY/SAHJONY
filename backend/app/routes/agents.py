"""
Agent management routes for hermes-agent SaaS.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from uuid import UUID

from ..models.agent import (
    Agent, AgentCreate, AgentUpdate, AgentResponse, AgentListResponse
)
from ..database import get_supabase_admin
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/agents", tags=["Agents"])


def get_agent_by_id(agent_id: str, user_id: str) -> Optional[dict]:
    """Get an agent by ID, verifying ownership."""
    try:
        supabase = get_supabase_admin()
        response = supabase.table("agents").select("*").eq("id", agent_id).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        return None  # Fail silently for not found, let caller handle


@router.get("", response_model=AgentListResponse)
async def list_agents(
    user_id: str = Depends(get_current_user_id),
    limit: int = 50,
    offset: int = 0
):
    """List all agents for the current user."""
    try:
        supabase = get_supabase_admin()
        
        # Get total count
        count_response = supabase.table("agents").select("id", count="exact").eq("user_id", user_id).execute()
        total = count_response.count if hasattr(count_response, 'count') else len(count_response.data)
        
        # Get paginated agents
        response = supabase.table("agents").select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        agents = [AgentResponse(**agent) for agent in response.data]
        
        return AgentListResponse(agents=agents, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")


@router.post("", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new agent."""
    try:
        supabase = get_supabase_admin()
        
        # Verify the user exists
        user_response = supabase.table("user_profiles").select("id").eq("id", user_id).execute()
        if not user_response.data:
            # Create user profile if it doesn't exist
            supabase.table("user_profiles").insert({"id": user_id, "display_name": agent_data.name}).execute()
        
        insert_data = {
            "user_id": user_id,
            "name": agent_data.name,
            "description": agent_data.description,
            "model_provider": agent_data.model_provider,
            "model_name": agent_data.model_name,
            "system_prompt": agent_data.system_prompt,
            "config": agent_data.config or {},
            "is_active": True,
        }
        
        response = supabase.table("agents").insert(insert_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create agent")
        
        return AgentResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific agent by ID."""
    agent = get_agent_by_id(str(agent_id), user_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentResponse(**agent)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_data: AgentUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update an existing agent."""
    # Verify ownership
    agent = get_agent_by_id(str(agent_id), user_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        supabase = get_supabase_admin()
        
        # Build update payload
        update_data = {}
        if agent_data.name is not None:
            update_data["name"] = agent_data.name
        if agent_data.description is not None:
            update_data["description"] = agent_data.description
        if agent_data.model_provider is not None:
            update_data["model_provider"] = agent_data.model_provider
        if agent_data.model_name is not None:
            update_data["model_name"] = agent_data.model_name
        if agent_data.system_prompt is not None:
            update_data["system_prompt"] = agent_data.system_prompt
        if agent_data.config is not None:
            update_data["config"] = agent_data.config
        if agent_data.is_active is not None:
            update_data["is_active"] = agent_data.is_active
        
        if update_data:
            response = supabase.table("agents").update(update_data).eq("id", str(agent_id)).execute()
            
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to update agent")
            
            return AgentResponse(**response.data[0])
        
        return AgentResponse(**agent)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update agent: {str(e)}")


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: UUID,
    user_id: str = Depends(get_current_user_id)
):
    """Delete an agent."""
    # Verify ownership
    agent = get_agent_by_id(str(agent_id), user_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        supabase = get_supabase_admin()
        supabase.table("agents").delete().eq("id", str(agent_id)).execute()
        
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")