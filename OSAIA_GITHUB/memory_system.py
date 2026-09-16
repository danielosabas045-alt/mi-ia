"""
OSAIA - Memory System
Session Memory, User Memory, Task Memory.
"""
from __future__ import annotations
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from config_settings import settings
from utils_logger import get_logger

logger = get_logger("memory")


@dataclass
class MemoryEntry:
    key: str
    value: Any
    category: str = "general"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    access_count: int = 0
    ttl_seconds: Optional[int] = None

    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return (datetime.now(timezone.utc) - self.created_at).total_seconds() > self.ttl_seconds

    def touch(self) -> None:
        self.updated_at = datetime.now(timezone.utc)
        self.access_count += 1


class SessionMemory:
    def __init__(self) -> None:
        self._entries: Dict[str, MemoryEntry] = {}

    def save(self, key: str, value: Any, category: str = "general", ttl: Optional[int] = None) -> None:
        if key in self._entries:
            e = self._entries[key]
            e.value = value
            e.category = category
            e.touch()
        else:
            self._entries[key] = MemoryEntry(key=key, value=value, category=category, ttl_seconds=ttl)
        logger.debug(f"💾 SessionMemory: guardado '{key}'")

    def read(self, key: str, default: Any = None) -> Any:
        e = self._entries.get(key)
        if e is None:
            return default
        if e.is_expired():
            del self._entries[key]
            return default
        e.touch()
        return e.value

    def delete(self, key: str) -> bool:
        if key in self._entries:
            del self._entries[key]
            return True
        return False

    def list_category(self, category: str) -> List[Dict[str, Any]]:
        return [{"key": e.key, "value": e.value, "access_count": e.access_count}
                for e in self._entries.values() if e.category == category and not e.is_expired()]

    def clear(self) -> None:
        self._entries.clear()

    def count(self) -> int:
        return len(self._entries)


class UserMemory:
    def __init__(self, storage_path: Optional[Path] = None) -> None:
        self._path = storage_path or settings.STORAGE_PATH / "user_memory.json"
        self._data: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        if self._path.exists():
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
                logger.info(f"💾 UserMemory cargada: {len(self._data)} usuarios")
            except Exception as e:
                logger.warning(f"⚠️  No se pudo cargar UserMemory: {e}")
                self._data = {}

    def _save(self) -> None:
        try:
            self._path.parent.mkdir(parents=True, exist_ok=True)
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            logger.error(f"❌ Error guardando UserMemory: {e}")

    def set_preference(self, user_id: str, key: str, value: Any) -> None:
        if user_id not in self._data:
            self._data[user_id] = {"preferences": {}, "created_at": datetime.now(timezone.utc).isoformat()}
        if "preferences" not in self._data[user_id]:
            self._data[user_id]["preferences"] = {}
        self._data[user_id]["preferences"][key] = value
        self._data[user_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._save()

    def get_preference(self, user_id: str, key: str, default: Any = None) -> Any:
        return self._data.get(user_id, {}).get("preferences", {}).get(key, default)

    def get_all(self, user_id: str) -> Dict[str, Any]:
        return self._data.get(user_id, {}).get("preferences", {})

    def delete_preference(self, user_id: str, key: str) -> bool:
        prefs = self._data.get(user_id, {}).get("preferences", {})
        if key in prefs:
            del prefs[key]
            self._save()
            return True
        return False

    def export_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self._data.get(user_id)


class TaskMemory:
    def __init__(self, max_entries: int = 100) -> None:
        self._entries: List[Dict[str, Any]] = []
        self._max = max_entries

    def add(self, record: Dict[str, Any]) -> None:
        self._entries.insert(0, record)
        if len(self._entries) > self._max:
            self._entries.pop()

    def recent(self, limit: int = 10) -> List[Dict[str, Any]]:
        return self._entries[:limit]

    def find(self, task_id: str) -> Optional[Dict[str, Any]]:
        for e in self._entries:
            if e.get("task_id") == task_id:
                return e
        return None

    def clear(self) -> None:
        self._entries.clear()


session_memory = SessionMemory()
user_memory = UserMemory()
task_memory = TaskMemory()
