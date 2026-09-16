"""
OSAIA - Error Recovery Engine + Reviewer
REGLA ABSOLUTA: OSAIA nunca se queda callada ante un error.
"""
from __future__ import annotations
import asyncio
import traceback
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple
from utils_logger import get_logger

logger = get_logger("error_manager")


class ErrorCategory(str, Enum):
    VALIDATION = "validation"
    TIMEOUT = "timeout"
    NETWORK = "network"
    AUTHENTICATION = "authentication"
    PERMISSION = "permission"
    RESOURCE_NOT_FOUND = "resource_not_found"
    RESOURCE_EXHAUSTED = "resource_exhausted"
    INTERNAL = "internal"
    EXTERNAL_SERVICE = "external_service"
    UNKNOWN = "unknown"


@dataclass
class ErrorRecord:
    error_id: str
    category: ErrorCategory
    message: str
    component: str
    traceback: Optional[str] = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    retry_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {"error_id": self.error_id, "category": self.category.value,
                "message": self.message, "component": self.component,
                "timestamp": self.timestamp.isoformat(), "retry_count": self.retry_count,
                "metadata": self.metadata}


@dataclass
class RecoveryResult:
    recovered: bool
    strategy_used: Optional[str] = None
    result: Any = None
    error_record: Optional[ErrorRecord] = None
    attempts: int = 0
    final_message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {"recovered": self.recovered, "strategy_used": self.strategy_used,
                "attempts": self.attempts, "final_message": self.final_message,
                "error": self.error_record.to_dict() if self.error_record else None}


class ErrorManager:
    def __init__(self) -> None:
        self._history: List[ErrorRecord] = []
        self._max_history = 500

    def categorize(self, error: Exception, component: str) -> ErrorCategory:
        et = type(error).__name__.lower()
        em = str(error).lower()
        if "timeout" in et or "timeout" in em:
            return ErrorCategory.TIMEOUT
        if any(w in et for w in ["connection", "network", "dns", "socket"]):
            return ErrorCategory.NETWORK
        if any(w in em for w in ["unauthorized", "forbidden", "401", "403", "permiso"]):
            return ErrorCategory.AUTHENTICATION
        if any(w in em for w in ["not found", "no existe", "404"]):
            return ErrorCategory.RESOURCE_NOT_FOUND
        if any(w in et for w in ["valueerror", "validation"]):
            return ErrorCategory.VALIDATION
        if any(w in em for w in ["out of memory", "memoria", "cuota", "rate limit", "429"]):
            return ErrorCategory.RESOURCE_EXHAUSTED
        return ErrorCategory.UNKNOWN

    def record(self, error: Exception, component: str,
               metadata: Optional[Dict[str, Any]] = None) -> ErrorRecord:
        record = ErrorRecord(
            error_id=f"err_{uuid.uuid4().hex[:12]}",
            category=self.categorize(error, component),
            message=str(error), component=component,
            traceback=traceback.format_exc(), metadata=metadata or {})
        self._history.insert(0, record)
        if len(self._history) > self._max_history:
            self._history.pop()
        logger.error(f"❌ Error [{record.category.value}] en {component}: {type(error).__name__}: {str(error)[:120]}")
        return record

    async def execute_with_retry(self, func: Callable[..., Awaitable[Any]], component: str,
                                 max_retries: int = 2, base_delay: float = 0.5,
                                 max_delay: float = 5.0,
                                 fallback: Optional[Callable[..., Awaitable[Any]]] = None,
                                 **kwargs) -> RecoveryResult:
        attempts = 0
        last_error: Optional[ErrorRecord] = None
        while attempts <= max_retries:
            try:
                attempts += 1
                result = await func(**kwargs)
                strategy = "direct_success" if attempts == 1 else f"retry_{attempts - 1}"
                return RecoveryResult(recovered=True, strategy_used=strategy,
                                      result=result, attempts=attempts,
                                      final_message=f"Éxito en intento {attempts}")
            except Exception as e:
                last_error = self.record(e, component, {"attempt": attempts})
                last_error.retry_count = attempts
                if attempts <= max_retries:
                    import random
                    delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                    delay = delay * (0.8 + random.random() * 0.4)
                    logger.warning(f"🔄 Reintento {attempts}/{max_retries} para {component} en {delay:.2f}s")
                    await asyncio.sleep(delay)
        if fallback:
            try:
                logger.warning(f"🔄 Intentando fallback para {component}")
                result = await fallback(**kwargs)
                return RecoveryResult(recovered=True, strategy_used="fallback",
                                      result=result, error_record=last_error,
                                      attempts=attempts, final_message="Recuperado mediante fallback")
            except Exception as e2:
                self.record(e2, f"{component}_fallback")
        return RecoveryResult(recovered=False, strategy_used=None,
                              error_record=last_error, attempts=attempts,
                              final_message=f"No se pudo completar en {component} después de {attempts} intento(s). Causa: {last_error.message if last_error else 'desconocida'}")

    def recent(self, limit: int = 10, component: Optional[str] = None) -> List[Dict[str, Any]]:
        errors = self._history
        if component:
            errors = [e for e in errors if e.component == component]
        return [e.to_dict() for e in errors[:limit]]

    def stats(self) -> Dict[str, Any]:
        from collections import Counter
        cats = Counter(e.category.value for e in self._history)
        comps = Counter(e.component for e in self._history)
        return {"total_errors": len(self._history),
                "by_category": dict(cats),
                "by_component": dict(comps.most_common(10))}


error_manager = ErrorManager()
