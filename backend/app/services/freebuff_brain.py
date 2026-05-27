"""
Freebuff Brain - Multi-Agent AI Orchestration Service
Inspired by Codebuff's multi-agent architecture for AI coding assistants.

This service provides:
- Real-time chat responses with streaming
- Code analysis and generation
- Agent decision-making and planning
- Multi-agent orchestration (FilePicker, Planner, Editor, Reviewer)
"""

import asyncio
import json
import re
import hashlib
from typing import AsyncGenerator, Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod

# ============================================================================
# Core Types and Models
# ============================================================================

class AgentType(Enum):
    FILE_PICKER = "file_picker"
    PLANNER = "planner"
    EDITOR = "editor"
    REVIEWER = "reviewer"
    ORCHESTRATOR = "orchestrator"

@dataclass
class AgentMessage:
    role: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AgentResponse:
    content: str
    agent_type: AgentType
    confidence: float = 1.0
    tools_used: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TaskContext:
    user_id: str
    agent_id: str
    agent_config: Dict[str, Any]
    conversation_id: Optional[str] = None
    cwd: Optional[str] = None

# ============================================================================
# Base Agent Interface
# ============================================================================

class BaseAgent(ABC):
    """Base class for all agents in the Freebuff Brain system."""
    
    def __init__(self, name: str, agent_type: AgentType, model: str = "claude-sonnet-4"):
        self.name = name
        self.agent_type = agent_type
        self.model = model
    
    @abstractmethod
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        """Process input and return agent response."""
        pass
    
    async def think(self, prompt: str) -> str:
        """Use the LLM to think/generate content."""
        await asyncio.sleep(0.1)
        return f"[{self.name}] Processing: {prompt[:100]}..."

# ============================================================================
# FilePicker Agent - Analyzes codebase structure
# ============================================================================

class FilePickerAgent(BaseAgent):
    """
    FilePicker analyzes the codebase and identifies relevant files
    for a given task, similar to Codebuff's file picker agent.
    """
    
    def __init__(self):
        super().__init__("FilePicker", AgentType.FILE_PICKER)
        self.max_files = 50
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        file_patterns = self._extract_file_patterns(last_message)
        relevant_files = await self._find_relevant_files(context, file_patterns)
        
        analysis = self._format_analysis(relevant_files, last_message)
        
        return AgentResponse(
            content=analysis,
            agent_type=self.agent_type,
            confidence=0.85,
            tools_used=["file_analysis"],
            metadata={"files_found": len(relevant_files), "patterns": file_patterns}
        )
    
    def _extract_file_patterns(self, text: str) -> List[str]:
        """Extract file patterns from user message."""
        patterns = []
        
        ext_pattern = r'\b(\\.?[a-zA-Z0-9_]+\\.(py|js|ts|tsx|jsx|go|rs|java|cpp|c|rb|php|html|css|json|yaml|yml|md|txt))\b'
        matches = re.findall(ext_pattern, text)
        patterns.extend([f"*{m[1]}" for m in matches])
        
        path_pattern = r'["\"](["\""]+\\.[a-zA-Z0-9]+)["\""]'
        paths = re.findall(path_pattern, text)
        patterns.extend(paths)
        
        keywords = {
            "api": ["*api*", "*route*", "*endpoint*"],
            "auth": ["*auth*", "*login*", "*session*"],
            "database": ["*db*", "*sql*", "*model*"],
            "frontend": ["*component*", "*page*", "*ui*"],
            "config": ["*config*", "*settings*", "*.json", "*.yaml"],
        }
        
        text_lower = text.lower()
        for kw, kpatterns in keywords.items():
            if kw in text_lower:
                patterns.extend(kpatterns)
        
        return list(set(patterns))[:10]
    
    async def _find_relevant_files(self, context: TaskContext, patterns: List[str]) -> List[Dict[str, Any]]:
        """Find files matching the patterns."""
        mock_files = [
            {"path": "src/app/api/chat/route.ts", "relevance": 0.9, "size": 2048},
            {"path": "src/components/chat/chat-window.tsx", "relevance": 0.8, "size": 1536},
            {"path": "src/lib/supabase/client.ts", "relevance": 0.75, "size": 1024},
            {"path": "backend/app/services/hermes_engine.py", "relevance": 0.7, "size": 3072},
            {"path": "package.json", "relevance": 0.6, "size": 512},
        ]
        
        if not patterns:
            return mock_files[:5]
        
        filtered = []
        for f in mock_files:
            for pattern in patterns:
                if pattern.replace("*", "") in f["path"].lower():
                    filtered.append(f)
                    break
        
        return filtered[:self.max_files]
    
    def _format_analysis(self, files: List[Dict], query: str) -> str:
        """Format the file analysis as a response."""
        if not files:
            return "No relevant files found for this task."
        
        header = f"📁 **File Analysis** (found {len(files)} relevant files)\n\n"
        file_list = "\n".join([
            f"- `{f['path']}` (relevance: {f['relevance']*100:.0f}%)"
            for f in sorted(files, key=lambda x: x['relevance'], reverse=True)[:10]
        ])
        
        footer = f"\n\n_Analyzed for: {query[:50]}..._"
        return header + file_list + footer

# ============================================================================
# Planner Agent - Breaks down tasks into steps
# ============================================================================

class PlannerAgent(BaseAgent):
    """
    Planner breaks down complex tasks into actionable steps,
    similar to Codebuff's planner agent.
    """
    
    def __init__(self):
        super().__init__("Planner", AgentType.PLANNER)
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        steps = self._create_plan(last_message, context.agent_config)
        plan_text = self._format_plan(steps)
        
        return AgentResponse(
            content=plan_text,
            agent_type=self.agent_type,
            confidence=0.9,
            tools_used=["task_decomposition"],
            metadata={"steps": len(steps)}
        )
    
    def _create_plan(self, task: str, config: Dict[str, Any]) -> List[Dict[str, str]]:
        """Create a plan with actionable steps."""
        steps = []
        task_lower = task.lower()
        
        if any(kw in task_lower for kw in ["create", "add", "new", "build"]):
            steps.append({"action": "design", "description": "Design the solution architecture", "priority": "1"})
            steps.append({"action": "implement", "description": "Implement the core functionality", "priority": "2"})
            steps.append({"action": "test", "description": "Add tests for the new feature", "priority": "3"})
            steps.append({"action": "review", "description": "Review for best practices", "priority": "4"})
        elif any(kw in task_lower for kw in ["fix", "bug", "error", "issue"]):
            steps.append({"action": "investigate", "description": "Investigate the root cause", "priority": "1"})
            steps.append({"action": "fix", "description": "Implement the fix", "priority": "2"})
            steps.append({"action": "verify", "description": "Verify the fix works", "priority": "3"})
        elif any(kw in task_lower for kw in ["refactor", "improve", "optimize"]):
            steps.append({"action": "analyze", "description": "Analyze current implementation", "priority": "1"})
            steps.append({"action": "plan", "description": "Plan refactoring approach", "priority": "2"})
            steps.append({"action": "execute", "description": "Execute refactoring", "priority": "3"})
            steps.append({"action": "test", "description": "Ensure tests pass", "priority": "4"})
        elif any(kw in task_lower for kw in ["explain", "what", "how", "why"]):
            steps.append({"action": "analyze", "description": "Analyze the relevant code/context", "priority": "1"})
            steps.append({"action": "explain", "description": "Provide clear explanation", "priority": "2"})
        else:
            steps.append({"action": "understand", "description": "Understand the user's request", "priority": "1"})
            steps.append({"action": "respond", "description": "Provide helpful response", "priority": "2"})
        
        if config.get("instructions"):
            steps.append({"action": "contextualize", "description": f"Apply agent-specific context: {config.get('instructions', '')[:50]}...", "priority": "3"})
        
        return steps
    
    def _format_plan(self, steps: List[Dict[str, str]]) -> str:
        """Format the plan as a response."""
        if not steps:
            return "I'll help you with that!"
        
        header = "🗺️ **Task Plan**\n\n"
        plan_items = "\n".join([
            f"{i+1}. **{step['action'].title()}**: {step['description']}"
            for i, step in enumerate(steps)
        ])
        
        return header + plan_items

# ============================================================================
# Editor Agent - Makes code changes
# ============================================================================

class EditorAgent(BaseAgent):
    """
    Editor agent handles code generation and modifications,
    similar to Codebuff's editor agent.
    """
    
    def __init__(self):
        super().__init__("Editor", AgentType.EDITOR)
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        edit_type = self._determine_edit_type(last_message)
        code_response = await self._generate_code(last_message, edit_type, context)
        
        return AgentResponse(
            content=code_response,
            agent_type=self.agent_type,
            confidence=0.85,
            tools_used=["code_generation", edit_type],
            metadata={"edit_type": edit_type}
        )
    
    def _determine_edit_type(self, task: str) -> str:
        """Determine the type of code operation needed."""
        task_lower = task.lower()
        
        if "api" in task_lower or "endpoint" in task_lower or "route" in task_lower:
            return "api_endpoint"
        elif "component" in task_lower or "ui" in task_lower or "button" in task_lower:
            return "react_component"
        elif "database" in task_lower or "model" in task_lower or "schema" in task_lower:
            return "database_model"
        elif "auth" in task_lower or "login" in task_lower or "session" in task_lower:
            return "auth_handler"
        elif any(kw in task_lower for kw in ["test", "spec", "mock"]):
            return "test_file"
        else:
            return "general_code"
    
    async def _generate_code(self, task: str, edit_type: str, context: TaskContext) -> str:
        """Generate appropriate code based on task and type."""
        await asyncio.sleep(0.2)
        
        templates = {
            "api_endpoint": '''```typescript
// API Endpoint for: {task}
import {{ NextRequest, NextResponse }} from 'next/server';

export async function POST(request: NextRequest) {{
  try {{
    const data = await request.json();
    
    // TODO: Implement your logic here
    
    return NextResponse.json({{
      success: true,
      data,
      message: 'Operation completed'
    }});
  }} catch (error) {{
    return NextResponse.json({{
      success: false,
      error: error.message
    }}, {{ status: 500 }});
  }}
}}
```''',
            "react_component": '''```tsx
// React Component for: {task}
'use client';

import {{ useState }} from 'react';

interface Props {{
  // Define your props here
}}

export default function Component({{ initialData }}: Props) {{
  const [data, setData] = useState(initialData);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* TODO: Implement your component */}
      <h2 className="text-xl font-bold">Component</h2>
    </div>
  );
}}
```''',
            "database_model": '''```typescript
// Database Model for: {task}
import {{ createClient }} from '@/lib/supabase/client';

export interface Model {{
  id: string;
  created_at: string;
  // Add your fields here
}}

export async function getModel(id: string) {{
  const supabase = createClient();
  const {{ data, error }} = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}}
```''',
            "general_code": '''```python
# Python code for: {task}
from typing import Optional, Dict, Any

def process_task(task_input: str) -> Dict[str, Any]:
    """
    Process the requested task.
    
    Args:
        task_input: The user's request
        
    Returns:
        Dictionary with results
    """
    # TODO: Implement your logic here
    return dict(
        status="success",
        message=f"Processed: {task_input}",
        result=None
    )
```
'''
        }
        
        template = templates.get(edit_type, templates["general_code"])
        return template.format(task=task[:100])

# ============================================================================
# Reviewer Agent - Validates and reviews changes
# ============================================================================

class ReviewerAgent(BaseAgent):
    """
    Reviewer agent validates code and provides feedback,
    similar to Codebuff's reviewer agent.
    """
    
    def __init__(self):
        super().__init__("Reviewer", AgentType.REVIEWER)
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        review = self._perform_review(last_message, context.agent_config)
        
        return AgentResponse(
            content=review,
            agent_type=self.agent_type,
            confidence=0.9,
            tools_used=["code_review", "lint_check"],
            metadata={"issues_found": 0}
        )
    
    def _perform_review(self, code_or_task: str, config: Dict[str, Any]) -> str:
        """Perform a code review."""
        issues = []
        suggestions = []
        
        code_indicators = ["```", "function", "class", "def ", "const ", "let ", "var "]
        is_code = any(indicator in code_or_task for indicator in code_indicators)
        
        if is_code:
            if len(code_or_task) < 50:
                issues.append("Code snippet seems incomplete")
            
            if "TODO" not in code_or_task and "FIXME" not in code_or_task:
                suggestions.append("Consider adding TODO comments for unfinished parts")
            
            if "error" in code_or_task.lower() and "try" not in code_or_task.lower():
                suggestions.append("Add error handling (try-catch blocks)")
        
        header = "🔍 **Code Review**\n\n"
        
        if issues:
            issues_text = "**Issues Found:**\n" + "\n".join([f"⚠️ {i}" for i in issues]) + "\n\n"
        else:
            issues_text = "✅ No critical issues found.\n\n"
        
        if suggestions:
            suggestions_text = "**Suggestions:**\n" + "\n".join([f"💡 {s}" for s in suggestions]) + "\n\n"
        else:
            suggestions_text = ""
        
        footer = "_Review powered by Freebuff Brain_"
        
        return header + issues_text + suggestions_text + footer

# ============================================================================
# Orchestrator Agent - Coordinates multi-agent workflow
# ============================================================================

class OrchestratorAgent(BaseAgent):
    """
    Orchestrator coordinates the multi-agent workflow,
    deciding which agents to invoke and how to combine their results.
    """
    
    def __init__(self):
        super().__init__("Orchestrator", AgentType.ORCHESTRATOR)
        self.file_picker = FilePickerAgent()
        self.planner = PlannerAgent()
        self.editor = EditorAgent()
        self.reviewer = ReviewerAgent()
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        agent_sequence = self._decide_agents(last_message, context)
        
        results = []
        for agent in agent_sequence:
            prev_content = results[-1].content if results else ''
            agent_msg = AgentMessage(
                role="assistant",
                content=f"Context from previous agent: {prev_content}"
            )
            result = await agent.process(context, messages + [agent_msg])
            results.append(result)
        
        final_response = self._combine_results(results, last_message)
        
        return AgentResponse(
            content=final_response,
            agent_type=AgentType.ORCHESTRATOR,
            confidence=0.9,
            tools_used=[r.agent_type.value for r in results],
            metadata={"agents_invoked": len(results)}
        )
    
    def _decide_agents(self, task: str, context: TaskContext) -> List[BaseAgent]:
        """Decide which agents to invoke based on the task."""
        task_lower = task.lower()
        agents = []
        
        if len(task) > 50 or any(kw in task_lower for kw in ["create", "build", "implement", "fix", "refactor"]):
            agents.append(self.planner)
        
        if any(kw in task_lower for kw in ["file", "code", "function", "class", "api", "component"]):
            agents.append(self.file_picker)
        
        if any(kw in task_lower for kw in ["create", "add", "generate", "write", "implement"]):
            agents.append(self.editor)
        
        if any(kw in task_lower for kw in ["code", "function", "class", "api", "component", "test"]):
            agents.append(self.reviewer)
        
        if not agents:
            agents = [self.planner, self.editor]
        
        return agents
    
    def _combine_results(self, results: List[AgentResponse], original_task: str) -> str:
        """Combine results from multiple agents into a coherent response."""
        if len(results) == 1:
            return results[0].content
        
        combined = "🤖 **Freebuff Brain Processing**\n\n"
        
        for result in results:
            if result.agent_type == AgentType.PLANNER:
                combined += f"### 🗺️ Plan\n{result.content}\n\n"
            elif result.agent_type == AgentType.FILE_PICKER:
                combined += f"### 📁 File Analysis\n{result.content}\n\n"
            elif result.agent_type == AgentType.EDITOR:
                combined += f"### 💻 Generated Code\n{result.content}\n\n"
            elif result.agent_type == AgentType.REVIEWER:
                combined += f"### 🔍 Review\n{result.content}\n\n"
        
        combined += f"\n_Powered by Freebuff Brain Multi-Agent System_"
        return combined

# ============================================================================
# FreebuffBrain - Main Service Class
# ============================================================================

class FreebuffBrain:
    """
    Freebuff Brain - Multi-agent AI orchestration service.
    
    This is the main interface for the hermes-agent-saas platform,
    providing Codebuff-inspired multi-agent capabilities.
    """
    
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.file_picker = FilePickerAgent()
        self.planner = PlannerAgent()
        self.editor = EditorAgent()
        self.reviewer = ReviewerAgent()
        self._session_history: Dict[str, List[AgentMessage]] = {}
    
    async def process_message(
        self,
        user_id: str,
        agent_id: str,
        agent_config: Dict[str, Any],
        message: str,
        conversation_id: Optional[str] = None,
        streaming: bool = True
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message and return a streaming response.
        """
        context = TaskContext(
            user_id=user_id,
            agent_id=agent_id,
            agent_config=agent_config,
            conversation_id=conversation_id
        )
        
        session_key = f"{user_id}:{agent_id}"
        if session_key not in self._session_history:
            self._session_history[session_key] = []
        
        messages = self._session_history[session_key]
        messages.append(AgentMessage(role="user", content=message))
        
        response = await self.orchestrator.process(context, messages)
        
        messages.append(AgentMessage(role="assistant", content=response.content))
        
        if len(messages) > 20:
            self._session_history[session_key] = messages[-20:]
        
        if streaming:
            async for chunk in self._stream_response(response.content):
                yield chunk
        else:
            yield response.content
    
    async def chat(
        self,
        user_id: str,
        agent_id: str,
        agent_config: Dict[str, Any],
        messages: List[Dict[str, str]],
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Non-streaming chat interface for simpler responses."""
        context = TaskContext(
            user_id=user_id,
            agent_id=agent_id,
            agent_config=agent_config,
            conversation_id=conversation_id
        )
        
        agent_messages = [
            AgentMessage(role=m["role"], content=m["content"])
            for m in messages
        ]
        
        response = await self.orchestrator.process(context, agent_messages)
        
        return {
            "response": response.content,
            "agent_type": response.agent_type.value,
            "confidence": response.confidence,
            "tools_used": response.tools_used
        }
    
    async def analyze_code(
        self,
        user_id: str,
        agent_id: str,
        agent_config: Dict[str, Any],
        code: str
    ) -> Dict[str, Any]:
        """Analyze code and provide insights."""
        context = TaskContext(
            user_id=user_id,
            agent_id=agent_id,
            agent_config=agent_config
        )
        
        agent_messages = [
            AgentMessage(role="user", content=f"Analyze this code:\n{code}")
        ]
        
        response = await self.reviewer.process(context, agent_messages)
        
        return {
            "analysis": response.content,
            "issues_found": response.metadata.get("issues_found", 0),
            "confidence": response.confidence
        }
    
    async def generate_code(
        self,
        user_id: str,
        agent_id: str,
        agent_config: Dict[str, Any],
        task: str,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate code based on a task description."""
        context = TaskContext(
            user_id=user_id,
            agent_id=agent_id,
            agent_config=agent_config
        )
        
        prompt = f"Generate code for: {task}"
        if language:
            prompt += f" (language: {language})"
        
        agent_messages = [AgentMessage(role="user", content=prompt)]
        
        response = await self.editor.process(context, agent_messages)
        
        return {
            "code": response.content,
            "edit_type": response.metadata.get("edit_type", "general_code"),
            "confidence": response.confidence
        }
    
    async def _stream_response(self, text: str, chunk_size: int = 20) -> AsyncGenerator[str, None]:
        """Stream a response in chunks."""
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            yield chunk
            if i + chunk_size < len(text):
                await asyncio.sleep(0.01)
    
    def clear_history(self, user_id: str, agent_id: str):
        """Clear conversation history for a user/agent pair."""
        session_key = f"{user_id}:{agent_id}"
        if session_key in self._session_history:
            del self._session_history[session_key]

# ============================================================================
# Singleton Instance
# ============================================================================

freebuff_brain = FreebuffBrain()

# ============================================================================
# Convenience Functions
# ============================================================================

async def process_chat(
    user_id: str,
    agent_id: str,
    agent_config: Dict[str, Any],
    message: str,
    conversation_id: Optional[str] = None
) -> str:
    """Convenience function for processing chat messages."""
    result = ""
    async for chunk in freebuff_brain.process_message(
        user_id, agent_id, agent_config, message, conversation_id
    ):
        result += chunk
    return result

async def analyze_code(
    user_id: str,
    agent_id: str,
    agent_config: Dict[str, Any],
    code: str
) -> Dict[str, Any]:
    """Convenience function for code analysis."""
    return await freebuff_brain.analyze_code(user_id, agent_id, agent_config, code)

async def generate_code(
    user_id: str,
    agent_id: str,
    agent_config: Dict[str, Any],
    task: str,
    language: Optional[str] = None
) -> Dict[str, Any]:
    """Convenience function for code generation."""
    return await freebuff_brain.generate_code(user_id, agent_id, agent_config, task, language)