"""
OSAIA - Registro de Agentes
Registro, descubrimiento y selección dinámica de agentes.
"""
from __future__ import annotations
from typing import Dict, List, Optional, Type
from agents_base import BaseAgent
from utils_logger import get_logger

logger = get_logger("agent_registry")


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: Dict[str, BaseAgent] = {}
        self._classes: Dict[str, Type[BaseAgent]] = {}

    def register(self, agent_class: Type[BaseAgent]) -> Type[BaseAgent]:
        instance = agent_class()
        name = instance.name
        if name in self._agents:
            logger.warning(f"Agente '{name}' ya registrado, sobrescribiendo")
        self._agents[name] = instance
        self._classes[name] = agent_class
        logger.info(f"🤖 Agente registrado: {name} v{instance.version} [{instance.category}] — {len(instance.capabilities)} capacidades")
        return agent_class

    def unregister(self, name: str) -> bool:
        if name in self._agents:
            del self._agents[name]
            self._classes.pop(name, None)
            return True
        return False

    def get(self, name: str) -> Optional[BaseAgent]:
        return self._agents.get(name)

    def has(self, name: str) -> bool:
        return name in self._agents

    def list_agents(self, category: Optional[str] = None) -> List[Dict]:
        agents = []
        for name, agent in sorted(self._agents.items()):
            if category and agent.category != category:
                continue
            agents.append(agent.info())
        return agents

    def list_categories(self) -> List[str]:
        return sorted({a.category for a in self._agents.values()})

    def select_for_task(self, task_description: str) -> List[Dict]:
        desc_lower = task_description.lower()
        scored = []
        for agent in self._agents.values():
            score = 0
            info = agent.info()
            if agent.name.lower() in desc_lower:
                score += 15
            for word in desc_lower.split():
                if len(word) > 3 and word in agent.description.lower():
                    score += 2
            for cap in agent.capabilities:
                cl = cap.lower()
                if cl in desc_lower:
                    score += 8
                for word in desc_lower.split():
                    if len(word) > 3 and word in cl:
                        score += 1
            if agent.category.lower() in desc_lower:
                score += 5
            if score > 0:
                scored.append((score, info))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [info for _, info in scored]

    def count(self) -> int:
        return len(self._agents)


agent_registry = AgentRegistry()
