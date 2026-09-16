"""
OSAIA - Registro de Herramientas
Registro, descubrimiento y ejecución dinámica de herramientas.
"""
from __future__ import annotations
from typing import Dict, List, Optional, Type
from tools_base import BaseTool, ToolResult
from utils_logger import get_logger

logger = get_logger("tool_registry")


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: Dict[str, BaseTool] = {}
        self._classes: Dict[str, Type[BaseTool]] = {}

    def register(self, tool_class: Type[BaseTool]) -> Type[BaseTool]:
        instance = tool_class()
        name = instance.name
        if name in self._tools:
            logger.warning(f"Herramienta '{name}' ya registrada, sobrescribiendo")
        self._tools[name] = instance
        self._classes[name] = tool_class
        logger.info(f"✅ Herramienta registrada: {name} v{instance.version} [{instance.category}]")
        return tool_class

    def register_instance(self, tool: BaseTool) -> None:
        if tool.name in self._tools:
            logger.warning(f"Herramienta '{tool.name}' ya registrada, sobrescribiendo")
        self._tools[tool.name] = tool

    def unregister(self, name: str) -> bool:
        if name in self._tools:
            del self._tools[name]
            self._classes.pop(name, None)
            return True
        return False

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def has(self, name: str) -> bool:
        return name in self._tools

    def execute(self, tool_name: str, params: Optional[dict] = None) -> ToolResult:
        tool = self.get(tool_name)
        if tool is None:
            available = ", ".join(sorted(self._tools.keys()))
            raise ValueError(f"Herramienta '{tool_name}' no encontrada. Disponibles: {available}")
        logger.debug(f"⚙️  Ejecutando: {tool_name}")
        result = tool.execute(params)
        if result.success:
            logger.info(f"✅ {tool_name}: completada en {result.duration_seconds:.3f}s")
        else:
            logger.warning(f"⚠️  {tool_name}: {result.status.value} — {result.error_message}")
        return result

    def list_tools(self, category: Optional[str] = None) -> List[Dict]:
        tools = []
        for name, tool in sorted(self._tools.items()):
            if category and tool.category != category:
                continue
            tools.append(tool.info())
        return tools

    def list_categories(self) -> List[str]:
        return sorted({t.category for t in self._tools.values()})

    def discover(self, description: str) -> List[Dict]:
        desc_lower = description.lower()
        scored = []
        for tool in self._tools.values():
            score = 0
            info = tool.info()
            if tool.name.lower() in desc_lower:
                score += 10
            for word in desc_lower.split():
                if len(word) > 3 and word in tool.description.lower():
                    score += 2
            if tool.category.lower() in desc_lower:
                score += 5
            if score > 0:
                scored.append((score, info))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [info for _, info in scored]

    def count(self) -> int:
        return len(self._tools)


tool_registry = ToolRegistry()
