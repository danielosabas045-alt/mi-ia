"""
OSAIA API - Punto de Entrada Principal 🌐

Ejecutar:
    uvicorn api_main:app --reload --host 0.0.0.0 --port 8000

Documentación:
    http://localhost:8000/docs
    http://localhost:8000/redoc
"""
from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config_settings import settings
from utils_logger import get_logger

logger = get_logger("api_main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info(f"🦜 {settings.APP_NAME} v{settings.APP_VERSION} iniciando...")
    logger.info(f"📍 Entorno: {settings.ENVIRONMENT}")

    settings.ensure_directories()

    # Registrar herramientas y agentes (auto-registro por decoradores)
    try:
        import tools_basic      # noqa: F401
        import tools_file       # noqa: F401
        import tools_archive    # noqa: F401
        import agents_general   # noqa: F401
        logger.info("✅ Módulos de herramientas y agentes cargados")
    except Exception as e:
        logger.warning(f"⚠️  Algunos módulos no se pudieron cargar: {e}")

    from agents_registry import agent_registry
    from tools_registry import tool_registry

    logger.info(f"🤖 Agentes: {agent_registry.count()}")
    for a in agent_registry.list_agents():
        logger.info(f"   • {a['name']} v{a['version']} — {a['category']}")

    logger.info(f"🔧 Herramientas: {tool_registry.count()}")
    for t in tool_registry.list_tools():
        logger.info(f"   • {t['name']} v{t['version']} — {t['category']}")

    # Inicializar plugin manager con referencias al sistema
    try:
        from plugin_system import plugin_manager
        plugin_manager.set_context("agent_registry", agent_registry)
        plugin_manager.set_context("tool_registry", tool_registry)
        plugin_manager.set_context("settings", settings)
    except Exception:
        pass

    logger.info("✅ OSAIA API lista")
    logger.info("=" * 60)
    yield
    logger.info("🦜 OSAIA API apagándose...")


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version=settings.APP_VERSION,
    description=(
        "🦜 **OSAIA — General Purpose AI Operating System**\n\n"
        "Plataforma de IA Generalista, Multimodal, Interactiva, Autónoma bajo control, "
        "Extensible, Modular, Robusta y Orientada a la vida real.\n\n"
        "**Principio:** No limitarse a contestar cuando puede hacer el trabajo.\n\n"
        "**Arquitectura:** Orchestrator CORE, Reasoner, Planner, Multi-Agents, "
        "Tool System, Model Router, Quality Engine, Error Recovery, Memory System, "
        "Task Manager, Workflow Engine, Plugin System.\n\n"
        "**Fases implementadas:** 1-8 (CORE, Contexto, Archivos, Herramientas, "
        "Agentes, Planificación, Calidad, Recuperación de errores) + interfaces para "
        "fases 10-21 (Office, PDF, DB, Code, Media, Automation, Plugins)."
    ),
    lifespan=lifespan,
    docs_url="/docs", redoc_url="/redoc",
    contact={"name": "OSAIA Team"},
    license_info={"name": "Development Phase", "identifier": "dev"},
)

app.add_middleware(
    CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
    expose_headers=["X-OSAIA-Session-ID"],
)


# ===== ROOT =====
@app.get("/", tags=["General"], summary="Información de la API")
async def root():
    return {
        "name": settings.APP_NAME, "version": settings.APP_VERSION,
        "description": "General Purpose AI Operating System",
        "motto": "No limitarse a contestar cuando puede hacer el trabajo.",
        "phase": "FASES 1-8 + interfaces para 10-21",
        "docs": "/docs", "redoc": "/redoc",
        "endpoints": {
            "chat": "/api/v1/chat", "agents": "/api/v1/agents",
            "tools": "/api/v1/tools", "models": "/api/v1/models",
            "files": "/api/v1/files", "projects": "/api/v1/projects",
            "workflows": "/api/v1/workflows", "plugins": "/api/v1/plugins",
            "health": "/api/v1/health",
        },
    }


# ===== RUTAS =====
API_PREFIX = "/api/v1"

import api_routes_health    # noqa: E402
import api_routes_chat      # noqa: E402
import api_routes_system    # noqa: E402
import api_routes_files     # noqa: E402
import api_routes_projects  # noqa: E402

app.include_router(api_routes_health.router, prefix=API_PREFIX)
app.include_router(api_routes_chat.router, prefix=API_PREFIX)
app.include_router(api_routes_system.router, prefix=API_PREFIX)
app.include_router(api_routes_files.router, prefix=API_PREFIX)
app.include_router(api_routes_projects.router, prefix=API_PREFIX)


# ===== MANEJADOR DE ERRORES GLOBAL =====
@app.exception_handler(Exception)
async def global_error_handler(request, exc):
    logger.error(f"💥 Excepción no manejada: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error",
                 "error_type": type(exc).__name__,
                 "message": str(exc) if settings.DEBUG else "Error interno del servidor",
                 "detail": "El error ha sido registrado."})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_main:app", host=settings.HOST, port=settings.PORT,
                reload=settings.DEBUG, log_level=settings.LOG_LEVEL.lower())
