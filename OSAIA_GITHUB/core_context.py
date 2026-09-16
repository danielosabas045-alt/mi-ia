"""
OSAIA CORE - Gestor de Contexto
Mantiene el estado de una conversación: historial, archivos, tareas, preferencias.
"""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"
    AGENT = "agent"


@dataclass
class Message:
    role: MessageRole
    content: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = field(default_factory=dict)
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    def to_dict(self) -> Dict[str, Any]:
        return {"message_id": self.message_id, "role": self.role.value,
                "content": self.content, "timestamp": self.timestamp.isoformat(),
                "metadata": self.metadata}


@dataclass
class FileReference:
    file_id: str
    name: str
    path: str
    file_type: str
    size_bytes: int
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TaskReference:
    task_id: str
    name: str
    status: str
    result: Optional[Any] = None


@dataclass
class ConversationContext:
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    messages: List[Message] = field(default_factory=list)
    files: List[FileReference] = field(default_factory=list)
    tasks: List[TaskReference] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    shared_data: Dict[str, Any] = field(default_factory=dict)

    def touch(self) -> None:
        self.updated_at = datetime.now(timezone.utc)

    def add_message(self, role: MessageRole, content: str,
                    metadata: Optional[Dict[str, Any]] = None) -> Message:
        msg = Message(role=role, content=content, metadata=metadata or {})
        self.messages.append(msg)
        self.touch()
        return msg

    def add_file(self, file_ref: FileReference) -> None:
        self.files.append(file_ref)
        self.touch()

    def add_task(self, task_ref: TaskReference) -> None:
        self.tasks.append(task_ref)
        self.touch()

    def get_recent(self, limit: int = 20) -> List[Message]:
        return self.messages[-limit:]

    def to_llm_format(self) -> List[Dict[str, str]]:
        return [{"role": m.role.value, "content": m.content} for m in self.get_recent()]

    def set_preference(self, key: str, value: Any) -> None:
        self.preferences[key] = value
        self.touch()

    def get_preference(self, key: str, default: Any = None) -> Any:
        return self.preferences.get(key, default)

    def summary(self) -> Dict[str, Any]:
        return {"session_id": self.session_id, "user_id": self.user_id,
                "project_id": self.project_id, "message_count": len(self.messages),
                "file_count": len(self.files), "task_count": len(self.tasks),
                "preferences": list(self.preferences.keys()),
                "created_at": self.created_at.isoformat(),
                "updated_at": self.updated_at.isoformat()}


class ContextManager:
    def __init__(self) -> None:
        self._contexts: Dict[str, ConversationContext] = {}

    def create(self, user_id: Optional[str] = None,
               project_id: Optional[str] = None) -> ConversationContext:
        ctx = ConversationContext(user_id=user_id, project_id=project_id)
        self._contexts[ctx.session_id] = ctx
        return ctx

    def get(self, session_id: str) -> Optional[ConversationContext]:
        return self._contexts.get(session_id)

    def get_or_create(self, session_id: Optional[str] = None) -> ConversationContext:
        if session_id and session_id in self._contexts:
            return self._contexts[session_id]
        return self.create()

    def delete(self, session_id: str) -> bool:
        if session_id in self._contexts:
            del self._contexts[session_id]
            return True
        return False

    def list_sessions(self) -> List[Dict[str, Any]]:
        return [c.summary() for c in self._contexts.values()]

    def count(self) -> int:
        return len(self._contexts)


context_manager = ContextManager()
