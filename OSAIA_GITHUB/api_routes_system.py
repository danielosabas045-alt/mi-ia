"""
OSAIA API - Rutas de Sistema: Agentes, Herramientas, Modelos, Workflows, Plugins
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from agents_registry import agent_registry
from automation_workflow import workflow_engine
from core_model_router import ModelTaskType, model_router
from plugin_system import plugin_manager
from tools_registry import tool_registry

router = APIRouter(tags=["Sistema"])


# ===== AGENTES =====
@router.get("/agents", summary="Listar agentes disponibles")
async def list_agents(category: Optional[str] = None):
    return {"total": agent_registry.count(),
            "categories": agent_registry.list_categories(),
            "agents": agent_registry.list_agents(category=category)}


@router.get("/agents/{agent_name}", summary="Detalle de un agente")
async def get_agent(agent_name: str):
    agent = agent_registry.get(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agente '{agent_name}' no encontrado")
    return agent.info()


@router.get("/agents/discover", summary="Descubrir agentes para una tarea")
async def discover_agents(task: str = Query(..., description="Descripción de la tarea")):
    agents = agent_registry.select_for_task(task)
    return {"task": task, "matches_found": len(agents), "recommended_agents": agents}


# ===== HERRAMIENTAS =====
@router.get("/tools", summary="Listar herramientas disponibles")
async def list_tools(category: Optional[str] = None):
    return {"total": tool_registry.count(),
            "categories": tool_registry.list_categories(),
            "tools": tool_registry.list_tools(category=category)}


@router.get("/tools/{tool_name}", summary="Detalle de una herramienta")
async def get_tool(tool_name: str):
    tool = tool_registry.get(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail=f"Herramienta '{tool_name}' no encontrada")
    return tool.info()


@router.get("/tools/discover", summary="Descubrir herramientas")
async def discover_tools(description: str = Query(...)):
    tools = tool_registry.discover(description)
    return {"description": description, "matches_found": len(tools), "recommended_tools": tools}


# ===== MODELOS =====
@router.get("/models", summary="Listar modelos disponibles")
async def list_models(task_type: Optional[str] = None):
    task = None
    if task_type:
        try:
            task = ModelTaskType(task_type)
        except ValueError:
            valid = [t.value for t in ModelTaskType]
            raise HTTPException(status_code=400, detail=f"Tipos válidos: {valid}")
    return {"total": len(model_router.list_models(task_type=task)),
            "task_type_filter": task_type, "models": model_router.list_models(task_type=task)}


@router.get("/models/select", summary="Seleccionar el mejor modelo")
async def select_model(task_type: str = Query(...),
                       prefer: str = Query("balanced", description="quality | speed | low_cost | balanced")):
    try:
        task = ModelTaskType(task_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Tipo de tarea inválido")

    from core_model_router import ModelModality, RoutingCriteria
    criteria_map = {"quality": {"prefer_quality": True}, "speed": {"prefer_speed": True},
                    "low_cost": {"prefer_low_cost": True}, "balanced": {}}
    if prefer not in criteria_map:
        raise HTTPException(status_code=400, detail="Preferencia inválida")

    criteria = RoutingCriteria(task_type=task, input_modality=ModelModality.TEXT,
                               output_modality=ModelModality.TEXT, **criteria_map[prefer])
    selected = model_router.select(criteria)
    if not selected:
        return {"selected": None, "message": "No hay modelos disponibles"}
    return {"preference": prefer, "task_type": task_type, "selected": selected.to_dict()}


# ===== WORKFLOWS =====
@router.get("/workflows", summary="Listar workflows")
async def list_workflows():
    return {"workflows": workflow_engine.list()}


@router.get("/workflows/{workflow_id}", summary="Detalle de un workflow")
async def get_workflow(workflow_id: str):
    wf = workflow_engine.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow no encontrado")
    return wf.to_dict()


# ===== PLUGINS =====
@router.get("/plugins", summary="Listar plugins")
async def list_plugins():
    return {"total": plugin_manager.count(), "plugins": plugin_manager.list_plugins()}
