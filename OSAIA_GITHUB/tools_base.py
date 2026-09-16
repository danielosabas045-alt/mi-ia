"""
OSAIA - Sistema de Herramientas: Base
Interfaz abstracta que TODA herramienta debe implementar.
"""
from __future__ import annotations
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Type


class ToolStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


@dataclass
class ToolParameter:
    name: str
    description: str
    param_type: Type = str
    required: bool = True
    default: Any = None
    options: Optional[List[Any]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None


@dataclass
class ToolResult:
    tool_name: str
    status: ToolStatus
    data: Any = None
    error_message: Optional[str] = None
    duration_seconds: float = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def success(self) -> bool:
        return self.status == ToolStatus.COMPLETED

    def to_dict(self) -> Dict[str, Any]:
        return {"tool_name": self.tool_name, "status": self.status.value,
                "success": self.success, "data": self.data,
                "error_message": self.error_message,
                "duration_seconds": round(self.duration_seconds, 4),
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "metadata": self.metadata}


class BaseTool(ABC):
    name: str = ""
    description: str = ""
    version: str = "1.0.0"
    category: str = "general"
    permissions: List[str] = []
    timeout_seconds: float = 30.0
    max_retries: int = 0

    def __init__(self) -> None:
        if not self.name:
            raise ValueError(f"{self.__class__.__name__} debe definir 'name'")
        if not self.description:
            raise ValueError(f"{self.name} debe definir 'description'")

    @abstractmethod
    def parameters(self) -> List[ToolParameter]:
        ...

    @abstractmethod
    def _execute(self, params: Dict[str, Any]) -> Any:
        ...

    def validate(self, params: Dict[str, Any]) -> List[str]:
        errors: List[str] = []
        defined = {p.name: p for p in self.parameters()}
        for param in self.parameters():
            if param.required and param.name not in params:
                errors.append(f"Falta parámetro requerido: '{param.name}'")
                continue
            if param.name in params and params[param.name] is not None:
                v = params[param.name]
                if param.param_type is not Any and not isinstance(v, param.param_type):
                    errors.append(f"'{param.name}': tipo esperado {param.param_type.__name__}, obtenido {type(v).__name__}")
                    continue
                if param.options and v not in param.options:
                    errors.append(f"'{param.name}': valor '{v}' no permitido. Opciones: {param.options}")
                if isinstance(v, (int, float)):
                    if param.min_value is not None and v < param.min_value:
                        errors.append(f"'{param.name}': {v} < mínimo {param.min_value}")
                    if param.max_value is not None and v > param.max_value:
                        errors.append(f"'{param.name}': {v} > máximo {param.max_value}")
        for key in params:
            if key not in defined:
                errors.append(f"Parámetro desconocido: '{key}'")
        return errors

    def execute(self, params: Optional[Dict[str, Any]] = None) -> ToolResult:
        params = params or {}
        started_at = datetime.now(timezone.utc)
        validation_errors = self.validate(params)
        if validation_errors:
            return ToolResult(tool_name=self.name, status=ToolStatus.FAILED,
                              error_message="Validación: " + "; ".join(validation_errors),
                              started_at=started_at, completed_at=datetime.now(timezone.utc),
                              metadata={"validation_errors": validation_errors})
        for param in self.parameters():
            if param.name not in params and param.default is not None:
                params[param.name] = param.default

        last_error: Optional[Exception] = None
        attempt = 0
        while attempt <= self.max_retries:
            attempt += 1
            try:
                start = time.perf_counter()
                data = self._execute(params)
                duration = time.perf_counter() - start
                return ToolResult(tool_name=self.name, status=ToolStatus.COMPLETED,
                                  data=data, duration_seconds=duration,
                                  started_at=started_at, completed_at=datetime.now(timezone.utc),
                                  metadata={"attempts": attempt})
            except TimeoutError as e:
                return ToolResult(tool_name=self.name, status=ToolStatus.TIMEOUT,
                                  error_message=str(e), started_at=started_at,
                                  completed_at=datetime.now(timezone.utc))
            except Exception as e:
                last_error = e
                if attempt <= self.max_retries:
                    continue
                return ToolResult(tool_name=self.name, status=ToolStatus.FAILED,
                                  error_message=f"{type(e).__name__}: {str(e)}",
                                  started_at=started_at, completed_at=datetime.now(timezone.utc),
                                  metadata={"attempts": attempt})

        return ToolResult(tool_name=self.name, status=ToolStatus.FAILED,
                          error_message=str(last_error) if last_error else "Error desconocido",
                          started_at=started_at, completed_at=datetime.now(timezone.utc))

    def info(self) -> Dict[str, Any]:
        return {"name": self.name, "description": self.description,
                "version": self.version, "category": self.category,
                "timeout_seconds": self.timeout_seconds,
                "max_retries": self.max_retries, "permissions": self.permissions,
                "parameters": [
                    {"name": p.name, "description": p.description,
                     "type": "any" if p.param_type is Any else getattr(p.param_type, "__name__", str(p.param_type)),
                     "required": p.required, "default": p.default,
                     "options": p.options, "min": p.min_value, "max": p.max_value}
                    for p in self.parameters()
                ]}
