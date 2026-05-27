"""
LLM Provider Integration for SAHJONY Brain
==========================================

Supports:
- Anthropic (Claude models)
- OpenAI (GPT-4, GPT-4o, GPT-3.5)
- Google (Gemini models)

Environment Variables:
- ANTHROPIC_API_KEY (required for Claude)
- OPENAI_API_KEY (required for GPT models)
- GOOGLE_API_KEY (required for Gemini)
"""

import os
import json
import asyncio
from typing import Optional, Dict, Any, List, AsyncGenerator
from dataclasses import dataclass
from enum import Enum
import base64

# ============================================================================
# Provider Enum and Config
# ============================================================================

class LLMProvider(Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GOOGLE = "google"
    AUTO = "auto"  # Select based on model name

@dataclass
class LLMConfig:
    provider: LLMProvider
    model: str
    api_key: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    system_prompt: Optional[str] = None

# ============================================================================
# Base LLM Provider
# ============================================================================

class BaseLLMProvider:
    """Base class for LLM providers."""
    
    def __init__(self, config: LLMConfig):
        self.config = config
    
    async def complete(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate completion from messages."""
        raise NotImplementedError
    
    async def complete_stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """Generate streaming completion."""
        raise NotImplementedError
    
    def supports_vision(self) -> bool:
        """Check if provider supports vision."""
        return False

# ============================================================================
# Anthropic Provider (Claude)
# ============================================================================

class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude provider."""
    
    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.api_key = config.api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.base_url = "https://api.anthropic.com/v1"
    
    def _get_headers(self) -> Dict[str, str]:
        return {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
    
    async def complete(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate Claude completion."""
        if not self.api_key:
            return self._mock_response("Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.")
        
        try:
            import httpx
            
            # Convert messages format
            claude_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    continue  # System prompt handled separately
                claude_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            data = {
                "model": self.config.model,
                "messages": claude_messages,
                "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
                "temperature": kwargs.get("temperature", self.config.temperature),
                "system": self.config.system_prompt or "You are SAHJONY, a unified AI assistant powered by multi-agent orchestration and persistent memory."
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/messages",
                    headers=self._get_headers(),
                    json=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["content"][0]["text"]
                else:
                    return f"Anthropic API error: {response.status_code} - {response.text}"
                    
        except ImportError:
            return "httpx not installed. Run: pip install httpx"
        except Exception as e:
            return f"Anthropic API error: {str(e)}"
    
    async def complete_stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """Generate streaming Claude completion."""
        if not self.api_key:
            yield "Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable."
            return
        
        try:
            import httpx
            
            claude_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    continue
                claude_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            data = {
                "model": self.config.model,
                "messages": claude_messages,
                "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
                "temperature": kwargs.get("temperature", self.config.temperature),
                "system": self.config.system_prompt or "You are SAHJONY.",
                "stream": True
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/messages",
                    headers=self._get_headers(),
                    json=data
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            if line[6:].strip() == "[DONE]":
                                break
                            try:
                                chunk = json.loads(line[6:])
                                if chunk.get("type") == "content_block_delta":
                                    if chunk.get("delta", {}).get("type") == "text_delta":
                                        yield chunk["delta"]["text"]
                            except:
                                pass
                                
        except ImportError:
            yield "httpx not installed."
        except Exception as e:
            yield f"Anthropic error: {str(e)}"
    
    def supports_vision(self) -> bool:
        return True

# ============================================================================
# OpenAI Provider (GPT-4, GPT-3.5)
# ============================================================================

class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT provider."""
    
    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.api_key = config.api_key or os.environ.get("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1"
    
    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "content-type": "application/json"
        }
    
    async def complete(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate GPT completion."""
        if not self.api_key:
            return self._mock_response("OpenAI API key not configured. Set OPENAI_API_KEY environment variable.")
        
        try:
            import httpx
            
            # Map role names for OpenAI
            openai_messages = []
            for msg in messages:
                role = msg["role"] if msg["role"] in ["user", "assistant", "system"] else "user"
                openai_messages.append({"role": role, "content": msg["content"]})
            
            if self.config.system_prompt:
                openai_messages.insert(0, {"role": "system", "content": self.config.system_prompt})
            
            data = {
                "model": self.config.model,
                "messages": openai_messages,
                "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
                "temperature": kwargs.get("temperature", self.config.temperature)
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    return f"OpenAI API error: {response.status_code} - {response.text}"
                    
        except ImportError:
            return "httpx not installed. Run: pip install httpx"
        except Exception as e:
            return f"OpenAI API error: {str(e)}"
    
    async def complete_stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """Generate streaming GPT completion."""
        if not self.api_key:
            yield "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
            return
        
        try:
            import httpx
            
            openai_messages = []
            for msg in messages:
                role = msg["role"] if msg["role"] in ["user", "assistant", "system"] else "user"
                openai_messages.append({"role": role, "content": msg["content"]})
            
            if self.config.system_prompt:
                openai_messages.insert(0, {"role": "system", "content": self.config.system_prompt})
            
            data = {
                "model": self.config.model,
                "messages": openai_messages,
                "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
                "temperature": kwargs.get("temperature", self.config.temperature),
                "stream": True
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=data
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            if line[6:].strip() == "[DONE]":
                                break
                            try:
                                chunk = json.loads(line[6:])
                                if chunk.get("choices", [{}])[0].get("delta", {}).get("content"):
                                    yield chunk["choices"][0]["delta"]["content"]
                            except:
                                pass
                                
        except ImportError:
            yield "httpx not installed."
        except Exception as e:
            yield f"OpenAI error: {str(e)}"
    
    def supports_vision(self) -> bool:
        return self.config.model in ["gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4o", "gpt-4o-mini"]

# ============================================================================
# Google Provider (Gemini)
# ============================================================================

class GoogleProvider(BaseLLMProvider):
    """Google Gemini provider."""
    
    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.api_key = config.api_key or os.environ.get("GOOGLE_API_KEY")
        # Gemini API endpoint
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models"
    
    async def complete(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate Gemini completion."""
        if not self.api_key:
            return self._mock_response("Google API key not configured. Set GOOGLE_API_KEY environment variable.")
        
        try:
            import httpx
            
            # Convert messages to Gemini format
            contents = []
            for msg in messages:
                if msg["role"] == "system":
                    continue
                contents.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [{"text": msg["content"]}]
                })
            
            data = {
                "contents": contents,
                "generationConfig": {
                    "maxOutputTokens": kwargs.get("max_tokens", self.config.max_tokens),
                    "temperature": kwargs.get("temperature", self.config.temperature)
                }
            }
            
            model_url = f"{self.base_url}/{self.config.model}:generateContent?key={self.api_key}"
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    model_url,
                    json=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("candidates"):
                        return result["candidates"][0]["content"]["parts"][0]["text"]
                    return "No response from Gemini"
                else:
                    return f"Google API error: {response.status_code} - {response.text}"
                    
        except ImportError:
            return "httpx not installed. Run: pip install httpx"
        except Exception as e:
            return f"Google API error: {str(e)}"
    
    async def complete_stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """Generate streaming Gemini completion."""
        if not self.api_key:
            yield "Google API key not configured. Set GOOGLE_API_KEY environment variable."
            return
        
        try:
            import httpx
            
            contents = []
            for msg in messages:
                if msg["role"] == "system":
                    continue
                contents.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [{"text": msg["content"]}]
                })
            
            data = {
                "contents": contents,
                "generationConfig": {
                    "maxOutputTokens": kwargs.get("max_tokens", self.config.max_tokens),
                    "temperature": kwargs.get("temperature", self.config.temperature)
                }
            }
            
            model_url = f"{self.base_url}/{self.config.model}:streamGenerateContent?key={self.api_key}"
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    model_url,
                    json=data
                ) as response:
                    async for line in response.aiter_lines():
                        try:
                            chunk = json.loads(line)
                            if chunk.get("candidates"):
                                text = chunk["candidates"][0]["content"]["parts"][0]["text"]
                                yield text
                        except:
                            pass
                                
        except ImportError:
            yield "httpx not installed."
        except Exception as e:
            yield f"Google error: {str(e)}"
    
    def supports_vision(self) -> bool:
        return "vision" in self.config.model.lower() or "gemini-1.5" in self.config.model

# ============================================================================
# LLM Factory
# ============================================================================

class LLMProviderFactory:
    """Factory for creating LLM provider instances."""
    
    @staticmethod
    def create(config: LLMConfig) -> BaseLLMProvider:
        """Create an LLM provider based on configuration."""
        provider = config.provider
        
        # Auto-detect provider based on model name
        if provider == LLMProvider.AUTO:
            model_lower = config.model.lower()
            if "claude" in model_lower:
                provider = LLMProvider.ANTHROPIC
            elif "gpt" in model_lower or "o1" in model_lower or "o3" in model_lower:
                provider = LLMProvider.OPENAI
            elif "gemini" in model_lower:
                provider = LLMProvider.GOOGLE
            else:
                # Default to Anthropic for Claude-family models
                provider = LLMProvider.ANTHROPIC
        
        if provider == LLMProvider.ANTHROPIC:
            return AnthropicProvider(config)
        elif provider == LLMProvider.OPENAI:
            return OpenAIProvider(config)
        elif provider == LLMProvider.GOOGLE:
            return GoogleProvider(config)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    @staticmethod
    def create_from_dict(config_dict: Dict[str, Any]) -> BaseLLMProvider:
        """Create provider from configuration dictionary."""
        provider_str = config_dict.get("provider", "auto")
        if isinstance(provider_str, str):
            try:
                provider = LLMProvider(provider_str.lower())
            except ValueError:
                provider = LLMProvider.AUTO
        else:
            provider = LLMProvider.AUTO
        
        config = LLMConfig(
            provider=provider,
            model=config_dict.get("model_name", config_dict.get("model", "claude-sonnet-4")),
            api_key=config_dict.get("api_key"),
            max_tokens=config_dict.get("max_tokens", 4096),
            temperature=config_dict.get("temperature", 0.7),
            system_prompt=config_dict.get("system_prompt")
        )
        
        return LLMProviderFactory.create(config)

# ============================================================================
# Mock Response (for when no API keys are configured)
# ============================================================================

class MockLLMProvider(BaseLLMProvider):
    """Mock provider for development/testing."""
    
    async def complete(self, messages: List[Dict[str, str]], **kwargs) -> str:
        return self._mock_response(messages)
    
    async def complete_stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        response = self._mock_response(messages)
        for chunk in response.split():
            yield chunk + " "
            await asyncio.sleep(0.05)
    
    def _mock_response(self, messages: List[Dict[str, str]]) -> str:
        """Generate a mock response based on messages."""
        last_message = messages[-1]["content"] if messages else ""
        last_message_lower = last_message.lower()
        
        if "hello" in last_message_lower or "hi" in last_message_lower:
            return "Hello! I'm SAHJONY, powered by real AI. How can I assist you today?"
        
        if "help" in last_message_lower:
            return "I can help you with a wide range of tasks including coding, analysis, writing, and problem-solving. What would you like assistance with?"
        
        if "your name" in last_message_lower or "sahjony" in last_message_lower:
            return "I'm SAHJONY - the Unified AI Brain. I combine multiple AI technologies (Claude, GPT, Gemini) with multi-agent orchestration and persistent memory."
        
        if "create" in last_message_lower or "write" in last_message_lower or "code" in last_message_lower:
            return f"I can help you create that! As a real AI powered by LLM APIs, I can generate code, write documentation, and help with development tasks. Please provide more details about what you'd like me to create."
        
        return f"I understand you're asking about: '{last_message[:50]}...' Let me help you with that. To enable full AI capabilities, please configure your API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY)."

# ============================================================================
# Convenience Functions
# ============================================================================

def get_llm_provider(agent_config: Dict[str, Any]) -> BaseLLMProvider:
    """
    Get LLM provider based on agent configuration.
    
    Agent config should include:
    - model_provider: 'anthropic', 'openai', 'google', 'auto'
    - model_name: e.g., 'claude-3-5-sonnet', 'gpt-4o', 'gemini-2.0-flash'
    - api_key: (optional, will use env vars if not provided)
    - system_prompt: (optional)
    """
    provider_str = agent_config.get("model_provider", "auto")
    
    try:
        provider = LLMProvider(provider_str.lower())
    except ValueError:
        provider = LLMProvider.AUTO
    
    # Check if we have any API keys configured
    has_anthropic = bool(os.environ.get("ANTHROPIC_API_KEY"))
    has_openai = bool(os.environ.get("OPENAI_API_KEY"))
    has_google = bool(os.environ.get("GOOGLE_API_KEY"))
    
    if not (has_anthropic or has_openai or has_google):
        # Return mock provider if no API keys
        config = LLMConfig(
            provider=LLMProvider.ANTHROPIC,
            model=agent_config.get("model_name", "claude-sonnet-4"),
            system_prompt=agent_config.get("system_prompt")
        )
        return MockLLMProvider(config)
    
    config = LLMConfig(
        provider=provider,
        model=agent_config.get("model_name", "claude-3-5-sonnet-20241022"),
        api_key=agent_config.get("api_key"),
        max_tokens=agent_config.get("max_tokens", 4096),
        temperature=agent_config.get("temperature", 0.7),
        system_prompt=agent_config.get("system_prompt")
    )
    
    return LLMProviderFactory.create(config)

async def complete_with_llm(
    agent_config: Dict[str, Any],
    messages: List[Dict[str, str]],
    **kwargs
) -> str:
    """Convenience function to complete with configured LLM."""
    provider = get_llm_provider(agent_config)
    return await provider.complete(messages, **kwargs)

async def complete_stream_with_llm(
    agent_config: Dict[str, Any],
    messages: List[Dict[str, str]],
    **kwargs
) -> AsyncGenerator[str, None]:
    """Convenience function for streaming completion."""
    provider = get_llm_provider(agent_config)
    async for chunk in provider.complete_stream(messages, **kwargs):
        yield chunk