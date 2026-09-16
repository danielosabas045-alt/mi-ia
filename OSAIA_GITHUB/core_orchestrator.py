"""
OSAIA CORE - Orquestador Principal 🧠
Coordina TODO el pipeline:
USUARIO → RAZONADOR → PLANIFICADOR → MODEL ROUTER → AGENTES → HERRAMIENTAS
→ CALIDAD → REVISIÓN → ERROR RECOVERY → RESULTADO FINAL
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from agents_registry import agent_registry
from config_settings import settings
from core_context import ConversationContext, context_manager, FileReference, MessageRole
from core_model_router import ModelTaskType, ModelModality, RoutingCriteria, model_router
from memory_system import session_memory, task_memory
from planning_planner import ExecutionPlan, PlanStep, StepStatus, planner
from quality_engine import quality_engine, reviewer
from reasoning_reasoner import IntentExtraction, IntentType, reasoner
from recovery_manager import error_manager
from tasks_manager import Task, TaskStatus, task_manager
from utils_logger import get_logger

logger = get_logger("orchestrator")


@dataclass
class OrchestrationResult:
    session_id: str
    intent: str
    intent_confidence: float
    plan: Optional[ExecutionPlan] = None
    task: Optional[Task] = None
    response_text: str = ""
    status: str = "completed"
    agent_used: Optional[str] = None
    tools_used: List[Dict[str, Any]] = field(default_factory=list)
    quality_report: Optional[Dict[str, Any]] = None
    review_comment: str = ""
    errors: List[Dict[str, Any]] = field(default_factory=list)
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {"session_id": self.session_id, "intent": self.intent,
                "intent_confidence": round(self.intent_confidence, 3),
                "plan": self.plan.to_dict() if self.plan else None,
                "task": self.task.to_dict() if self.task else None,
                "response": self.response_text, "status": self.status,
                "agent_used": self.agent_used, "tools_used": self.tools_used,
                "quality_report": self.quality_report, "review_comment": self.review_comment,
                "errors": self.errors,
                "started_at": self.started_at.isoformat(),
                "completed_at": self.completed_at.isoformat() if self.completed_at else None,
                "metadata": self.metadata}


class Orchestrator:
    def __init__(self) -> None:
        logger.info("🧠 OSAIA CORE Orchestrator inicializado")

    async def process_request(self, user_input: str, session_id: Optional[str] = None,
                              user_id: Optional[str] = None,
                              uploaded_files: Optional[List[Dict[str, Any]]] = None) -> OrchestrationResult:
        started_at = datetime.now(timezone.utc)
        logger.info(f"🧠 OSAIA CORE recibiendo: '{user_input[:80]}...'")

        # 1. CONTEXTO
        context = context_manager.get_or_create(session_id)
        if user_id:
            context.user_id = user_id
        context.add_message(role=MessageRole.USER, content=user_input)
        if uploaded_files:
            for f in uploaded_files:
                context.add_file(FileReference(
                    file_id=f.get("file_id", ""), name=f.get("name", ""),
                    path=f.get("path", ""), file_type=f.get("type", "unknown"),
                    size_bytes=f.get("size", 0)))

        # 2. TAREA
        task = task_manager.create(
            description=user_input[:200], session_id=context.session_id,
            user_id=user_id, metadata={"files_count": len(uploaded_files) if uploaded_files else 0})

        result = OrchestrationResult(
            session_id=context.session_id, intent="unknown",
            intent_confidence=0.0, task=task, started_at=started_at)

        try:
            task_manager.update(task.task_id, TaskStatus.RUNNING, progress=0.1,
                                progress_message="Analizando solicitud...")

            # 3. RAZONAMIENTO
            logger.debug("🔍 Paso 1/6: Razonando...")
            intent_extraction: IntentExtraction = reasoner.analyze(user_input)
            result.intent = intent_extraction.intent.value
            result.intent_confidence = intent_extraction.confidence

            if intent_extraction.requires_clarification:
                task_manager.update(task.task_id, TaskStatus.COMPLETED, progress=1.0,
                                    progress_message="Necesita clarificación")
                result.status = "needs_information"
                result.response_text = intent_extraction.clarification_question or (
                    "Para ayudarte mejor, ¿podrías especificar un poco más?")
                result.completed_at = datetime.now(timezone.utc)
                context.add_message(role=MessageRole.ASSISTANT, content=result.response_text)
                return result

            # 4. PLANIFICACIÓN
            logger.debug("📋 Paso 2/6: Planificando...")
            task_manager.update(task.task_id, TaskStatus.RUNNING, progress=0.2,
                                progress_message="Creando plan de ejecución...")
            plan: ExecutionPlan = planner.create_plan(user_input, intent_extraction)
            result.plan = plan

            # 5. MODEL ROUTER
            logger.debug("🎯 Paso 3/6: Seleccionando modelo...")
            routing = RoutingCriteria(
                task_type=self._map_intent(intent_extraction.intent),
                prefer_speed=settings.MODEL_TEMPERATURE >= 0.5,
                prefer_quality=settings.MODEL_TEMPERATURE < 0.5)
            selected_model = model_router.select(routing)
            result.metadata["selected_model"] = selected_model.model_id if selected_model else "none"

            # 6. EJECUCIÓN
            logger.debug("⚙️  Paso 4/6: Ejecutando plan...")
            response_text, tools_used, agent_name = await self._execute_plan(plan, context, task)
            result.response_text = response_text
            result.tools_used = tools_used
            result.agent_used = agent_name

            # 7. CALIDAD
            logger.debug("✅ Paso 5/6: Verificando calidad...")
            task_manager.update(task.task_id, TaskStatus.RUNNING, progress=0.85,
                                progress_message="Verificando calidad...")
            quality_report = quality_engine.verify_text(response_text)
            result.quality_report = quality_report.to_dict()

            # 8. REVISIÓN
            logger.debug("👀 Paso 6/6: Revisión final...")
            approved, review_comment, correcciones = reviewer.review(
                response_text, user_input,
                issues=[i.message for i in quality_report.issues] if not quality_report.passed else None)
            result.review_comment = review_comment

            # 9. ENTREGA
            if approved or quality_report.score >= 0.6:
                task_manager.update(task.task_id, TaskStatus.COMPLETED, progress=1.0,
                                    progress_message="Completado exitosamente",
                                    result={"response": response_text})
                result.status = "completed"
            else:
                task_manager.update(task.task_id, TaskStatus.PARTIALLY_COMPLETED, progress=0.9,
                                    progress_message="Completado con observaciones")
                result.status = "partially_completed"
                result.response_text += f"\n\n---\n*⚠️  Nota: {review_comment}*"

            context.add_message(role=MessageRole.ASSISTANT, content=result.response_text)
            task_memory.add({"task_id": task.task_id, "intent": result.intent,
                             "status": result.status, "request": user_input[:100],
                             "timestamp": datetime.now(timezone.utc).isoformat()})

        except Exception as e:
            error_record = error_manager.record(e, "orchestrator")
            result.errors.append(error_record.to_dict())
            result.response_text = self._fallback_response(user_input, e)
            result.status = "failed_with_reason"
            task_manager.update(task.task_id, TaskStatus.FAILED, progress=1.0,
                                progress_message=f"Error: {type(e).__name__}",
                                error_message=str(e))
            context.add_message(role=MessageRole.ASSISTANT, content=result.response_text)

        finally:
            result.completed_at = datetime.now(timezone.utc)
            if result.task:
                result.task = task_manager.get(task.task_id)

        logger.info(f"🧠 Orquestación: {result.status} [{result.intent}, conf: {result.intent_confidence:.2f}]")
        return result

    async def _execute_plan(self, plan: ExecutionPlan, context: ConversationContext,
                            task: Task) -> tuple:
        tools_used: List[Dict[str, Any]] = []
        agent_name: Optional[str] = None
        final_response = ""

        for step in plan.steps:
            planner.update_step(plan, step.step_id, StepStatus.RUNNING)
            task_manager.update(task.task_id, TaskStatus.RUNNING,
                                progress=0.2 + (step.step_id / max(plan.total_steps, 1)) * 0.6,
                                progress_message=f"Paso {step.step_id}/{plan.total_steps}: {step.description[:50]}")
            try:
                if step.agent:
                    agent = agent_registry.get(step.agent)
                    if not agent and step.agent != "GeneralAgent":
                        agent = agent_registry.get("GeneralAgent")
                    if agent:
                        agent_name = agent.name
                        agent_result = await agent.execute(
                            task=plan.original_request, context=context, step=step.to_dict())
                        if agent_result.tool_calls:
                            tools_used.extend(agent_result.tool_calls)
                        if agent_result.success:
                            final_response = agent_result.summary
                            planner.update_step(plan, step.step_id, StepStatus.COMPLETED,
                                                result=agent_result.data)
                        else:
                            planner.update_step(plan, step.step_id, StepStatus.FAILED,
                                                error_message=agent_result.error_message)
                            if step.required:
                                final_response = agent_result.error_message or "Fallo en la ejecución"
                            continue

                elif step.tool:
                    from tools_registry import tool_registry
                    tool_result = tool_registry.execute(step.tool, step.tool_params)
                    tools_used.append({"tool": step.tool, "success": tool_result.success,
                                       "duration": tool_result.duration_seconds})
                    if tool_result.success:
                        final_response = f"Resultado de {step.tool}: {tool_result.data}"
                        planner.update_step(plan, step.step_id, StepStatus.COMPLETED,
                                            result=tool_result.data)
                    else:
                        planner.update_step(plan, step.step_id, StepStatus.FAILED,
                                            error_message=tool_result.error_message)
                else:
                    agent = agent_registry.get("GeneralAgent")
                    if agent:
                        agent_name = agent.name
                        ar = await agent.execute(task=plan.original_request, context=context)
                        final_response = ar.summary
                        status = StepStatus.COMPLETED if ar.success else StepStatus.FAILED
                        planner.update_step(plan, step.step_id, status, result=ar.data,
                                            error_message=ar.error_message)

            except Exception as e:
                error_manager.record(e, f"plan_step_{step.step_id}")
                planner.update_step(plan, step.step_id, StepStatus.FAILED,
                                    error_message=f"{type(e).__name__}: {str(e)}")
                if step.required:
                    final_response = (f"Hubo un problema en el paso {step.step_id}: {str(e)}. "
                                      "He registrado el error.")

        if not final_response:
            final_response = ("No pude completar la ejecución del plan. "
                              "Algunos módulos estarán disponibles en actualizaciones futuras de OSAIA.")
        return final_response, tools_used, agent_name

    def _map_intent(self, intent: IntentType) -> ModelTaskType:
        m = {
            IntentType.SALUDO: ModelTaskType.CHAT,
            IntentType.DESPEDIDA: ModelTaskType.CHAT,
            IntentType.AGRADECIMIENTO: ModelTaskType.CHAT,
            IntentType.PREGUNTA_INFORMACION: ModelTaskType.REASONING,
            IntentType.PREGUNTA_OSAIA: ModelTaskType.CHAT,
            IntentType.CALCULO: ModelTaskType.REASONING,
            IntentType.ANALISIS_TEXTO: ModelTaskType.SUMMARIZATION,
            IntentType.CONSULTA_FECHA: ModelTaskType.CHAT,
            IntentType.CONVERSION: ModelTaskType.REASONING,
            IntentType.SOLICITUD_CODIGO: ModelTaskType.CODE_GENERATION,
            IntentType.SOLICITUD_IMAGEN: ModelTaskType.IMAGE_GENERATION,
            IntentType.SOLICITUD_ARCHIVO: ModelTaskType.TEXT_GENERATION,
            IntentType.SOLICITUD_TAREA_COMPLEJA: ModelTaskType.REASONING,
            IntentType.GENERAL: ModelTaskType.CHAT,
        }
        return m.get(intent, ModelTaskType.CHAT)

    def _fallback_response(self, user_input: str, error: Exception) -> str:
        return (f"⚠️  Ocurrió un inconveniente al procesar tu solicitud.\n\n"
                f"**Tipo:** {type(error).__name__}\n**Descripción:** {str(error)[:200]}\n\n"
                f"He registrado el error. Puedes intentar reformular tu petición o probar:\n"
                f"• Un cálculo matemático\n• Una pregunta general\n• Un análisis de texto\n\n"
                f"OSAIA se actualiza constantemente. 🦜")

    def health_check(self) -> Dict[str, Any]:
        return {
            "orchestrator": "online",
            "reasoner": "online",
            "planner": "online",
            "agent_registry": {
                "status": "online", "agents_count": agent_registry.count(),
                "agents": [a["name"] for a in agent_registry.list_agents()],
            },
            "tool_registry": {
                "status": "online", "tools_count": 0,  # Se llena al importar tools_*
                "categories": [],
            },
            "model_router": {"status": "online", "models_count": len(model_router.list_models())},
            "quality_engine": "online",
            "error_manager": "online",
            "task_manager": task_manager.stats(),
            "context_manager": {"active_sessions": context_manager.count()},
            "settings": {"app_name": settings.APP_NAME, "version": settings.APP_VERSION,
                         "environment": settings.ENVIRONMENT,
                         "default_model": settings.DEFAULT_MODEL},
        }


orchestrator = Orchestrator()
