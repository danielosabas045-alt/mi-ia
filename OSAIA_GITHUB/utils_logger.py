"""
OSAIA - Sistema de Logging Centralizado
Logging estructurado, consistente y coloreado.
"""
from __future__ import annotations
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from config_settings import settings


class OSAIALogFormatter(logging.Formatter):
    COLORS = {
        "DEBUG": "\033[36m", "INFO": "\033[32m", "WARNING": "\033[33m",
        "ERROR": "\033[31m", "CRITICAL": "\033[35m", "RESET": "\033[0m",
    }
    COMP = "\033[37m"

    def __init__(self, use_color: bool = True):
        super().__init__()
        self.use_color = use_color and sys.stdout.isatty()

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        level = record.levelname
        comp = record.name.split(".")[-1] if "." in record.name else record.name
        if self.use_color:
            c = self.COLORS.get(level, "")
            r = self.COLORS["RESET"]
            level_s = f"{c}{level:<8}{r}"
            comp_s = f"{self.COMP}[{comp}]{r}"
        else:
            level_s = f"{level:<8}"
            comp_s = f"[{comp}]"
        msg = record.getMessage()
        extra = ""
        if hasattr(record, "extra_data") and record.extra_data:
            extra = f" | {record.extra_data}"
        return f"{ts} | {level_s} | {comp_s} {msg}{extra}"


class OSAIALogger:
    _loggers: Dict[str, logging.Logger] = {}
    _initialized: bool = False

    @classmethod
    def _init(cls) -> None:
        if cls._initialized:
            return
        root = logging.getLogger("osaia")
        root.setLevel(getattr(logging, settings.LOG_LEVEL))
        root.handlers.clear()
        h = logging.StreamHandler(sys.stdout)
        h.setFormatter(OSAIALogFormatter())
        root.addHandler(h)
        root.propagate = False
        cls._initialized = True

    @classmethod
    def get(cls, component: str) -> logging.Logger:
        cls._init()
        if component not in cls._loggers:
            logger = logging.getLogger(f"osaia.{component}")
            logger.setLevel(getattr(logging, settings.LOG_LEVEL))
            cls._loggers[component] = logger
        return cls._loggers[component]


def get_logger(component: str) -> logging.Logger:
    return OSAIALogger.get(component)


def log_extra(logger: logging.Logger, level: str, message: str,
              extra: Optional[Dict[str, Any]] = None) -> None:
    extra_data = ""
    if extra:
        extra_data = " ".join(f"{k}={v}" for k, v in extra.items())
    method = getattr(logger, level.lower())
    method(message, extra={"extra_data": extra_data} if extra_data else None)
