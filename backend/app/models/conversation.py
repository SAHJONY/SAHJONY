"""
Conversation models for hermes-agent SaaS.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class Conversation(BaseModel):
    """Conversation database model."""
    id: UUID
    agent_id: UUID
    user_id: UUID
    title: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Model for creating a new conversation."""
    agent_id: UUID
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationUpdate(BaseModel):
    """Model for updating a conversation."""
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationResponse(BaseModel):
    """Response model for conversation."""
    id: UUID
    agent_id: UUID
    title: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Response model for listing conversations."""
    conversations: List[ConversationResponse]
    total: int