# Routes package
from .auth import router as auth_router
from .agents import router as agents_router
from .conversations import router as conversations_router
from .chat import router as chat_router
from .keys import router as keys_router
from .sahjony_agents import router as sahjony_agents_router
from .support import router as support_router
from .admin import router as admin_router
from .twenty_crm import router as twenty_router

__all__ = [
    "auth_router",
    "agents_router",
    "conversations_router",
    "chat_router",
    "keys_router",
    "sahjony_agents_router",
    "support_router",
    "admin_router",
    "twenty_router",
]