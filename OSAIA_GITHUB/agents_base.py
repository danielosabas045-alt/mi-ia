"""
OSAIA - Sistema de Agentes: Base
Interfaz abstracta que TODO agente debe implementar.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from core_context import ConversationContext
from tools_registry import tool_registry
from utils_logger import get_logger


class AgentStatus(str, Enum):
    IDLE = "idle"
    THINKING = "thinking"
    PLANNING = "planning"
    EXECUTING = "executing"
    WAITING_INPUT = "waiting_input"
    WAITING_TOOL = "waiting_tool"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AgentResult:
    agent_name: str
    status: AgentStatus
    summary: str = ""
    data: Any = None
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    error_message: Optional[str] = None
    needs_user_input: Optional[str] = None
    delegated_tasks: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    @property
    def success(self) -> bool:
        return self.status == AgentStatus.COMPLETED

    def to_dict(self) -> Dict[str, Any]:
        return {"agent_name": self.agent_name, "status": self.status.value,
                "success": self.success, "summary": self.summary, "data": self.data,
                "tool_calls": self.tool_calls, "error_message": self.error_message,
                "needs_user_input": self.needs_user_input,
                "delegated_tasks": self.delegated_tasks, "metadata": self.metadata,
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None}


class BaseAgent(ABC):
    name: str = ""
    description: str = ""
    version: str = "1.0.0"
    category: str = "general"
    capabilities: List[str] = []

    def __init__(self) -> None:
        if not self.name:
            raise ValueError(f"{self.__class__.__name__} debe definir 'name'")
        if not self.description:
            raise ValueError(f"{self.name} debe definir 'description'")
        self.status = AgentStatus.IDLE
        self.logger = get_logger(f"agent_{self.name.lower()}")

    @abstractmethod
    async def execute(self, task: str, context: ConversationContext, **kwargs: Any) -> AgentResult:
        ...

    def use_tool(self, tool_name: str, params: Optional[Dict[str, Any]] = None) -> Any:
        self.logger.debug(f"🔧 Solicitando herramienta: {tool_name}")
        self.status = AgentStatus.WAITING_TOOL
        result = tool_registry.execute(tool_name, params)
        self.status = AgentStatus.EXECUTING
        return result

    def discover_tools(self, description: str) -> List[Dict[str, Any]]:
        return tool_registry.discover(description)

    def info(self) -> Dict[str, Any]:
        return {"name": self.name, "description": self.description,
                "version": self.version, "category": self.category,
                "capabilities": self.capabilities, "status": self.status.value}

    def _start(self) -> datetime:
        self.status = AgentStatus.THINKING
        self.logger.info(f"🚀 Agente {self.name} iniciando tarea")
        return datetime.now(timezone.utc)

    def _complete(self, started_at: datetime, summary: str, data: Any = None, **kwargs) -> AgentResult:
        self.status = AgentStatus.COMPLETED
        self.logger.info(f"✅ {self.name}: {summary[:80]}")
        return AgentResult(agent_name=self.name, status=AgentStatus.COMPLETED,
                           summary=summary, data=data, started_at=started_at,
                           completed_at=datetime.now(timezone.utc), **kwargs)

    def _fail(self, started_at: datetime, error_message: str, **kwargs) -> AgentResult:
        self.status = AgentStatus.FAILED
        self.logger.error(f"❌ {self.name}: {error_message}")
        return AgentResult(agent_name=self.name, status=AgentStatus.FAILED,
                           error_message=error_message, started_at=started_at,
                           completed_at=datetime.now(timezone.utc), **kwargs)

    def _need_input(self, started_at: datetime, question: str, **kwargs) -> AgentResult:
        self.status = AgentStatus.WAITING_INPUT
        self.logger.info(f"❓ {self.name}: necesita entrada")
        return AgentResult(agent_name=self.name, status=AgentStatus.WAITING_INPUT,
                           needs_user_input=question, started_at=started_at,
                           completed_at=datetime.now(timezone.utc), **kwargs)
