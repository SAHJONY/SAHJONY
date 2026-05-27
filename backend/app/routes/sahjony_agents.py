"""
Advanced Agent API endpoints for hermes-agent SaaS.

Exposes the advanced SAHJONY agent capabilities:
- Claude Code Agent (terminal operations, self-healing)
- Cursor Composer (multi-file editing)
- GitHub Copilot Agent (workspace awareness)
- Aider Agent (Git integration)
- Cody Agent (repo-level context)
- Planning Agent (multi-step with self-healing)
- Tool Agent (direct @bash, @read, @write operations)
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict, Any
from uuid import UUID

from ..middleware.auth import get_current_user_id
from ..services.sahjony_brain import sahjony_brain, SahjonyBrain

router = APIRouter(prefix="/sahjony/agents", tags=["SAHJONY Advanced Agents"])


# =============================================================================
# Agent Capabilities & Status
# =============================================================================

@router.get("/capabilities")
async def get_agent_capabilities():
    """
    Get SAHJONY Brain's advanced agent capabilities.
    
    Returns information about all available agents including:
    - Claude Code Agent (terminal operations)
    - Cursor Composer (multi-file editing)
    - Copilot Agent (workspace awareness)
    - Aider Agent (Git integration)
    - Cody Agent (repo-level context)
    - Planning Agent (multi-step with self-healing)
    - Tool Agent (direct tool execution)
    """
    return sahjony_brain.get_capabilities()


@router.get("/types")
async def get_agent_types():
    """
    Get list of all available SAHJONY agent types.
    
    Returns:
    - sahjony_core: The unified intelligence layer (default)
    - claude_code: Terminal-centric autonomous coding
    - cursor_composer: Multi-file editing across project
    - copilot_agent: Workspace awareness, autonomous tasks
    - aider_agent: Terminal-first with Git integration
    - cody_agent: Repo-level codebase context
    - planning_agent: Multi-step planning with self-healing
    - tool_agent: Direct tool execution (@bash, @read, etc.)
    """
    return {
        "agent_types": [
            {
                "id": "sahjony_core",
                "name": "SAHJONY Core",
                "description": "The unified intelligence layer that routes to appropriate specialized agents",
                "keywords": ["default", "auto", "smart routing", "orchestrate"]
            },
            {
                "id": "claude_code",
                "name": "Claude Code Agent",
                "description": "Terminal-centric autonomous coding agent with self-healing",
                "keywords": ["terminal", "bash", "shell", "execute", "run", "git", "self-healing"]
            },
            {
                "id": "cursor_composer",
                "name": "Cursor Composer",
                "description": "Multi-file editing agent that orchestrates changes across entire project",
                "keywords": ["create", "add", "new file", "multiple files", "edit many", "composer"]
            },
            {
                "id": "copilot_agent",
                "name": "GitHub Copilot Agent",
                "description": "Workspace awareness agent with Git context and autonomous task execution",
                "keywords": ["workspace", "github", "git flow", "autonomous", "context"]
            },
            {
                "id": "aider_agent",
                "name": "Aider Agent",
                "description": "Terminal-first coding agent with Git auto-commits and complex refactoring",
                "keywords": ["refactor", "git commit", "terminal first", "session-based"]
            },
            {
                "id": "cody_agent",
                "name": "Cody Agent",
                "description": "Repo-level codebase understanding with cross-service dependency analysis",
                "keywords": ["search codebase", "find everywhere", "context", "repo-level", "massive codebase"]
            },
            {
                "id": "planning_agent",
                "name": "Planning Agent",
                "description": "Multi-step execution agent with self-healing and failure recovery",
                "keywords": ["complex", "multi-step", "plan", "healing", "retry", "iterative"]
            },
            {
                "id": "tool_agent",
                "name": "Tool Agent",
                "description": "Direct tool execution via @mentions (@bash, @read, @write, @glob, @grep)",
                "keywords": ["@bash", "@read", "@write", "@glob", "@grep", "direct tool"]
            }
        ]
    }


# =============================================================================
# Task Execution Endpoints
# =============================================================================

@router.post("/execute")
async def execute_agent_task(
    task: str,
    task_type: str = "auto",
    user_id: str = Depends(get_current_user_id),
    agent_id: Optional[str] = None,
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute a task using a specific SAHJONY advanced agent.
    
    Args:
        task: The task description to execute
        task_type: Agent type to use ('claude_code', 'cursor', 'copilot', 'aider', 'cody', 'planning', 'tool', 'auto')
        user_id: Current user ID (from auth)
        agent_id: Optional specific agent ID to use
        agent_config: Optional configuration for the agent (model, system prompt, etc.)
    
    Returns:
        Task execution result with agent used, tools called, and confidence score
    """
    try:
        # Build agent config
        config = agent_config or {}
        if not config.get("model_provider"):
            config["model_provider"] = "anthropic"
        if not config.get("model_name"):
            config["model_name"] = "claude-3-5-sonnet-20241022"
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id=agent_id or "default",
            agent_config=config,
            task=task,
            task_type=task_type
        )
        
        return {
            "success": True,
            "task": task,
            "task_type": task_type,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")


@router.post("/claude-code/execute")
async def execute_claude_code_task(
    task: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute a task using Claude Code Agent style.
    
    Claude Code Agent capabilities:
    - Terminal operations (@bash)
    - File operations (@read, @write)
    - Glob pattern matching (@glob)
    - Code search (@grep)
    - Self-healing: reads errors and auto-modifies code
    - Agentic loop: plan -> execute -> observe -> adjust
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            task_type="claude_code"
        )
        
        return {
            "success": True,
            "agent": "claude_code",
            "task": task,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude Code execution failed: {str(e)}")


@router.post("/cursor/composer")
async def execute_cursor_composer(
    task: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute multi-file editing using Cursor Composer style.
    
    Cursor Composer capabilities:
    - Creates, edits, manages multiple files simultaneously
    - Orchestrates changes across entire project
    - Templates for TypeScript, React, Python, Go
    - API route generation
    - React component generation
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            task_type="cursor"
        )
        
        return {
            "success": True,
            "agent": "cursor_composer",
            "task": task,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cursor Composer execution failed: {str(e)}")


@router.post("/copilot/execute")
async def execute_copilot_task(
    task: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute a task with GitHub Copilot Agent style workspace awareness.
    
    Copilot Agent capabilities:
    - Git branch and status awareness
    - Autonomous multi-step task execution
    - Git flow synchronization
    - Human feedback at decision points
    - Real-time partner iteration
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            task_type="copilot"
        )
        
        return {
            "success": True,
            "agent": "copilot_agent",
            "task": task,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot Agent execution failed: {str(e)}")


@router.post("/aider/execute")
async def execute_aider_task(
    task: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute a task with Aider Agent style terminal-first Git integration.
    
    Aider Agent capabilities:
    - Terminal-centric workflow
    - Git auto-commits for changes
    - Complex refactoring across large codebases
    - Transparent Git operations
    - Session-based editing
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            task_type="aider"
        )
        
        return {
            "success": True,
            "agent": "aider_agent",
            "task": task,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Aider Agent execution failed: {str(e)}")


@router.post("/cody/search")
async def execute_cody_search(
    query: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Search the codebase using Cody Agent style repo-level context.
    
    Cody Agent capabilities:
    - Massive codebase context awareness
    - Understands service interactions across infrastructure
    - Cross-repository knowledge
    - Context aggregation from multiple files
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=f"Search the codebase for: {query}. Find all relevant files and explain how they relate.",
            task_type="cody"
        )
        
        return {
            "success": True,
            "agent": "cody_agent",
            "query": query,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cody Agent search failed: {str(e)}")


@router.post("/planning/execute")
async def execute_planning_task(
    task: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Execute a complex multi-step task with Planning Agent self-healing.
    
    Planning Agent capabilities:
    - Autonomous planning: Plan -> Act -> Observe -> Correct
    - Self-healing: reads errors and auto-modifies code
    - Iterative task completion with retry logic
    - Failure recovery with automatic retry
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.execute_task(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            task_type="planning"
        )
        
        return {
            "success": True,
            "agent": "planning_agent",
            "task": task,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planning Agent execution failed: {str(e)}")


@router.post("/tool/execute")
async def execute_tool_direct(
    command: str,
    tool_name: str = "bash",
    user_id: str = Depends(get_current_user_id)
):
    """
    Execute a direct tool call (Tool Agent style).
    
    Tool Agent supports:
    - @bash: Execute shell commands
    - @read: Read file contents
    - @write: Write content to file
    - @glob: Find files matching pattern
    - @grep: Search for pattern in files
    - @search: Semantic search using Hermes memory
    
    Args:
        command: The command/arguments for the tool
        tool_name: The tool to use (bash, read, write, glob, grep, search)
    """
    try:
        from ..services.sahjony_brain import ToolAgent, TaskContext, ToolCall
        
        tool_agent = ToolAgent()
        context = TaskContext(
            user_id=user_id,
            agent_id="default",
            agent_config={}
        )
        
        # Build tool call based on tool_name
        if tool_name == "bash":
            tool_call = ToolCall(name="bash", arguments={"command": command})
        elif tool_name == "read":
            tool_call = ToolCall(name="read", arguments={"path": command})
        elif tool_name == "glob":
            tool_call = ToolCall(name="glob", arguments={"pattern": command})
        elif tool_name == "grep":
            tool_call = ToolCall(name="grep", arguments={"pattern": command})
        else:
            tool_call = ToolCall(name="bash", arguments={"command": command})
        
        result = await tool_agent._execute_tool(tool_call, context)
        
        return {
            "success": not result.error,
            "tool": tool_name,
            "command": command,
            "result": result.result,
            "error": result.error,
            "duration_ms": result.duration_ms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")


# =============================================================================
# Code Analysis & Generation
# =============================================================================

@router.post("/analyze")
async def analyze_code(
    code: str,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Analyze code using SAHJONY Brain's Reviewer agent.
    
    Returns:
    - Identified issues and problems
    - Suggestions for improvements
    - Best practices recommendations
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.analyze_code(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            code=code
        )
        
        return {
            "success": True,
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")


@router.post("/generate")
async def generate_code(
    task: str,
    language: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    agent_config: Optional[Dict[str, Any]] = None
):
    """
    Generate code using SAHJONY Brain's Editor agent.
    
    Args:
        task: Description of what code to generate
        language: Optional preferred language (python, typescript, go, etc.)
    
    Returns:
    - Generated code
    - Edit type (api_endpoint, react_component, database_model, etc.)
    """
    try:
        config = agent_config or {"model_provider": "anthropic", "model_name": "claude-3-5-sonnet-20241022"}
        
        result = await sahjony_brain.generate_code(
            user_id=user_id,
            agent_id="default",
            agent_config=config,
            task=task,
            language=language
        )
        
        return {
            "success": True,
            "generated": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


# =============================================================================
# Memory & History
# =============================================================================

@router.get("/memory/search")
async def search_memory(
    query: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Search user's conversation history using SAHJONY's Hermes memory.
    
    Returns relevant past conversations and context.
    """
    try:
        results = await sahjony_brain.search_memory(user_id=user_id, query=query)
        return {
            "success": True,
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory search failed: {str(e)}")


@router.delete("/memory/clear")
async def clear_memory(
    user_id: str = Depends(get_current_user_id),
    agent_id: Optional[str] = None
):
    """
    Clear conversation history for the user.
    
    Args:
        agent_id: Optional specific agent to clear history for
    """
    try:
        if agent_id:
            sahjony_brain.clear_history(user_id, agent_id)
            return {"success": True, "message": f"Cleared history for agent {agent_id}"}
        else:
            # Clear all agents for user
            sahjony_brain.clear_history(user_id, "default")
            return {"success": True, "message": "Cleared all agent history for user"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear memory: {str(e)}")


# =============================================================================
# Health & Status
# =============================================================================

@router.get("/health")
async def health_check():
    """
    Check SAHJONY Brain health status.
    
    Returns:
    - Overall health status
    - Hermes memory availability
    - LLM provider configuration status
    """
    capabilities = sahjony_brain.get_capabilities()
    return {
        "status": "healthy",
        "service": "SAHJONY Brain (Advanced Agentic Edition)",
        "version": capabilities.get("version", "2.0.0"),
        "hermes_memory": capabilities.get("hermes_memory_available", False),
        "llm_providers": capabilities.get("llm_providers", {}),
        "any_llm_configured": capabilities.get("any_llm_configured", False),
        "advanced_agents_available": len(capabilities.get("advanced_agents", {})),
        "core_agents_count": len(capabilities.get("core_agents", []))
    }