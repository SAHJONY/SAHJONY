"""
Message models for hermes-agent SaaS.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class Message(BaseModel):
    """Message database model."""
    id: UUID
    conversation_id: UUID
    role: str  # 'user', 'assistant', 'system'
    content: str
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    """Model for creating a new message."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    """Response model for message."""
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Request model for sending a chat message."""
    content: str = Field(..., min_length=1)
    stream: bool = Field(default=True)


class ChatResponse(BaseModel):
    """Response model for non-streaming chat."""
    message: MessageResponse
    agent_id: UUID
    conversation_id: UUID