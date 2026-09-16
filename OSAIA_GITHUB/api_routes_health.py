"""
OSAIA API - Rutas de Salud
"""
from fastapi import APIRouter
from core_orchestrator import orchestrator

router = APIRouter(prefix="/health", tags=["Salud"])


@router.get("", summary="Verificación rápida")
async def health_simple():
    return {"status": "ok", "service": "OSAIA API",
            "message": "🦜 OSAIA está viva y respondiendo"}


@router.get("/full", summary="Verificación completa del sistema")
async def health_full():
    info = orchestrator.health_check()
    # Completar info de herramientas
    try:
        from tools_registry import tool_registry
        info["tool_registry"] = {
            "status": "online", "tools_count": tool_registry.count(),
            "categories": tool_registry.list_categories(),
        }
    except Exception:
        pass
    return info


@router.get("/ping", summary="Ping simple")
async def ping():
    return {"ping": "pong"}
