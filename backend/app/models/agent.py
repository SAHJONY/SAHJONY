"""
Agent models for hermes-agent SaaS.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class Agent(BaseModel):
    """Agent database model."""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    model_provider: str = "openai"
    model_name: str = "gpt-4o"
    system_prompt: Optional[str] = None
    config: Dict[str, Any] = {}
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentCreate(BaseModel):
    """Model for creating a new agent."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    model_provider: str = Field(default="openai")
    model_name: str = Field(default="gpt-4o")
    system_prompt: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class AgentUpdate(BaseModel):
    """Model for updating an agent."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    system_prompt: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    """Response model for agent (excludes sensitive data)."""
    id: UUID
    name: str
    description: Optional[str] = None
    model_provider: str
    model_name: str
    system_prompt: Optional[str] = None
    config: Dict[str, Any] = {}
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentListResponse(BaseModel):
    """Response model for listing agents."""
    agents: List[AgentResponse]
    total: int