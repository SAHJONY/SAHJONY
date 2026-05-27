"""
Agent service for business logic around agent management.
"""
from typing import List, Optional, Dict, Any

from ..database import get_supabase_admin
from ..config import settings


class AgentService:
    """Service layer for agent-related business logic."""
    
    def __init__(self):
        self.supabase = get_supabase_admin()
    
    def get_user_agents(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all agents for a user."""
        response = self.supabase.table("agents").select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return response.data
    
    def get_agent_count(self, user_id: str) -> int:
        """Get total number of agents for a user."""
        response = self.supabase.table("agents").select("id", count="exact").eq("user_id", user_id).execute()
        return response.count if hasattr(response, 'count') else len(response.data)
    
    def create_agent(self, user_id: str, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new agent."""
        insert_data = {
            "user_id": user_id,
            "name": agent_data["name"],
            "description": agent_data.get("description"),
            "model_provider": agent_data.get("model_provider", "openai"),
            "model_name": agent_data.get("model_name", "gpt-4o"),
            "system_prompt": agent_data.get("system_prompt"),
            "config": agent_data.get("config", {}),
            "is_active": True,
        }
        
        response = self.supabase.table("agents").insert(insert_data).execute()
        return response.data[0] if response.data else None
    
    def get_agent(self, agent_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific agent if it belongs to the user."""
        response = self.supabase.table("agents").select("*").eq("id", agent_id).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None
    
    def update_agent(self, agent_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an agent."""
        # First verify ownership
        agent = self.get_agent(agent_id, user_id)
        if not agent:
            return None
        
        # Filter to only allowed update fields
        allowed_fields = ["name", "description", "model_provider", "model_name", "system_prompt", "config", "is_active"]
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}
        
        if not filtered_data:
            return agent
        
        response = self.supabase.table("agents").update(filtered_data).eq("id", agent_id).execute()
        return response.data[0] if response.data else None
    
    def delete_agent(self, agent_id: str, user_id: str) -> bool:
        """Delete an agent if it belongs to the user."""
        agent = self.get_agent(agent_id, user_id)
        if not agent:
            return False
        
        self.supabase.table("agents").delete().eq("id", agent_id).execute()
        return True
    
    def get_agent_stats(self, agent_id: str, user_id: str) -> Dict[str, Any]:
        """Get statistics for an agent (conversation count, message count, etc.)."""
        agent = self.get_agent(agent_id, user_id)
        if not agent:
            return {}
        
        # Get conversation count
        conv_response = self.supabase.table("conversations").select("id", count="exact").eq("agent_id", agent_id).execute()
        conversation_count = conv_response.count if hasattr(conv_response, 'count') else 0
        
        # Get total message count
        from supabase import create_client
        from ..config import settings
        
        # Get message count via join
        msg_response = self.supabase.rpc(
            "get_agent_message_count",
            {"agent_id_param": agent_id}
        ).execute()
        
        return {
            "agent_id": agent_id,
            "conversation_count": conversation_count,
            "message_count": msg_response.data[0]["count"] if msg_response.data else 0,
        }