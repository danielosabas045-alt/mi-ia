"""
OSAIA CORE - Model Router
Selecciona el mejor modelo/proveedor según tarea, calidad, velocidad, coste.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("model_router")


class ModelTaskType(str, Enum):
    CHAT = "chat"
    TEXT_GENERATION = "text_generation"
    EMBEDDING = "embedding"
    IMAGE_GENERATION = "image_generation"
    IMAGE_UNDERSTANDING = "image_understanding"
    AUDIO_TRANSCRIPTION = "audio_transcription"
    TEXT_TO_SPEECH = "text_to_speech"
    VIDEO_GENERATION = "video_generation"
    CODE_GENERATION = "code_generation"
    REASONING = "reasoning"
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"


class ModelModality(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    MULTIMODAL = "multimodal"


class ProviderPriority(str, Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    FALLBACK = "fallback"


@dataclass
class ModelInfo:
    model_id: str
    provider: str
    task_types: List[ModelTaskType]
    input_modalities: List[ModelModality]
    output_modalities: List[ModelModality]
    quality_score: float = 0.7
    speed_score: float = 0.7
    cost_per_1k_tokens: float = 0.0
    priority: ProviderPriority = ProviderPriority.SECONDARY
    enabled: bool = True
    capabilities: List[str] = field(default_factory=list)
    config: Dict[str, Any] = field(default_factory=dict)

    def supports(self, task: ModelTaskType) -> bool:
        return task in self.task_types

    def to_dict(self) -> Dict[str, Any]:
        return {"model_id": self.model_id, "provider": self.provider,
                "task_types": [t.value for t in self.task_types],
                "input_modalities": [m.value for m in self.input_modalities],
                "output_modalities": [m.value for m in self.output_modalities],
                "quality_score": self.quality_score, "speed_score": self.speed_score,
                "cost_per_1k_tokens": self.cost_per_1k_tokens,
                "priority": self.priority.value, "enabled": self.enabled,
                "capabilities": self.capabilities}


@dataclass
class RoutingCriteria:
    task_type: ModelTaskType
    input_modality: ModelModality = ModelModality.TEXT
    output_modality: ModelModality = ModelModality.TEXT
    prefer_quality: bool = False
    prefer_speed: bool = False
    prefer_low_cost: bool = False
    max_cost_per_1k: Optional[float] = None
    required_capabilities: Optional[List[str]] = None


class ModelRouter:
    def __init__(self) -> None:
        self._models: Dict[str, ModelInfo] = {}
        self._register_defaults()

    def _register_defaults(self) -> None:
        self.register(ModelInfo(
            model_id="local-mock", provider="osaia-local",
            task_types=[ModelTaskType.CHAT, ModelTaskType.TEXT_GENERATION,
                        ModelTaskType.REASONING, ModelTaskType.SUMMARIZATION,
                        ModelTaskType.CODE_GENERATION],
            input_modalities=[ModelModality.TEXT],
            output_modalities=[ModelModality.TEXT],
            quality_score=0.5, speed_score=0.9, cost_per_1k_tokens=0.0,
            priority=ProviderPriority.PRIMARY, enabled=True,
            capabilities=["conversación", "razonamiento básico", "herramientas",
                          "cálculos", "análisis de texto", "conversiones"],
            config={"type": "local", "agent": "GeneralAgent"},
        ))
        logger.info("🤖 Model Router inicializado")

    def register(self, model: ModelInfo) -> None:
        self._models[model.model_id] = model
        logger.info(f"🤖 Modelo registrado: {model.model_id} [{model.provider}]")

    def list_models(self, task_type: Optional[ModelTaskType] = None) -> List[Dict[str, Any]]:
        models = []
        for m in self._models.values():
            if not m.enabled:
                continue
            if task_type and not m.supports(task_type):
                continue
            models.append(m.to_dict())
        return models

    def select(self, criteria: RoutingCriteria) -> Optional[ModelInfo]:
        candidates = []
        for m in self._models.values():
            if not m.enabled:
                continue
            if not m.supports(criteria.task_type):
                continue
            if criteria.input_modality not in m.input_modalities:
                continue
            if criteria.output_modality not in m.output_modalities:
                continue
            if criteria.required_capabilities:
                if not all(c in m.capabilities for c in criteria.required_capabilities):
                    continue
            if criteria.max_cost_per_1k is not None:
                if m.cost_per_1k_tokens > criteria.max_cost_per_1k:
                    continue
            candidates.append(m)

        if not candidates:
            return None

        def score(m: ModelInfo) -> float:
            s = 0.0
            pw = {ProviderPriority.PRIMARY: 100, ProviderPriority.SECONDARY: 50, ProviderPriority.FALLBACK: 10}
            s += pw.get(m.priority, 0)
            if criteria.prefer_quality:
                s += m.quality_score * 50
            elif criteria.prefer_speed:
                s += m.speed_score * 50
            elif criteria.prefer_low_cost:
                s += 50 if m.cost_per_1k_tokens == 0 else max(0, 50 - m.cost_per_1k_tokens * 100)
            else:
                s += m.quality_score * 25 + m.speed_score * 25
            return s

        candidates.sort(key=score, reverse=True)
        selected = candidates[0]
        logger.debug(f"🎯 Modelo seleccionado: {selected.model_id} para {criteria.task_type.value}")
        return selected

    def get(self, model_id: str) -> Optional[ModelInfo]:
        return self._models.get(model_id)


model_router = ModelRouter()
