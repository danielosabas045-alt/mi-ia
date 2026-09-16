"""
OSAIA API - Rutas de Chat
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from core_context import context_manager
from core_orchestrator import orchestrator
from tasks_manager import TaskStatus, task_manager

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    stream: bool = False
    uploaded_files: Optional[List[Dict[str, Any]]] = None

    model_config = {"json_schema_extra": {
        "example": {"message": "Hola OSAIA, ¿qué puedes hacer?", "session_id": None}}}


class ChatResponse(BaseModel):
    session_id: str
    response: str
    status: str
    intent: str
    intent_confidence: float
    agent_used: Optional[str] = None
    tools_used: List[Dict[str, Any]] = Field(default_factory=list)
    quality_report: Optional[Dict[str, Any]] = None
    review_comment: str = ""
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    plan: Optional[Dict[str, Any]] = None
    task: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


@router.post("", response_model=ChatResponse, summary="Enviar mensaje a OSAIA")
async def send_message(request: ChatRequest):
    try:
        # Importar herramientas para que se registren
        import tools_basic  # noqa: F401
        import tools_file   # noqa: F401
        import tools_archive  # noqa: F401
        # Importar agentes para que se registren
        import agents_general  # noqa: F401

        result = await orchestrator.process_request(
            user_input=request.message, session_id=request.session_id,
            user_id=request.user_id, uploaded_files=request.uploaded_files)

        return ChatResponse(
            session_id=result.session_id, response=result.response_text,
            status=result.status, intent=result.intent,
            intent_confidence=result.intent_confidence,
            agent_used=result.agent_used, tools_used=result.tools_used,
            quality_report=result.quality_report, review_comment=result.review_comment,
            errors=result.errors, plan=result.plan.to_dict() if result.plan else None,
            task=result.task.to_dict() if result.task else None, metadata=result.metadata)

    except Exception as e:
        raise HTTPException(status_code=500,
                            detail=f"Error interno: {type(e).__name__}: {str(e)}")


@router.get("/sessions", summary="Listar sesiones activas")
async def list_sessions(limit: int = Query(20, ge=1, le=100)):
    sessions = context_manager.list_sessions()
    return {"total": len(sessions), "sessions": sessions[:limit]}


@router.get("/sessions/{session_id}", summary="Detalle de una sesión")
async def get_session(session_id: str):
    ctx = context_manager.get(session_id)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Sesión '{session_id}' no encontrada")
    return ctx.summary()


@router.get("/sessions/{session_id}/messages", summary="Historial de mensajes")
async def get_messages(session_id: str, limit: int = Query(50, ge=1, le=500)):
    ctx = context_manager.get(session_id)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Sesión '{session_id}' no encontrada")
    messages = [m.to_dict() for m in ctx.get_recent(limit)]
    return {"session_id": session_id, "total_messages": len(ctx.messages),
            "returned": len(messages), "messages": messages}


@router.delete("/sessions/{session_id}", summary="Eliminar una sesión")
async def delete_session(session_id: str):
    deleted = context_manager.delete(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Sesión '{session_id}' no encontrada")
    return {"status": "ok", "message": f"Sesión {session_id} eliminada"}


@router.get("/tasks", summary="Listar tareas recientes")
async def list_tasks(session_id: Optional[str] = None, status: Optional[str] = None,
                     limit: int = Query(50, ge=1, le=200)):
    ts = TaskStatus(status) if status else None
    tasks = task_manager.list(session_id=session_id, status=ts, limit=limit)
    return {"total": len(tasks), "tasks": tasks}


@router.get("/tasks/{task_id}", summary="Detalle de una tarea")
async def get_task(task_id: str):
    task = task_manager.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Tarea '{task_id}' no encontrada")
    return task.to_dict()


@router.post("/tasks/{task_id}/cancel", summary="Cancelar una tarea")
async def cancel_task(task_id: str):
    cancelled = task_manager.cancel(task_id)
    if not cancelled:
        raise HTTPException(status_code=400, detail=f"No se pudo cancelar '{task_id}'")
    return {"status": "ok", "message": f"Tarea {task_id} cancelada"}
