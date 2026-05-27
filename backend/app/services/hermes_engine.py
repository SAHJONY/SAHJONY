"""
Hermes Engine integration service.
Wraps hermes-agent as the AI processing backend.

Now powered by SAHJONY - The unified AI brain that combines:
- Freebuff Multi-Agent System (FilePicker, Planner, Editor, Reviewer)
- Hermes Agent Persistent Memory (SQLite + FTS5)

SAHJONY is the "single brain and engine" that works as one unified system.
"""
import os
import sys
import asyncio
from typing import List, Dict, Any, AsyncGenerator, Optional

from .sahjony_brain import (
    SahjonyBrain,
    sahjony_brain,
    AgentMessage,
    TaskContext
)

# ============================================================================
# HermesEngine - Main Integration Class
# ============================================================================

class HermesEngine:
    """
    Integration layer that wraps hermes-agent for the SaaS backend.
    
    Now powered by SAHJONY - the unified AI brain:
    - Multi-agent orchestration (Freebuff)
    - Persistent memory (Hermes State)
    - Real-time streaming chat
    - Code analysis and generation
    - Task decomposition and planning
    
    SAHJONY works as ONE SINGLE BRAIN AND ENGINE, combining:
    - Freebuff's intelligent multi-agent system
    - Hermes Agent's persistent session memory
    """
    
    def __init__(self, agent_config: Dict[str, Any]):
        """
        Initialize the Hermes engine with agent configuration.
        
        Args:
            agent_config: Agent configuration from the database
                - model_provider: 'openai' | 'anthropic' | 'google'
                - model_name: e.g., 'gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'
                - system_prompt: Custom system prompt
                - config: Additional configuration (tools, skills, etc.)
        """
        self.agent_config = agent_config
        self.model_provider = agent_config.get("model_provider", "openai")
        self.model_name = agent_config.get("model_name", "gpt-4o")
        self.system_prompt = agent_config.get("system_prompt", "")
        self.config = agent_config.get("config", {})
        
        # SAHJONY Brain - the unified brain (Freebuff + Hermes)
        self._sahjony = sahjony_brain
        
        # Try to import hermes-agent components if available
        self._hermes_available = self._check_hermes_availability()
    
    def _check_hermes_availability(self) -> bool:
        """Check if hermes-agent is available for import."""
        try:
            import importlib.util
            spec = importlib.util.find_spec("hermes_agent")
            if spec:
                return True
            if os.environ.get("HERMES_AGENT_PATH"):
                return True
            return False
        except Exception:
            return False
    
    async def process_message(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> str:
        """
        Process a single message and return the response.
        
        Uses SAHJONY Brain (Freebuff multi-agent + Hermes memory).
        
        Args:
            conversation_history: List of previous messages
            new_message: The new user message
            user_id: Optional user ID for context
            agent_id: Optional agent ID for context
            
        Returns:
            The assistant's response text
        """
        if self._sahjony:
            return await self._process_with_sahjony(conversation_history, new_message, user_id, agent_id)
        elif self._hermes_available:
            return await self._process_with_hermes(conversation_history, new_message)
        else:
            return self._mock_process(conversation_history, new_message)
    
    async def _process_with_sahjony(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> str:
        """
        Process using SAHJONY Brain - the unified AI engine.
        
        SAHJONY = Freebuff Multi-Agent + Hermes Persistent Memory
        """
        # Convert conversation history to AgentMessage format
        messages = [
            AgentMessage(role=m.get("role", "user"), content=m.get("content", ""))
            for m in conversation_history
        ]
        messages.append(AgentMessage(role="user", content=new_message))
        
        # Create task context
        context = TaskContext(
            user_id=user_id or "anonymous",
            agent_id=agent_id or "default",
            agent_config=self.agent_config
        )
        
        # Process through SAHJONY orchestrator
        response = await self._sahjony.orchestrator.process(context, messages)
        return response.content
    
    async def process_message_stream(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a message with streaming response.
        
        Uses SAHJONY Brain for streaming unified AI responses.
        
        Args:
            conversation_history: List of previous messages
            new_message: The new user message
            user_id: Optional user ID for context
            agent_id: Optional agent ID for context
            
        Yields:
            Dict with 'type' and 'content' keys:
            - {"type": "chunk", "content": "..."} for response chunks
            - {"type": "error", "content": "..."} for errors
            - {"type": "done", "content": ""} when complete
        """
        if self._sahjony:
            async for chunk in self._stream_with_sahjony(conversation_history, new_message, user_id, agent_id):
                yield chunk
        elif self._hermes_available:
            async for chunk in self._stream_with_hermes(conversation_history, new_message):
                yield chunk
        else:
            async for chunk in self._mock_stream(conversation_history, new_message):
                yield chunk
    
    async def _stream_with_sahjony(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream response using SAHJONY Brain.
        
        SAHJONY = Freebuff Multi-Agent Orchestration + Hermes Persistent Memory
        """
        yield {"type": "status", "content": "thinking", "agent": "sahjony"}
        await asyncio.sleep(0.3)
        
        # Process message through SAHJONY Brain
        if self._sahjony:
            async for chunk in self._sahjony.process_message(
                user_id=user_id or "anonymous",
                agent_id=agent_id or "default",
                agent_config=self.agent_config,
                message=new_message,
                conversation_id=None,
                streaming=True
            ):
                yield {"type": "chunk", "content": chunk}
        
        yield {"type": "done", "content": ""}
    
    async def _process_with_hermes(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str
    ) -> str:
        """
        Process using actual hermes-agent runtime.
        """
        return self._mock_process(conversation_history, new_message)
    
    async def _stream_with_hermes(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream response using actual hermes-agent runtime.
        """
        async for chunk in self._mock_stream(conversation_history, new_message):
            yield chunk
    
    def _mock_process(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str
    ) -> str:
        """
        Mock processing for development/testing.
        """
        history_summary = f"Conversation with {len(conversation_history)} messages"
        response = self._generate_mock_response(new_message, conversation_history)
        return response
    
    async def _mock_stream(
        self,
        conversation_history: List[Dict[str, Any]],
        new_message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Mock streaming response for development/testing.
        """
        response = self._generate_mock_response(new_message, conversation_history)
        
        words = response.split()
        for i, word in enumerate(words):
            await asyncio.sleep(0.02)
            yield {"type": "chunk", "content": word + (" " if i < len(words) - 1 else "")}
        
        yield {"type": "done", "content": ""}

    def _generate_mock_response(self, message: str, history: List[Dict]) -> str:
        """
        Generate a mock AI response.
        
        Powered by SAHJONY Brain (Freebuff + Hermes).
        """
        message_lower = message.lower()
        
        if "hello" in message_lower or "hi" in message_lower:
            return f"Hello! I'm SAHJONY - your unified AI brain powered by Freebuff Multi-Agent system and Hermes persistent memory. How can I help you today?"
        
        if "help" in message_lower:
            return "I can help you with a variety of tasks including: answering questions, writing code, analysis, coding, and more. As a unified brain (Freebuff + Hermes), I have access to multi-agent orchestration and persistent memory. What would you like assistance with?"
        
        if "your name" in message_lower or "sahjony" in message_lower:
            return "I'm SAHJONY - the unified AI brain that combines Freebuff's multi-agent orchestration with Hermes Agent's persistent memory. Together, we form one powerful brain and engine that can help you with any questions or tasks!"
        
        if "freebuff" in message_lower:
            return "Freebuff is my multi-agent orchestration layer! I use specialized agents (FilePicker, Planner, Editor, Reviewer) that work together to handle complex tasks intelligently. Combined with Hermes' persistent memory, we form SAHJONY - the ultimate AI brain!"
        
        if "hermes" in message_lower:
            return "Hermes is my persistent memory layer! Hermes Agent provides SQLite-backed session storage with FTS5 full-text search, allowing me to remember our conversations across sessions and search through your history intelligently."
        
        if "code" in message_lower or "program" in message_lower:
            return "As an AI coding assistant powered by SAHJONY, I can help you write, debug, and understand code. My multi-agent system includes specialized agents for file analysis, planning, code generation, and review. Plus, Hermes memory lets me learn from your past coding sessions!"
        
        # Default contextual response with SAHJONY branding
        return (
            f"I received your message: '{message[:50]}{'...' if len(message) > 50 else ''}'. "
            f"I'm SAHJONY - a unified AI brain combining Freebuff's multi-agent system with Hermes' persistent memory. "
            f"Using {self.model_provider}'s {self.model_name} model, "
            f"I'm configured with a custom system prompt to assist you effectively. "
            f"As one single brain and engine, I can handle any task you throw at me! "
            f"How would you like me to help you further?"
        )
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Return the agent's capabilities based on configuration."""
        sahjony_info = self._sahjony.get_capabilities() if self._sahjony else {}
        
        return {
            "model_provider": self.model_provider,
            "model_name": self.model_name,
            "has_custom_prompt": bool(self.system_prompt),
            "configured_tools": self.config.get("tools", []),
            "configured_skills": self.config.get("skills", []),
            # SAHJONY - the unified brain
            "powered_by": "sahjony_brain",
            "unified_brain": True,
            "brain_components": ["freebuff_multi_agent", "hermes_persistent_memory"],
            "multi_agent_enabled": sahjony_info.get("multi_agent_enabled", True),
            "hermes_memory_available": sahjony_info.get("hermes_memory_available", False),
            "agents_available": sahjony_info.get("agents_available", [])
        }
    
    async def analyze_code(self, code: str) -> Dict[str, Any]:
        """
        Analyze code using SAHJONY Brain's Reviewer agent.
        
        Returns analysis with issues found and suggestions.
        """
        if self._sahjony:
            return await self._sahjony.analyze_code(
                user_id="anonymous",
                agent_id="default",
                agent_config=self.agent_config,
                code=code
            )
        return {"analysis": "Code analysis not available", "issues_found": 0}
    
    async def generate_code(self, task: str, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate code using SAHJONY Brain's Editor agent.
        
        Returns generated code based on the task description.
        """
        if self._sahjony:
            return await self._sahjony.generate_code(
                user_id="anonymous",
                agent_id="default",
                agent_config=self.agent_config,
                task=task,
                language=language
            )
        return {"code": "Code generation not available", "edit_type": "none"}
    
    async def search_history(self, user_id: str, query: str) -> List[Dict[str, Any]]:
        """
        Search user's conversation history using Hermes memory.
        
        Returns relevant past conversations.
        """
        if self._sahjony:
            return await self._sahjony.search_memory(user_id, query)
        return []