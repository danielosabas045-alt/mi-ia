"""
OSAIA - Task Manager
Gestiona el ciclo de vida completo de cada tarea.
"""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("task_manager")


class TaskStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    RETRYING = "retrying"
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Task:
    task_id: str
    description: str
    status: TaskStatus = TaskStatus.QUEUED
    priority: int = 5
    agent: Optional[str] = None
    tool: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    progress: float = 0.0
    progress_message: str = ""
    result: Any = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 2
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    parent_task_id: Optional[str] = None
    sub_tasks: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_active(self) -> bool:
        return self.status in (TaskStatus.QUEUED, TaskStatus.RUNNING, TaskStatus.RETRYING)

    @property
    def is_terminal(self) -> bool:
        return self.status in (TaskStatus.COMPLETED, TaskStatus.PARTIALLY_COMPLETED,
                               TaskStatus.FAILED, TaskStatus.CANCELLED)

    @property
    def duration_seconds(self) -> Optional[float]:
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        if self.started_at:
            return (datetime.now(timezone.utc) - self.started_at).total_seconds()
        return None

    def to_dict(self) -> Dict[str, Any]:
        return {"task_id": self.task_id, "description": self.description,
                "status": self.status.value, "priority": self.priority,
                "agent": self.agent, "tool": self.tool,
                "session_id": self.session_id, "progress": round(self.progress, 2),
                "progress_message": self.progress_message,
                "error_message": self.error_message, "retry_count": self.retry_count,
                "created_at": self.created_at.isoformat(),
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "duration_seconds": round(self.duration_seconds, 2) if self.duration_seconds else None,
                "parent_task_id": self.parent_task_id, "sub_tasks": self.sub_tasks,
                "metadata": self.metadata}


class TaskManager:
    def __init__(self) -> None:
        self._tasks: Dict[str, Task] = {}

    def create(self, description: str, agent: Optional[str] = None,
               tool: Optional[str] = None, session_id: Optional[str] = None,
               user_id: Optional[str] = None, priority: int = 5,
               parent_task_id: Optional[str] = None,
               metadata: Optional[Dict[str, Any]] = None) -> Task:
        task_id = f"task_{uuid.uuid4().hex[:12]}"
        task = Task(task_id=task_id, description=description[:200], agent=agent,
                    tool=tool, session_id=session_id, user_id=user_id,
                    priority=priority, parent_task_id=parent_task_id,
                    metadata=metadata or {})
        self._tasks[task_id] = task
        if parent_task_id and parent_task_id in self._tasks:
            self._tasks[parent_task_id].sub_tasks.append(task_id)
        logger.info(f"📋 Tarea creada: {task_id} — {description[:60]}")
        return task

    def get(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def update(self, task_id: str, status: TaskStatus,
               progress: Optional[float] = None,
               progress_message: Optional[str] = None,
               result: Any = None, error_message: Optional[str] = None) -> Optional[Task]:
        task = self._tasks.get(task_id)
        if not task:
            return None
        task.status = status
        if status == TaskStatus.RUNNING and task.started_at is None:
            task.started_at = datetime.now(timezone.utc)
        if status in (TaskStatus.COMPLETED, TaskStatus.PARTIALLY_COMPLETED,
                      TaskStatus.FAILED, TaskStatus.CANCELLED):
            task.completed_at = datetime.now(timezone.utc)
            if progress is None:
                progress = 1.0 if status == TaskStatus.COMPLETED else task.progress
        if progress is not None:
            task.progress = max(0.0, min(1.0, progress))
        if progress_message is not None:
            task.progress_message = progress_message
        if result is not None:
            task.result = result
        if error_message is not None:
            task.error_message = error_message
        logger.debug(f"📋 Tarea {task_id}: {status.value} ({task.progress:.0%})")
        return task

    def increment_retry(self, task_id: str) -> bool:
        task = self._tasks.get(task_id)
        if not task:
            return False
        task.retry_count += 1
        return task.retry_count <= task.max_retries

    def cancel(self, task_id: str) -> bool:
        task = self._tasks.get(task_id)
        if not task or task.is_terminal:
            return False
        self.update(task_id, TaskStatus.CANCELLED, error_message="Cancelada por el usuario")
        return True

    def list(self, session_id: Optional[str] = None,
             status: Optional[TaskStatus] = None, limit: int = 50) -> List[Dict[str, Any]]:
        tasks = list(self._tasks.values())
        if session_id:
            tasks = [t for t in tasks if t.session_id == session_id]
        if status:
            tasks = [t for t in tasks if t.status == status]
        tasks.sort(key=lambda t: t.created_at, reverse=True)
        return [t.to_dict() for t in tasks[:limit]]

    def active_count(self) -> int:
        return sum(1 for t in self._tasks.values() if t.is_active)

    def stats(self) -> Dict[str, Any]:
        from collections import Counter
        sc = Counter(t.status.value for t in self._tasks.values())
        return {"total": len(self._tasks), "active": self.active_count(),
                "by_status": dict(sc)}


task_manager = TaskManager()
