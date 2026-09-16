# 🦜 OSAIA — General Purpose AI Operating System

> **"NO limitarse a contestar cuando puede hacer el trabajo."**

OSAIA es una plataforma de Inteligencia Artificial **generalista, multimodal, interactiva, autónoma bajo control, extensible, modular, robusta y orientada a la vida real**.

No es un simple chatbot. Es un **verdadero Sistema Operativo de IA** capaz de utilizar modelos, herramientas, agentes, motores y servicios para resolver tareas reales de principio a fin.

---

## 📁 Estructura (plana, lista para GitHub)

Todos los archivos están en un solo directorio para facilitar la subida:

```
# ===== CONFIGURACIÓN =====
README.md                 Este archivo
requirements.txt          Dependencias Python
.env.example              Variables de entorno (plantilla)
Dockerfile                Para Docker
docker-compose.yml        Orquestación de servicios
.gitignore                Archivos a ignorar en Git

# ===== UTILIDADES =====
utils_logger.py           Sistema de logging estructurado y coloreado

# ===== CONFIGURACIÓN CENTRAL =====
config_settings.py        Configuración global con Pydantic Settings

# ===== CORE (el cerebro) =====
core_context.py           Gestor de contexto conversacional
core_model_router.py      Selector inteligente de modelos
core_orchestrator.py      🧠 Orquestador principal

# ===== SISTEMA DE HERRAMIENTAS =====
tools_base.py             Interfaz abstracta BaseTool
tools_registry.py         Registro y descubrimiento dinámico
tools_basic.py            CALCULATOR, ECHO, TEXT_ANALYZER, DATETIME, FORMAT_CONVERTER
tools_file.py             FILE_READ, FILE_WRITE, FILE_LIST, FILE_DELETE, FILE_SEARCH
tools_archive.py          ZIP_CREATE, ZIP_EXTRACT, ZIP_LIST

# ===== SISTEMA DE AGENTES =====
agents_base.py            Interfaz abstracta BaseAgent
agents_registry.py        Registro y descubrimiento de agentes
agents_general.py         🤖 GeneralAgent (agente por defecto)
agents_reasoning.py       🧠 ReasoningAgent
agents_research.py        🔍 ResearchAgent
agents_file.py            📄 FileAgent
agents_coding.py          💻 CodingAgent
agents_data.py            📊 DataAgent

# ===== PIPELINE =====
reasoning_reasoner.py     🔍 Detecta intención y entidades
planning_planner.py       📋 Convierte ideas en planes de pasos
memory_system.py          💾 Session + User + Task Memory
quality_engine.py         ✅ Control de calidad antes de entregar
recovery_manager.py       🔄 Error Recovery + Reviewer
tasks_manager.py          📋 Gestión de tareas (8 estados)

# ===== MOTORES ESPECIALIZADOS =====
engines_universal_file.py 🔍 Universal File Engine (detecta formatos)
engines_word.py           📝 Word Engine (DOCX)
engines_excel.py          📊 Excel Engine (XLSX)
engines_powerpoint.py     📽️ PowerPoint Engine (PPTX)
engines_pdf.py            📕 PDF Engine
engines_database.py       🗄️ Database Engine (SQLite/PostgreSQL)
engines_code.py           💻 Code Engine + Sandbox
engines_image.py          🎨 Image Engine
engines_audio.py          🎤 Audio Engine
engines_video.py          🎬 Video Engine

# ===== AUTOMATIZACIÓN Y EXTENSIBILIDAD =====
automation_workflow.py    ⚡ Workflow Engine (FASE 20)
plugin_system.py          🔌 Plugin System (FASE 21)

# ===== API REST =====
api_routes_health.py      /health endpoints
api_routes_chat.py        /chat + /sessions + /tasks
api_routes_system.py      /agents + /tools + /models
api_routes_files.py       /files endpoints
api_routes_projects.py    /projects endpoints
api_main.py               🌐 Punto de entrada FastAPI

# ===== FRONTEND =====
frontend_index.html       🎨 Interfaz principal
frontend_styles.css       Estilos monocromáticos elegantes
frontend_app.js           Lógica de la interfaz
frontend_chat.js          Módulo de chat
frontend_code_generator.js Generador de código
frontend_data.js          Base de conocimientos

# ===== VERIFICACIÓN =====
verify_all.py             🧪 Script de verificación automática
```

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar entorno
cp .env.example .env
# Editar .env según necesidades

# 3. Ejecutar el servidor
uvicorn api_main:app --reload --host 0.0.0.0 --port 8000
```

### Documentación API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Verificación automática
```bash
python verify_all.py
```

### Abrir el frontend
Abre `frontend_index.html` directamente en tu navegador.

---

## 🧠 Arquitectura del Pipeline

```
USUARIO / API
    ↓
🧠 ORCHESTRATOR (core_orchestrator.py)
    ↓
┌─────────────────────────────────────────────────┐
│  1. REASONER  →  ¿Qué quiere el usuario?         │
│  2. PLANNER   →  ¿Qué pasos hay que seguir?      │
│  3. MODEL ROUTER → ¿Qué modelo usar?             │
│  4. AGENTS     → ¿Qué especialista delegar?      │
│  5. TOOLS      → ¿Qué herramientas ejecutar?     │
│  6. QUALITY    → ¿El resultado es bueno?         │
│  7. REVIEWER   → ¿Se aprueba o se corrige?       │
│  8. RECOVERY   → Si falla → reintentar / fallback│
└─────────────────────────────────────────────────┘
    ↓
RESULTADO FINAL + ESTADO CLARO
```

---

## 📋 Desarrollo por Fases

| Fase | Módulo | Estado | Archivos |
|------|--------|--------|----------|
| **FASE 1** | **OSAIA CORE + CHAT API** | ✅ Implementado | core_*, api_*, agents_general, tools_basic |
| **FASE 2** | **Context Engine** | ✅ Implementado | core_context.py |
| **FASE 3** | **File Engine + Uploads** | ✅ Implementado | tools_file.py, engines_universal_file.py, api_routes_files.py |
| **FASE 4** | **Tool System** | ✅ Implementado | tools_base, tools_registry, tools_basic, tools_file, tools_archive |
| **FASE 5** | **Agent System** | ✅ Implementado | agents_base, agents_registry, agents_general, agents_reasoning, agents_research, agents_file, agents_coding, agents_data |
| **FASE 6** | **Planner** | ✅ Implementado | planning_planner.py |
| **FASE 7** | **Review + Quality** | ✅ Implementado | quality_engine.py, recovery_manager.py (Reviewer) |
| **FASE 8** | **Error Recovery** | ✅ Implementado | recovery_manager.py |
| FASE 9 | Web Search + Research | ⚙️ Interfaz lista | agents_research.py (base) |
| **FASE 10** | **PDF + Word Engine** | ✅ Interfaces + implementaciones básicas | engines_pdf.py, engines_word.py |
| **FASE 11** | **Excel + Data Engine** | ✅ Interfaces + implementaciones básicas | engines_excel.py, agents_data.py |
| **FASE 12** | **PowerPoint Engine** | ✅ Interfaz lista | engines_powerpoint.py |
| FASE 13 | Image + Vision Engine | ⚙️ Interfaz lista | engines_image.py |
| FASE 14 | Audio Engine | ⚙️ Interfaz lista | engines_audio.py |
| FASE 15 | Video Engine | ⚙️ Interfaz lista | engines_video.py |
| **FASE 16** | **Database Engine** | ✅ Interfaz lista | engines_database.py |
| **FASE 17** | **Code Engine** | ✅ Interfaz lista | engines_code.py, agents_coding.py |
| **FASE 18** | **ZIP + File Management** | ✅ Implementado | tools_archive.py |
| **FASE 19** | **Memory System** | ✅ Implementado | memory_system.py |
| **FASE 20** | **Automation / Workflow** | ✅ Implementado | automation_workflow.py |
| **FASE 21** | **Plugin System** | ✅ Interfaz lista | plugin_system.py |
| **FASE 22** | **Model Router** | ✅ Implementado | core_model_router.py |
| FASE 23 | Security | ⏳ Pendiente |
| FASE 24 | Testing completo | ⏳ Pendiente |
| FASE 25 | Production Ready | ⏳ Pendiente |

---

## 🛠️ Principios de Diseño

1. **Extensibilidad**: Crecer mediante plugins, herramientas, agentes y modelos
2. **Modularidad**: Cada componente es independiente y reemplazable
3. **Robustez**: Error Recovery Engine — nunca quedarse callada
4. **Transparencia**: Live Activity — mostrar qué está haciendo
5. **No inventar**: Nunca fabricar resultados. Si falla, explicar exactamente qué falló
6. **Resultados parciales**: Si 8 de 10 tareas funcionan, entregar las 8
7. **Contexto**: Mantener memoria de conversación, archivos, proyectos, preferencias
8. **Calidad**: Quality Control Engine antes de entregar resultados

---

## 🦜 El principio supremo

> OSAIA NO debe ser definida por una lista pequeña de funciones.
> OSAIA debe ser definida por su **CAPACIDAD DE UTILIZAR INTELIGENTEMENTE HERRAMIENTAS, AGENTES, MODELOS Y RECURSOS**.

> La meta es: **"Una IA que no solamente responde. Una IA que trabaja."**

---

## 🤝 Contribuir

Este proyecto se construye por fases. Cada fase se valida completamente antes de avanzar a la siguiente.

---

## 📜 Nota

OSAIA está en **desarrollo activo**. Las fases marcadas como "✅ Implementado" tienen código funcional. Las marcadas como "⚙️ Interfaz lista" tienen las abstracciones y contratos definidos, listos para implementaciones concretas en actualizaciones futuras.

🦜✨
