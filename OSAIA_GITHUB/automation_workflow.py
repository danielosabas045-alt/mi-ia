"""
OSAIA - Automation / Workflow Engine (FASE 20)
Permite encadenar tareas complejas con triggers, pasos,
condiciones, bucles, reintentos y fallbacks.
"""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("workflow")


class StepType(str, Enum):
    TOOL = "tool"
    AGENT = "agent"
    CONDITION = "condition"
    LOOP = "loop"
    PARALLEL = "parallel"
    WAIT = "wait"
    CUSTOM = "custom"


class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    READY = "ready"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class WorkflowStep:
    step_id: str
    name: str
    step_type: StepType
    config: Dict[str, Any] = field(default_factory=dict)
    condition: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 2
    on_failure: str = "fail"  # fail | continue | fallback
    fallback_step: Optional[str] = None
    depends_on: List[str] = field(default_factory=list)
    status: str = "pending"
    result: Any = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {"step_id": self.step_id, "name": self.name, "type": self.step_type.value,
                "config": self.config, "condition": self.condition,
                "depends_on": self.depends_on, "status": self.status,
                "error": self.error}


@dataclass
class Workflow:
    workflow_id: str
    name: str
    description: str = ""
    trigger: Dict[str, Any] = field(default_factory=dict)
    steps: List[WorkflowStep] = field(default_factory=list)
    status: WorkflowStatus = WorkflowStatus.DRAFT
    variables: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Any = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {"workflow_id": self.workflow_id, "name": self.name,
                "description": self.description, "status": self.status.value,
                "trigger": self.trigger, "steps_count": len(self.steps),
                "steps": [s.to_dict() for s in self.steps],
                "variables": list(self.variables.keys()),
                "created_at": self.created_at.isoformat(),
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "error": self.error}


class WorkflowEngine:
    """Motor de flujos de trabajo automatizados."""

    def __init__(self) -> None:
        self._workflows: Dict[str, Workflow] = {}
        self._custom_handlers: Dict[str, Callable] = {}

    def create(self, name: str, description: str = "") -> Workflow:
        wf = Workflow(workflow_id=f"wf_{uuid.uuid4().hex[:12]}",
                      name=name, description=description)
        self._workflows[wf.workflow_id] = wf
        logger.info(f"⚡ Workflow creado: {wf.workflow_id} — {name}")
        return wf

    def add_step(self, workflow_id: str, name: str, step_type: StepType,
                 config: Optional[Dict[str, Any]] = None,
                 depends_on: Optional[List[str]] = None, **kwargs) -> Optional[str]:
        wf = self._workflows.get(workflow_id)
        if not wf:
            return None
        step = WorkflowStep(
            step_id=f"step_{uuid.uuid4().hex[:8]}",
            name=name, step_type=step_type,
            config=config or {},
            depends_on=depends_on or [],
            **kwargs
        )
        wf.steps.append(step)
        return step.step_id

    def register_handler(self, name: str, handler: Callable) -> None:
        self._custom_handlers[name] = handler
        logger.info(f"⚡ Handler registrado: {name}")

    async def execute(self, workflow_id: str, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        wf = self._workflows.get(workflow_id)
        if not wf:
            return {"success": False, "error": f"Workflow {workflow_id} no encontrado"}

        wf.status = WorkflowStatus.RUNNING
        wf.started_at = datetime.now(timezone.utc)
        if input_data:
            wf.variables.update(input_data)

        logger.info(f"⚡ Ejecutando workflow: {wf.name} ({len(wf.steps)} pasos)")

        executed = set()
        max_iterations = len(wf.steps) * 3
        iteration = 0

        try:
            while len(executed) < len(wf.steps) and iteration < max_iterations:
                iteration += 1
                progress = False

                for step in wf.steps:
                    if step.step_id in executed:
                        continue
                    deps_ok = all(d in executed for d in step.depends_on)
                    if not deps_ok:
                        continue

                    step.status = "running"
                    progress = True

                    try:
                        result = await self._execute_step(step, wf)
                        step.result = result
                        step.status = "completed"
                        executed.add(step.step_id)
                        wf.variables[f"step_{step.step_id}_result"] = result
                        logger.debug(f"⚡ Paso '{step.name}' completado")

                    except Exception as e:
                        step.error = str(e)
                        if step.on_failure == "continue":
                            step.status = "skipped"
                            executed.add(step.step_id)
                            logger.warning(f"⚡ Paso '{step.name}' falló, continuando: {e}")
                        elif step.on_failure == "fallback" and step.fallback_step:
                            logger.warning(f"⚡ Paso '{step.name}' falló, usando fallback")
                            step.status = "fallback_used"
                            executed.add(step.step_id)
                        else:
                            step.status = "failed"
                            raise

                if not progress:
                    break

            if len(executed) == len(wf.steps):
                wf.status = WorkflowStatus.COMPLETED
                wf.result = {"steps_executed": len(executed), "variables": wf.variables}
            else:
                wf.status = WorkflowStatus.FAILED
                wf.error = "No se pudieron ejecutar todos los pasos"

        except Exception as e:
            wf.status = WorkflowStatus.FAILED
            wf.error = str(e)
            logger.error(f"⚡ Workflow falló: {e}")

        wf.completed_at = datetime.now(timezone.utc)
        logger.info(f"⚡ Workflow finalizado: {wf.status.value}")
        return {"success": wf.status == WorkflowStatus.COMPLETED,
                "workflow_id": wf.workflow_id, "status": wf.status.value,
                "steps_executed": len(executed), "error": wf.error}

    async def _execute_step(self, step: WorkflowStep, wf: Workflow) -> Any:
        if step.step_type == StepType.TOOL:
            from tools_registry import tool_registry
            tool_name = step.config.get("tool_name")
            params = step.config.get("params", {})
            result = tool_registry.execute(tool_name, params)
            if not result.success:
                raise RuntimeError(result.error_message)
            return result.data

        elif step.step_type == StepType.AGENT:
            from agents_registry import agent_registry
            from core_context import ConversationContext
            agent_name = step.config.get("agent_name")
            task = step.config.get("task", "")
            agent = agent_registry.get(agent_name)
            if not agent:
                raise ValueError(f"Agente no encontrado: {agent_name}")
            ctx = step.config.get("context") or ConversationContext()
            result = await agent.execute(task, ctx)
            if not result.success:
                raise RuntimeError(result.error_message)
            return result.data

        elif step.step_type == StepType.WAIT:
            import asyncio
            seconds = step.config.get("seconds", 1)
            await asyncio.sleep(seconds)
            return {"waited_seconds": seconds}

        elif step.step_type == StepType.CUSTOM:
            handler_name = step.config.get("handler")
            if handler_name not in self._custom_handlers:
                raise ValueError(f"Handler no registrado: {handler_name}")
            handler = self._custom_handlers[handler_name]
            return await handler(step.config, wf.variables)

        return {"step_type": step.step_type.value, "note": "Ejecutado"}

    def get(self, workflow_id: str) -> Optional[Workflow]:
        return self._workflows.get(workflow_id)

    def list(self) -> List[Dict[str, Any]]:
        return [{"workflow_id": w.workflow_id, "name": w.name,
                 "status": w.status.value, "steps": len(w.steps)}
                for w in self._workflows.values()]


workflow_engine = WorkflowEngine()
