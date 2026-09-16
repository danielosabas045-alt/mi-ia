"""
OSAIA - Plugin System (FASE 21)
Permite extender OSAIA sin modificar el núcleo.
Cada plugin puede registrar: Tools, Agents, Models, Services, File Handlers.
"""
from __future__ import annotations
import importlib
import sys
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("plugin_system")


@dataclass
class PluginInfo:
    plugin_id: str
    name: str
    version: str
    author: str = ""
    description: str = ""
    category: str = "general"
    provides: List[str] = field(default_factory=list)
    requires: List[str] = field(default_factory=list)
    enabled: bool = True
    loaded_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {"plugin_id": self.plugin_id, "name": self.name,
                "version": self.version, "author": self.author,
                "description": self.description, "category": self.category,
                "provides": self.provides, "requires": self.requires,
                "enabled": self.enabled,
                "loaded_at": self.loaded_at.isoformat() if self.loaded_at else None,
                "metadata": self.metadata}


class OSAIAPlugin(ABC):
    """Clase base para todos los plugins de OSAIA."""

    info: PluginInfo

    @abstractmethod
    def initialize(self, context: Dict[str, Any]) -> None:
        """Se llama cuando el plugin se carga.
        Aquí el plugin debe registrar sus herramientas, agentes, etc.
        """
        ...

    def shutdown(self) -> None:
        """Se llama cuando el plugin se desactiva."""
        pass


class PluginManager:
    """Gestor central de plugins de OSAIA."""

    def __init__(self) -> None:
        self._plugins: Dict[str, OSAIAPlugin] = {}
        self._infos: Dict[str, PluginInfo] = {}
        self._context: Dict[str, Any] = {}

    def set_context(self, key: str, value: Any) -> None:
        """Establece una referencia del sistema para que los plugins la usen."""
        self._context[key] = value

    def register(self, plugin_class: type) -> Optional[str]:
        """Registra y carga un plugin."""
        try:
            plugin = plugin_class()
            info = plugin.info
            if info.plugin_id in self._plugins:
                logger.warning(f"🔌 Plugin '{info.plugin_id}' ya registrado, sobrescribiendo")

            # Verificar dependencias
            for req in info.requires:
                if req not in self._plugins:
                    logger.warning(f"🔌 Plugin '{info.plugin_id}' requiere '{req}' que no está cargado")

            plugin.initialize(self._context)
            info.loaded_at = datetime.now(timezone.utc)
            info.enabled = True

            self._plugins[info.plugin_id] = plugin
            self._infos[info.plugin_id] = info

            logger.info(f"🔌 Plugin cargado: {info.name} v{info.version} "
                        f"[{info.category}] — provee: {info.provides}")
            return info.plugin_id

        except Exception as e:
            logger.error(f"❌ Error cargando plugin: {e}")
            return None

    def load_from_file(self, file_path: str) -> Optional[str]:
        """Carga un plugin desde un archivo .py."""
        p = Path(file_path)
        if not p.exists():
            logger.error(f"❌ Archivo de plugin no encontrado: {file_path}")
            return None

        try:
            spec = importlib.util.spec_from_file_location(f"osaia_plugin_{p.stem}", str(p))
            if spec is None or spec.loader is None:
                raise ImportError(f"No se pudo cargar: {file_path}")
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)

            # Buscar clases que hereden de OSAIAPlugin
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (isinstance(attr, type) and issubclass(attr, OSAIAPlugin)
                        and attr is not OSAIAPlugin and hasattr(attr, 'info')):
                    return self.register(attr)

            logger.error(f"❌ No se encontró ninguna clase OSAIAPlugin en {file_path}")
            return None

        except Exception as e:
            logger.error(f"❌ Error cargando plugin desde archivo: {e}")
            return None

    def enable(self, plugin_id: str) -> bool:
        if plugin_id in self._infos:
            self._infos[plugin_id].enabled = True
            logger.info(f"🔌 Plugin activado: {plugin_id}")
            return True
        return False

    def disable(self, plugin_id: str) -> bool:
        if plugin_id in self._infos:
            self._infos[plugin_id].enabled = False
            try:
                self._plugins[plugin_id].shutdown()
            except Exception as e:
                logger.warning(f"⚠️  Error apagando plugin: {e}")
            logger.info(f"🔌 Plugin desactivado: {plugin_id}")
            return True
        return False

    def unload(self, plugin_id: str) -> bool:
        if plugin_id in self._plugins:
            try:
                self._plugins[plugin_id].shutdown()
            except Exception:
                pass
            del self._plugins[plugin_id]
            del self._infos[plugin_id]
            logger.info(f"🔌 Plugin descargado: {plugin_id}")
            return True
        return False

    def get(self, plugin_id: str) -> Optional[OSAIAPlugin]:
        return self._plugins.get(plugin_id)

    def list_plugins(self) -> List[Dict[str, Any]]:
        return [info.to_dict() for info in self._infos.values()]

    def count(self) -> int:
        return len(self._plugins)


plugin_manager = PluginManager()
