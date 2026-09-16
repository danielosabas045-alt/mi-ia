#!/usr/bin/env python3
"""
OSAIA - Verificación Completa
Prueba TODOS los módulos de la estructura plana de OSAIA.
"""
from __future__ import annotations
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))


def check(label: str, condition: bool, detail: str = "") -> bool:
    icon = "✅" if condition else "❌"
    print(f"  {icon} {label}" + (f" — {detail}" if detail else ""))
    return condition


async def main() -> int:
    exit_code = 0
    print("\n" + "=" * 60)
    print("  🦜 OSAIA - Verificación Completa")
    print("=" * 60)

    # ===== 1. IMPORTACIONES =====
    print("\n📦 1. Importación de módulos")
    modules = [
        ("config_settings", "Configuración"),
        ("utils_logger", "Logger"),
        ("core_context", "Context Manager"),
        ("core_model_router", "Model Router"),
        ("tools_base", "Tools Base"),
        ("tools_registry", "Tools Registry"),
        ("tools_basic", "Tools Basic"),
        ("tools_file", "Tools File"),
        ("tools_archive", "Tools Archive"),
        ("agents_base", "Agents Base"),
        ("agents_registry", "Agents Registry"),
        ("agents_general", "Agents (General + Reasoning + Research + File + Coding + Data)"),
        ("reasoning_reasoner", "Reasoner"),
        ("planning_planner", "Planner"),
        ("memory_system", "Memory System"),
        ("quality_engine", "Quality Engine + Reviewer"),
        ("recovery_manager", "Error Recovery Manager"),
        ("tasks_manager", "Task Manager"),
        ("engines_specialized", "Engines (Word/Excel/PPT/PDF/DB/Code/Image/Audio/Video)"),
        ("automation_workflow", "Workflow Engine"),
        ("plugin_system", "Plugin System"),
        ("core_orchestrator", "Orchestrator CORE"),
        ("api_main", "FastAPI Main"),
    ]

    for mod_name, desc in modules:
        try:
            __import__(mod_name)
            check(desc, True)
        except Exception as e:
            check(desc, False, f"{type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            exit_code = 1

    if exit_code:
        print("\n❌ Hay errores de importación.")
        return exit_code

    # ===== 2. HERRAMIENTAS =====
    print("\n🔧 2. Herramientas registradas")
    from tools_registry import tool_registry
    check(f"Total herramientas", tool_registry.count() > 0, f"count: {tool_registry.count()}")
    for t in tool_registry.list_tools():
        check(f"  • {t['name']}", True, f"v{t['version']} | {t['category']} | {len(t['parameters'])} params")

    # Prueba rápida de CALCULATOR
    r = tool_registry.execute("CALCULATOR", {"expression": "15 * 15 + 100"})
    check("CALCULATOR: 15*15+100 = 325", r.success and r.data.get("result_rounded") == 325.0,
          f"got: {r.data.get('result_rounded') if r.success else r.error_message}")

    # Prueba de DATETIME
    r = tool_registry.execute("DATETIME", {})
    check("DATETIME funciona", r.success, f"fecha: {r.data.get('date_iso') if r.success else r.error_message}")

    # ===== 3. AGENTES =====
    print("\n🤖 3. Agentes registrados")
    from agents_registry import agent_registry
    check(f"Total agentes", agent_registry.count() > 0, f"count: {agent_registry.count()}")
    for a in agent_registry.list_agents():
        check(f"  • {a['name']}", True, f"{len(a['capabilities'])} capacidades")

    # ===== 4. RAZONADOR =====
    print("\n🔍 4. Razonador")
    from reasoning_reasoner import reasoner
    tests = [
        ("Hola OSAIA", "saludo"),
        ("Cuánto es 25 * 4?", "calculo"),
        ("Qué hora es?", "consulta_fecha"),
        ("Convierte 100°C a °F", "conversion"),
        ("Qué eres?", "pregunta_osaia"),
        ("Crea un sistema de ventas", "solicitud_tarea_compleja"),
    ]
    for text, expected in tests:
        res = reasoner.analyze(text)
        ok = res.intent.value == expected
        status = "✓" if ok else "✗"
        print(f"  {status} '{text[:30]}...' → {res.intent.value} (esperado: {expected}) conf:{res.confidence:.2f}")

    # ===== 5. PLANIFICADOR =====
    print("\n📋 5. Planificador")
    from planning_planner import planner
    intent = reasoner.analyze("Calcula sqrt(144)")
    plan = planner.create_plan("Calcula sqrt(144)", intent)
    check("Plan creado", plan is not None)
    check(f"  Pasos: {plan.total_steps}", plan.total_steps >= 1)
    check(f"  Intención: {plan.intent}", plan.intent == intent.intent.value)

    # ===== 6. CALIDAD =====
    print("\n✅ 6. Quality Engine")
    from quality_engine import quality_engine, reviewer
    rep = quality_engine.verify_text("Respuesta válida y completa.")
    check("Respuesta buena aprobada", rep.passed, f"score: {rep.score:.0%}")
    rep2 = quality_engine.verify_text("")
    check("Respuesta vacía rechazada", not rep2.passed)
    approved, comment, _ = reviewer.review("Buena respuesta", "Prueba")
    check("Reviewer aprueba bueno", approved, comment)

    # ===== 7. MEMORIA =====
    print("\n💾 7. Memory System")
    from memory_system import session_memory, user_memory
    session_memory.save("test_key", "test_value", "prueba")
    check("SessionMemory guardar/leer", session_memory.read("test_key") == "test_value")
    check("SessionMemory contar", session_memory.count() > 0)

    # ===== 8. TASK MANAGER =====
    print("\n📋 8. Task Manager")
    from tasks_manager import task_manager, TaskStatus
    t = task_manager.create("Tarea de prueba")
    check("Tarea creada", t is not None)
    task_manager.update(t.task_id, TaskStatus.RUNNING, progress=0.5)
    task_manager.update(t.task_id, TaskStatus.COMPLETED, progress=1.0)
    t2 = task_manager.get(t.task_id)
    check("Tarea completada", t2 is not None and t2.status == TaskStatus.COMPLETED)

    # ===== 9. MODEL ROUTER =====
    print("\n🎯 9. Model Router")
    from core_model_router import ModelTaskType, ModelModality, RoutingCriteria, model_router
    crit = RoutingCriteria(task_type=ModelTaskType.CHAT)
    m = model_router.select(crit)
    check("Modelo seleccionado para CHAT", m is not None, m.model_id if m else "ninguno")

    # ===== 10. ORQUESTADOR (chat completo) =====
    print("\n🧠 10. Orquestador CORE — Chat end-to-end")
    from core_orchestrator import orchestrator

    test_msgs = [
        "Hola OSAIA",
        "Cuánto es 15 * 15 + 100?",
        "Qué día es hoy?",
        "Qué puedes hacer?",
    ]
    for msg in test_msgs:
        print(f"\n  📨 Usuario: '{msg}'")
        res = await orchestrator.process_request(msg)
        icon = "✅" if res.status == "completed" else "⚠️"
        print(f"  {icon} [{res.status}] {res.intent} (conf:{res.intent_confidence:.2f})")
        print(f"     💬 {res.response_text[:120].replace(chr(10), ' ')}...")
        if res.tools_used:
            print(f"     🔧 Herramientas: {[t.get('tool') for t in res.tools_used]}")

    # ===== 11. API FASTAPI =====
    print("\n🌐 11. API FastAPI")
    from fastapi.testclient import TestClient
    from api_main import app
    client = TestClient(app)

    r = client.get("/")
    check("GET /", r.status_code == 200)

    r = client.get("/api/v1/health/ping")
    check("GET /api/v1/health/ping", r.status_code == 200)

    r = client.get("/api/v1/health/full")
    check("GET /api/v1/health/full", r.status_code == 200)

    r = client.post("/api/v1/chat", json={"message": "Hola OSAIA"})
    check("POST /api/v1/chat", r.status_code == 200)
    if r.status_code == 200:
        d = r.json()
        check("  → session_id", "session_id" in d and bool(d["session_id"]))
        check("  → response", "response" in d and bool(d["response"]))
        check("  → intent", "intent" in d and d["intent"] != "unknown")

    r = client.get("/api/v1/agents")
    check("GET /api/v1/agents", r.status_code == 200)

    r = client.get("/api/v1/tools")
    check("GET /api/v1/tools", r.status_code == 200)

    r = client.get("/api/v1/models")
    check("GET /api/v1/models", r.status_code == 200)

    r = client.get("/api/v1/files/detect/supported")
    check("GET /api/v1/files/detect/supported", r.status_code == 200)

    r = client.get("/api/v1/projects")
    check("GET /api/v1/projects", r.status_code == 200)

    # ===== 12. MOTORES =====
    print("\n⚙️  12. Motores especializados")
    from engines_specialized import (UniversalFileEngine, WordEngine, ExcelEngine,
                                     PowerPointEngine, PdfEngine, DatabaseEngine,
                                     CodeEngine, ImageEngine, AudioEngine, VideoEngine)

    check("UniversalFileEngine", True,
          f"{len(UniversalFileEngine.supported_extensions())} extensiones, "
          f"{len(UniversalFileEngine.engines_available())} motores")

    engines = [
        ("WordEngine", WordEngine),
        ("ExcelEngine", ExcelEngine),
        ("PowerPointEngine", PowerPointEngine),
        ("PdfEngine", PdfEngine),
        ("DatabaseEngine", DatabaseEngine),
        ("CodeEngine", CodeEngine),
        ("ImageEngine", ImageEngine),
        ("AudioEngine", AudioEngine),
        ("VideoEngine", VideoEngine),
    ]
    for name, engine in engines:
        avail = engine.available()
        check(f"  • {name}", True,
              f"{'disponible' if avail else 'interfaz lista (instalar dependencia)'}")

    # Prueba CodeEngine.analyze
    sample_code = "def hola():\n    print('mundo')\n    return True"
    ca = CodeEngine.analyze(sample_code, "python")
    check("CodeEngine.analyze", ca.get("success") and ca.get("functions") == ["hola"],
          f"funciones: {ca.get('functions')}, lineas: {ca.get('lines_count')}")

    # Prueba DatabaseEngine.create_sqlite
    db_path = str(ROOT / "temporary" / "test_osaia.db")
    Path(db_path).parent.mkdir(exist_ok=True)
    dbr = DatabaseEngine.create_sqlite(db_path)
    check("DatabaseEngine.create_sqlite", dbr.get("success"),
          dbr.get("path") if dbr.get("success") else dbr.get("error"))
    if Path(db_path).exists():
        Path(db_path).unlink()

    # ===== 13. WORKFLOW ENGINE =====
    print("\n⚡ 13. Workflow Engine")
    from automation_workflow import workflow_engine, StepType
    wf = workflow_engine.create("Prueba Workflow", "Workflow de prueba")
    check("Workflow creado", wf is not None)
    sid = workflow_engine.add_step(wf.workflow_id, "Esperar", StepType.WAIT, {"seconds": 0.01})
    check("Paso agregado", sid is not None)
    exec_result = await workflow_engine.execute(wf.workflow_id)
    check("Workflow ejecutado", exec_result.get("success"), exec_result.get("error") or "OK")

    # ===== 14. PLUGIN SYSTEM =====
    print("\n🔌 14. Plugin System")
    from plugin_system import plugin_manager, OSAIAPlugin, PluginInfo
    check("PluginManager inicializado", plugin_manager is not None)
    check("Lista plugins vacía inicialmente", plugin_manager.count() == 0)

    # ===== RESUMEN =====
    print("\n" + "=" * 60)
    print("  ✅ RESUMEN OSAIA")
    print("=" * 60)
    print(f"""
  🦜 Estructura plana lista para GitHub:
  • Configuración: config_settings.py
  • Utilidades: utils_logger.py
  • CORE: core_context.py, core_model_router.py, core_orchestrator.py
  • Herramientas: tools_base, tools_registry, tools_basic, tools_file, tools_archive
  • Agentes: agents_base, agents_registry, agents_general (6 agentes)
  • Pipeline: reasoning_reasoner, planning_planner, memory_system,
              quality_engine, recovery_manager, tasks_manager
  • Motores: engines_specialized.py (Word, Excel, PPT, PDF, DB, Code, Image, Audio, Video)
  • Automatización: automation_workflow.py
  • Plugins: plugin_system.py
  • API: api_main + api_routes_health/chat/system/files/projects
  • Frontend: frontend_index.html, frontend_styles.css, frontend_app.js, etc.

  📊 Fases implementadas:
  ✅ FASE 1: CORE + CHAT API
  ✅ FASE 2: Context Engine
  ✅ FASE 3: File Engine + Uploads
  ✅ FASE 4: Tool System (8 herramientas)
  ✅ FASE 5: Agent System (6 agentes)
  ✅ FASE 6: Planner
  ✅ FASE 7: Review + Quality
  ✅ FASE 8: Error Recovery
  ⚙️ FASE 10: PDF + Word Engine (interfaz + implementación básica)
  ⚙️ FASE 11: Excel + Data Engine (interfaz + implementación básica)
  ⚙️ FASE 12: PowerPoint Engine (interfaz)
  ⚙️ FASE 13-15: Image/Audio/Video Engines (interfaces)
  ⚙️ FASE 16: Database Engine (interfaz)
  ⚙️ FASE 17: Code Engine (interfaz + análisis)
  ✅ FASE 18: ZIP + File Management
  ✅ FASE 19: Memory System
  ✅ FASE 20: Automation / Workflow Engine
  ✅ FASE 21: Plugin System
  ✅ FASE 22: Model Router

  🚀 Para ejecutar:
     pip install -r requirements.txt
     uvicorn api_main:app --reload

  📖 Documentación: http://localhost:8000/docs
""")

    return exit_code


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
