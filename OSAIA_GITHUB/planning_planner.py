"""
OSAIA - Plan Engine
Convierte solicitudes complejas en secuencias de pasos ejecutables.
"""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from reasoning_reasoner import IntentExtraction, IntentType
from utils_logger import get_logger

logger = get_logger("planner")


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class PlanStep:
    step_id: int
    description: str
    agent: Optional[str] = None
    tool: Optional[str] = None
    tool_params: Optional[Dict[str, Any]] = None
    depends_on: List[int] = field(default_factory=list)
    status: StepStatus = StepStatus.PENDING
    result: Any = None
    error_message: Optional[str] = None
    required: bool = True
    is_fallback: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {"step_id": self.step_id, "description": self.description,
                "agent": self.agent, "tool": self.tool,
                "depends_on": self.depends_on, "status": self.status.value,
                "required": self.required, "is_fallback": self.is_fallback,
                "error_message": self.error_message}


@dataclass
class ExecutionPlan:
    plan_id: str
    original_request: str
    intent: str
    steps: List[PlanStep] = field(default_factory=list)
    summary: str = ""
    is_complex: bool = False
    estimated_complexity: str = "simple"
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def total_steps(self) -> int:
        return len(self.steps)

    @property
    def completed_steps(self) -> int:
        return sum(1 for s in self.steps if s.status == StepStatus.COMPLETED)

    @property
    def progress(self) -> float:
        return self.completed_steps / len(self.steps) if self.steps else 0.0

    def get_pending(self) -> List[PlanStep]:
        pending = []
        for step in self.steps:
            if step.status != StepStatus.PENDING:
                continue
            deps_ok = all(
                self.steps[d - 1].status == StepStatus.COMPLETED
                for d in step.depends_on if 1 <= d <= len(self.steps)
            )
            if deps_ok:
                pending.append(step)
        return pending

    def to_dict(self) -> Dict[str, Any]:
        return {"plan_id": self.plan_id, "original_request": self.original_request,
                "intent": self.intent, "summary": self.summary,
                "is_complex": self.is_complex, "estimated_complexity": self.estimated_complexity,
                "total_steps": self.total_steps, "completed_steps": self.completed_steps,
                "progress": round(self.progress, 2), "steps": [s.to_dict() for s in self.steps],
                "metadata": self.metadata}


class Planner:
    _SIMPLE = {IntentType.SALUDO, IntentType.DESPEDIDA, IntentType.AGRADECIMIENTO,
               IntentType.PREGUNTA_INFORMACION, IntentType.PREGUNTA_OSAIA,
               IntentType.CALCULO, IntentType.ANALISIS_TEXTO, IntentType.CONSULTA_FECHA,
               IntentType.CONVERSION, IntentType.GENERAL, IntentType.SOLICITUD_CODIGO,
               IntentType.SOLICITUD_IMAGEN, IntentType.SOLICITUD_ARCHIVO}

    def create_plan(self, user_request: str, intent_extraction: IntentExtraction) -> ExecutionPlan:
        plan_id = f"plan_{uuid.uuid4().hex[:12]}"
        intent = intent_extraction.intent
        logger.info(f"📋 Creando plan para: {intent.value}")

        if intent in self._SIMPLE:
            plan = self._simple(plan_id, user_request, intent)
        elif intent == IntentType.SOLICITUD_TAREA_COMPLEJA:
            plan = self._complex(plan_id, user_request, intent)
        else:
            plan = self._default(plan_id, user_request, intent)

        plan.summary = self._gen_summary(plan)
        logger.info(f"📋 Plan: {plan.total_steps} pasos, complejidad: {plan.estimated_complexity}")
        return plan

    def _simple(self, pid: str, req: str, intent: IntentType) -> ExecutionPlan:
        # Seleccionar agente apropiado
        agent_map = {
            IntentType.SOLICITUD_CODIGO: "CodingAgent",
            IntentType.SOLICITUD_ARCHIVO: "FileAgent",
        }
        agent = agent_map.get(intent, "GeneralAgent")
        return ExecutionPlan(plan_id=pid, original_request=req, intent=intent.value,
                             estimated_complexity="simple", is_complex=False,
                             steps=[PlanStep(step_id=1, description=f"Procesar: {intent.value}", agent=agent)])

    def _complex(self, pid: str, req: str, intent: IntentType) -> ExecutionPlan:
        return ExecutionPlan(plan_id=pid, original_request=req, intent=intent.value,
                             estimated_complexity="high", is_complex=True,
                             metadata={"note": "Plan multi-paso"},
                             steps=[
                                 PlanStep(step_id=1, description="Analizar y comprender la solicitud completa", agent="ReasoningAgent"),
                                 PlanStep(step_id=2, description="Identificar herramientas y agentes necesarios", agent="GeneralAgent", depends_on=[1]),
                                 PlanStep(step_id=3, description="Ejecutar la tarea principal", agent="GeneralAgent", depends_on=[2]),
                                 PlanStep(step_id=4, description="Verificar el resultado", agent="GeneralAgent", depends_on=[3], required=False),
                             ])

    def _default(self, pid: str, req: str, intent: IntentType) -> ExecutionPlan:
        return ExecutionPlan(plan_id=pid, original_request=req, intent=intent.value,
                             estimated_complexity="simple",
                             steps=[PlanStep(step_id=1, description="Procesar con agente general", agent="GeneralAgent")])

    def _gen_summary(self, plan: ExecutionPlan) -> str:
        if plan.total_steps == 1:
            return f"Plan simple: 1 paso — {plan.steps[0].description}"
        return f"Plan de {plan.total_steps} pasos. Complejidad: {plan.estimated_complexity}."

    def update_step(self, plan: ExecutionPlan, step_id: int, status: StepStatus,
                    result: Any = None, error_message: Optional[str] = None) -> None:
        for step in plan.steps:
            if step.step_id == step_id:
                step.status = status
                step.result = result
                step.error_message = error_message
                logger.debug(f"📋 Paso {step_id}/{plan.total_steps}: {status.value}")
                break


planner = Planner()
