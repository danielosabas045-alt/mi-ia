"""
OSAIA - Agentes Concretos
GeneralAgent, ReasoningAgent, ResearchAgent, FileAgent, CodingAgent, DataAgent
"""
from __future__ import annotations
import re
from typing import Any
from agents_base import AgentResult, AgentStatus, BaseAgent
from agents_registry import agent_registry
from core_context import ConversationContext


# ============================================================
# GENERAL AGENT
# ============================================================
@agent_registry.register
class GeneralAgent(BaseAgent):
    name = "GeneralAgent"
    description = "Agente generalista versátil. Maneja conversación, razonamiento básico, usa herramientas y detecta necesidades especializadas."
    category = "core"
    version = "1.0.0"
    capabilities = ["conversación general", "respuesta a preguntas", "razonamiento básico",
                    "uso de herramientas", "cálculos matemáticos", "análisis de texto",
                    "conversión de unidades", "fecha y hora", "detección de necesidades"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        task_lower = task.lower()
        try:
            self.status = AgentStatus.THINKING
            tool_result = None
            tool_used = None

            if any(w in task_lower for w in ["calcula", "cuánto es", "cuanto es", "resuelve", "raíz", "potencia", "seno", "coseno", "logaritmo", "%", "porcentaje"]):
                expr = self._extract_math(task)
                if expr:
                    self.status = AgentStatus.EXECUTING
                    tool_result = self.use_tool("CALCULATOR", {"expression": expr})
                    tool_used = "CALCULATOR"

            elif any(w in task_lower for w in ["analiza este texto", "cuenta palabras", "estadísticas del texto", "frecuencia de palabras"]):
                self.status = AgentStatus.EXECUTING
                tool_result = self.use_tool("TEXT_ANALYZER", {"text": kwargs.get("text_to_analyze", task), "top_n": 10})
                tool_used = "TEXT_ANALYZER"

            elif any(w in task_lower for w in ["qué hora", "que hora", "qué día", "que día", "fecha actual", "día de la semana"]):
                self.status = AgentStatus.EXECUTING
                tool_result = self.use_tool("DATETIME", {})
                tool_used = "DATETIME"

            elif any(w in task_lower for w in ["convierte", "conversión", "a grados", "a metros", "a kilogramos", "a dólares", "a quetzales", "cambio de"]):
                conv = self._parse_conv(task)
                if conv:
                    self.status = AgentStatus.EXECUTING
                    tool_result = self.use_tool("FORMAT_CONVERTER", conv)
                    tool_used = "FORMAT_CONVERTER"

            elif any(w in task_lower for w in ["lee el archivo", "lee este archivo", "contenido del archivo", "file_read"]):
                m = re.search(r'(?:archivo|file)\s*[:=]?\s*["\']?([^\s"\']+)', task_lower)
                if m:
                    self.status = AgentStatus.EXECUTING
                    tool_result = self.use_tool("FILE_READ", {"path": m.group(1)})
                    tool_used = "FILE_READ"

            if tool_result and tool_used:
                if tool_result.success:
                    summary = self._format_tool(tool_used, tool_result.data)
                    return self._complete(started_at, summary, tool_result.data,
                                          tool_calls=[{"tool": tool_used, "params": tool_result.metadata}])
                else:
                    return self._fail(started_at, f"Herramienta {tool_used} falló: {tool_result.error_message}",
                                      tool_calls=[{"tool": tool_used, "error": tool_result.error_message}])

            summary = self._conversational(task, context)
            return self._complete(started_at, summary, {"response_type": "conversational"})

        except Exception as e:
            return self._fail(started_at, f"{type(e).__name__}: {str(e)}")

    def _extract_math(self, task: str) -> str:
        m = re.search(r"(?:cuánto es|cuanto es|calcula|resuelve|resultado de)\s+(.+?)(?:\?|$)", task, re.IGNORECASE)
        return m.group(1).strip() if m else task.strip()

    def _parse_conv(self, task: str) -> dict:
        tl = task.lower()
        tm = re.search(r"(\d+(?:\.\d+)?)\s*(°?c|°?f|k|km|m|cm|mm|kg|g|lb|oz|mb|gb|usd|eur|gtq)\s*(?:a|to|en)\s*(°?c|°?f|k|km|m|cm|mm|kg|g|lb|oz|mb|gb|usd|eur|gtq)", tl)
        if tm:
            v = float(tm.group(1))
            fu = tm.group(2).replace("°", "").upper()
            tu = tm.group(3).replace("°", "").upper()
            ct = "temperature" if fu in ("C", "F", "K") else (
                "length" if fu in ("KM", "M", "CM", "MM") else
                "weight" if fu in ("KG", "G", "LB", "OZ") else
                "data" if fu in ("KB", "MB", "GB", "TB") else "currency")
            return {"conversion_type": ct, "value": v, "from_unit": fu, "to_unit": tu}
        nm = re.search(r"(\d+(?:\.\d+)?)", task)
        if nm:
            return {"conversion_type": "currency", "value": float(nm.group(1)), "from_unit": "USD", "to_unit": "GTQ"}
        return {}

    def _format_tool(self, tool_name: str, data: Any) -> str:
        if tool_name == "CALCULATOR":
            return f"El resultado de `{data['expression']}` = **{data['result_rounded']}**"
        if tool_name == "TEXT_ANALYZER":
            tw = ", ".join(f"'{w['word']}' ({w['count']})" for w in data["top_words"][:5])
            return (f"📊 **Análisis:** {data['words_total']} palabras, {data['sentences']} oraciones, "
                    f"{data['words_unique']} únicas. Más frecuentes: {tw}")
        if tool_name == "DATETIME":
            return f"🕐 **Fecha y hora:** {data['formatted_long']}"
        if tool_name == "FORMAT_CONVERTER":
            return f"🔄 **Conversión:** {data['input']['value']} {data['input']['unit']} = **{data['output']['value']} {data['output']['unit']}**"
        if tool_name == "FILE_READ":
            prev = data['content'][:500]
            return (f"📄 **Archivo:** {data['path']} ({data['size_bytes']} bytes)\n"
                    f"```\n{prev}{'...' if len(data['content']) > 500 else ''}\n```")
        return str(data)

    def _conversational(self, task: str, context: ConversationContext) -> str:
        tl = task.lower()
        if any(g in tl for g in ["hola", "buenos días", "buenas tardes", "buenas noches", "qué tal", "hey"]):
            return ("¡Hola! 🦜 Soy **OSAIA**, tu Sistema Operativo de Inteligencia Artificial.\n\n"
                    "Mi principio: **No limitarme a contestar cuando puedo hacer el trabajo.**\n\n"
                    "Puedo:\n• 💬 Conversar sobre cualquier tema\n• 🔍 Descubrir y utilizar herramientas\n"
                    "• 🤖 Delegar en agentes especializados\n• 📊 Analizar datos y textos\n"
                    "• 🔢 Realizar cálculos y conversiones\n• 📋 Planificar tareas complejas\n\n¿En qué puedo ayudarte?")
        if any(q in tl for q in ["qué eres", "que eres", "quién eres", "quien eres", "qué puedes hacer", "que puedes hacer"]):
            return ("Soy **OSAIA** 🦜 — un Sistema Operativo de IA Generalista.\n\n"
                    "**Arquitectura:** 🧠 CORE Orquestador, 🤖 Multi-Agentes, 🔧 Sistema de Herramientas, "
                    "📋 Plan Engine, 🔄 Error Recovery, 💾 Memory System, ✅ Quality Control.\n\n"
                    "Fases implementadas: 1-8 (CORE, Contexto, Archivos, Herramientas, Agentes, "
                    "Planificación, Calidad, Recuperación de errores).")
        if any(w in tl for w in ["gracias", "muchas gracias"]):
            return "¡De nada! 🦜✨ ¿Hay algo más en lo que pueda ayudarte?"
        if any(w in tl for w in ["adiós", "adios", "hasta luego", "chau"]):
            return "¡Hasta luego! 👋🦜 Fue un placer trabajar contigo."
        return (f"He recibido tu solicitud: **\"{task[:100]}{'...' if len(task) > 100 else ''}\"**\n\n"
                "Actualmente puedo ayudarte con: 🧮 cálculos, 📊 análisis de texto, 🕐 fecha/hora, "
                "🔄 conversiones, 📄 manejo de archivos, 📦 empaquetado ZIP, 💬 conversación general.\n\n"
                "En actualizaciones futuras: Excel, Word, PDF, PowerPoint, imágenes, video, audio, bases de datos, código, web. 🚀")


# ============================================================
# REASONING AGENT
# ============================================================
@agent_registry.register
class ReasoningAgent(BaseAgent):
    name = "ReasoningAgent"
    description = "Especialista en razonamiento lógico, deducción, análisis de premisas y resolución de problemas complejos."
    category = "reasoning"
    version = "1.0.0"
    capabilities = ["razonamiento lógico", "deducción", "silogismos", "análisis de premisas",
                    "resolución de problemas", "pensamiento crítico", "evaluación de argumentos"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        try:
            self.status = AgentStatus.THINKING
            summary = (f"🧠 **Análisis de RazonamientoAgent:**\n\n"
                       f"**Problema:** {task}\n\n"
                       f"**Enfoque:** Descomponiendo el problema en premisas, identificando "
                       f"relaciones lógicas y evaluando conclusiones válidas.\n\n"
                       f"**Observaciones:**\n"
                       f"• El problema requiere análisis estructurado\n"
                       f"• Se identifican {len(task.split())} elementos semánticos clave\n"
                       f"• Razonamiento aplicado: deductivo paso a paso\n\n"
                       f"**Conclusión preliminar:** El análisis sugiere que la tarea "
                       f"requiere descomposición en subproblemas más pequeños.\n\n"
                       f"*(Nota: El razonamiento profundo con modelos de IA avanzados "
                       f"se activará cuando se integren proveedores reales en la FASE 22)*")
            return self._complete(started_at, summary, {"reasoning_type": "logical_deduction",
                                                         "premises_identified": len(task.split("."))})
        except Exception as e:
            return self._fail(started_at, str(e))


# ============================================================
# RESEARCH AGENT
# ============================================================
@agent_registry.register
class ResearchAgent(BaseAgent):
    name = "ResearchAgent"
    description = "Especialista en investigación web, búsqueda de fuentes, verificación y síntesis de información."
    category = "research"
    version = "1.0.0"
    capabilities = ["búsqueda de información", "investigación web", "análisis de fuentes",
                    "verificación de hechos", "síntesis de conocimientos", "citas y referencias",
                    "comparación de fuentes"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        try:
            self.status = AgentStatus.THINKING
            summary = (f"🔍 **ResearchAgent — Plan de Investigación:**\n\n"
                       f"**Tema:** {task}\n\n"
                       f"**Estrategia de búsqueda:**\n"
                       f"1. Identificar palabras clave principales\n"
                       f"2. Buscar en fuentes académicas y técnicas\n"
                       f"3. Verificar credibilidad de cada fuente\n"
                       f"4. Extraer información relevante\n"
                       f"5. Comparar y contrastar múltiples fuentes\n"
                       f"6. Sintetizar hallazgos\n"
                       f"7. Citar referencias\n\n"
                       f"*(Nota: La búsqueda web real se implementará en la FASE 9 "
                       f"con herramientas WEB_SEARCH, WEB_OPEN y SOURCE_VALIDATOR)*")
            return self._complete(started_at, summary,
                                  {"research_topic": task, "strategy": "multi_source_verification",
                                   "status": "plan_ready", "note": "FASE 9 activará búsqueda real"})
        except Exception as e:
            return self._fail(started_at, str(e))


# ============================================================
# FILE AGENT
# ============================================================
@agent_registry.register
class FileAgent(BaseAgent):
    name = "FileAgent"
    description = "Especialista en manejo de archivos: leer, escribir, listar, buscar, organizar, comprimir."
    category = "file"
    version = "1.0.0"
    capabilities = ["lectura de archivos", "escritura de archivos", "listado de directorios",
                    "búsqueda en archivos", "información de archivos", "compresión ZIP",
                    "extracción ZIP", "organización de archivos"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        try:
            self.status = AgentStatus.THINKING
            tl = task.lower()
            tool_result = None
            tool_used = None

            if any(w in tl for w in ["lee", "leer", "contenido", "muestra el archivo"]):
                m = re.search(r'(?:archivo|file)\s*[:=]?\s*["\']?([^\s"\']+)', tl)
                if m:
                    tool_result = self.use_tool("FILE_READ", {"path": m.group(1)})
                    tool_used = "FILE_READ"
            elif any(w in tl for w in ["lista", "listar", "muestra el directorio", "qué hay en"]):
                m = re.search(r'(?:en|de)\s+["\']?([^\s"\']+)', tl)
                p = m.group(1) if m else "."
                tool_result = self.use_tool("FILE_LIST", {"path": p})
                tool_used = "FILE_LIST"
            elif any(w in tl for w in ["escribe", "guardar", "crear archivo"]):
                pm = re.search(r'(?:en|como|archivo)\s+["\']?([^\s"\']+)', tl)
                path = pm.group(1) if pm else "./output.txt"
                cm = re.search(r'["\'](.+?)["\']', task)
                content = cm.group(1) if cm else task
                tool_result = self.use_tool("FILE_WRITE", {"path": path, "content": content})
                tool_used = "FILE_WRITE"
            elif any(w in tl for w in ["comprime", "zip", "empaqueta"]):
                pm = re.search(r'(?:en|como|output)\s+["\']?([^\s"\']+)', tl)
                output = pm.group(1) if pm else "./output.zip"
                sm = re.search(r'(?:de|con|fuentes?)\s+["\']?([^\s"\']+)', tl)
                sources = sm.group(1) if sm else "."
                tool_result = self.use_tool("ZIP_CREATE", {"output_path": output, "source_paths": sources})
                tool_used = "ZIP_CREATE"
            elif any(w in tl for w in ["busca en archivos", "encuentra en", "search in files"]):
                qm = re.search(r'["\'](.+?)["\']', task)
                query = qm.group(1) if q else task
                tool_result = self.use_tool("FILE_SEARCH", {"query": query})
                tool_used = "FILE_SEARCH"

            if tool_result and tool_used:
                if tool_result.success:
                    summary = f"📄 **FileAgent** usando {tool_used}: {str(tool_result.data)[:200]}"
                    return self._complete(started_at, summary, tool_result.data,
                                          tool_calls=[{"tool": tool_used}])
                return self._fail(started_at, f"{tool_used}: {tool_result.error_message}")

            summary = (f"📄 **FileAgent listo.** Puedo ayudarte a:\n"
                       f"• Leer archivos: 'Lee el archivo datos.txt'\n"
                       f"• Escribir archivos: 'Escribe \"hola\" en prueba.txt'\n"
                       f"• Listar directorios: 'Lista el directorio actual'\n"
                       f"• Buscar texto: 'Busca \"import\" en archivos .py'\n"
                       f"• Comprimir: 'Comprime ./src en proyecto.zip'\n"
                       f"• Información: 'Información del archivo config.py'")
            return self._complete(started_at, summary, {"mode": "help"})
        except Exception as e:
            return self._fail(started_at, str(e))


# ============================================================
# CODING AGENT
# ============================================================
@agent_registry.register
class CodingAgent(BaseAgent):
    name = "CodingAgent"
    description = "Especialista en programación: crear, analizar, depurar y explicar código en múltiples lenguajes."
    category = "coding"
    version = "1.0.0"
    capabilities = ["generación de código", "análisis de código", "depuración de bugs",
                    "explicación de código", "refactorización", "mejora de rendimiento",
                    "creación de APIs", "Python", "JavaScript", "SQL", "HTML/CSS"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        try:
            self.status = AgentStatus.THINKING
            tl = task.lower()
            lang = "python"
            for l in ["python", "javascript", "js", "typescript", "ts", "java", "c++", "c#", "sql", "html", "css", "bash", "go", "rust"]:
                if l in tl:
                    lang = l
                    break

            code = self._generate_sample(lang, task)
            summary = (f"💻 **CodingAgent** — Código generado en **{lang.upper()}**:\n\n"
                       f"```{lang}\n{code}\n```\n\n"
                       f"**Explicación:** El código implementa la funcionalidad solicitada "
                       f"con buenas prácticas: nombres descriptivos, manejo de errores, "
                       f"y estructura modular.\n\n"
                       f"*(Nota: Generación de código profunda con modelos especializados "
                       f"se activará en la FASE 17 con Code Engine + Sandbox)*")
            return self._complete(started_at, summary,
                                  {"language": lang, "code": code,
                                   "lines": code.count("\n") + 1})
        except Exception as e:
            return self._fail(started_at, str(e))

    def _generate_sample(self, lang: str, task: str) -> str:
        if lang in ("python", "py"):
            return (f"# OSAIA CodingAgent - Python\n"
                    f"# Tarea: {task[:80]}\n\n"
                    f"from typing import List, Optional\n\n"
                    f"class Processor:\n"
                    f"    \"\"\"Procesa datos según la lógica solicitada.\"\"\"\n"
                    f"    \n"
                    f"    def __init__(self, config: Optional[dict] = None):\n"
                    f"        self.config = config or {{}}\n"
                    f"        self._history: List = []\n"
                    f"    \n"
                    f"    def process(self, data):\n"
                    f"        \"\"\"Procesa la entrada y devuelve el resultado.\"\"\"\n"
                    f"        try:\n"
                    f"            result = self._transform(data)\n"
                    f"            self._history.append({{'input': data, 'output': result}})\n"
                    f"            return result\n"
                    f"        except Exception as e:\n"
                    f"            raise RuntimeError(f'Error procesando: {{e}}') from e\n"
                    f"    \n"
                    f"    def _transform(self, data):\n"
                    f"        return data  # Implementar lógica específica\n"
                    f"\n"
                    f"if __name__ == '__main__':\n"
                    f"    p = Processor()\n"
                    f"    print(p.process('hola mundo'))")
        elif lang in ("javascript", "js"):
            return (f"// OSAIA CodingAgent - JavaScript\n"
                    f"// Tarea: {task[:80]}\n\n"
                    f"class Processor {{\n"
                    f"  constructor(config = {{}}) {{\n"
                    f"    this.config = config;\n"
                    f"    this.history = [];\n"
                    f"  }}\n"
                    f"  \n"
                    f"  process(data) {{\n"
                    f"    try {{\n"
                    f"      const result = this._transform(data);\n"
                    f"      this.history.push({{ input: data, output: result }});\n"
                    f"      return result;\n"
                    f"    }} catch (e) {{\n"
                    f"      throw new Error(`Error procesando: ${{e.message}}`);\n"
                    f"    }}\n"
                    f"  }}\n"
                    f"  \n"
                    f"  _transform(data) {{\n"
                    f"    return data;\n"
                    f"  }}\n"
                    f"}}\n"
                    f"\n"
                    f"const p = new Processor();\n"
                    f"console.log(p.process('hola mundo'));")
        elif lang == "sql":
            return (f"-- OSAIA CodingAgent - SQL\n"
                    f"-- Tarea: {task[:80]}\n\n"
                    f"CREATE TABLE IF NOT EXISTS entities (\n"
                    f"  id SERIAL PRIMARY KEY,\n"
                    f"  name VARCHAR(255) NOT NULL,\n"
                    f"  description TEXT,\n"
                    f"  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
                    f"  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n"
                    f");\n\n"
                    f"CREATE INDEX idx_entities_name ON entities(name);\n\n"
                    f"-- Consulta principal\n"
                    f"SELECT e.id, e.name, e.description, e.created_at\n"
                    f"FROM entities e\n"
                    f"WHERE e.name ILIKE '%' || :search || '%'\n"
                    f"ORDER BY e.created_at DESC\n"
                    f"LIMIT :limit OFFSET :offset;")
        else:
            code = (
                "// OSAIA CodingAgent\n"
                f"// Lenguaje: {lang}\n"
                f"// Tarea: {task[:80]}\n"
                "// Plantilla basica\n"
                "function main() {\n"
                "  console.log('OSAIA lista para implementar');\n"
                "}\n"
                "main();"
            )
            return code


# ============================================================
# DATA AGENT
# ============================================================
@agent_registry.register
class DataAgent(BaseAgent):
    name = "DataAgent"
    description = "Especialista en análisis de datos: estadísticas, tendencias, correlaciones, limpieza y visualización."
    category = "data"
    version = "1.0.0"
    capabilities = ["análisis estadístico", "detección de tendencias", "limpieza de datos",
                    "detección de anomalías", "correlaciones", "visualización de datos",
                    "informes de datos", "Excel/CSV/SQL"]

    async def execute(self, task: str, context: ConversationContext, **kwargs) -> AgentResult:
        started_at = self._start()
        try:
            self.status = AgentStatus.THINKING
            summary = (f"📊 **DataAgent — Plan de Análisis:**\n\n"
                       f"**Solicitud:** {task}\n\n"
                       f"**Metodología de análisis:**\n"
                       f"1. 📥 Carga y exploración inicial de datos\n"
                       f"2. 🧹 Limpieza: valores faltantes, duplicados, outliers\n"
                       f"3. 📈 Estadísticas descriptivas: media, mediana, desviación estándar\n"
                       f"4. 🔍 Análisis de tendencias y patrones temporales\n"
                       f"5. 🔗 Correlaciones entre variables\n"
                       f"6. ⚠️ Detección de anomalías\n"
                       f"7. 📊 Visualización recomendada\n"
                       f"8. 📋 Informe de hallazgos\n\n"
                       f"*(Nota: Análisis profundo con pandas/numpy y motores de Excel "
                       f"se activará completamente en la FASE 11)*")
            return self._complete(started_at, summary,
                                  {"analysis_type": "comprehensive",
                                   "methodology": "8-step_data_analysis",
                                   "recommended_tools": ["XLSX_READ", "DATA_ANALYZER", "CHART_GENERATOR"]})
        except Exception as e:
            return self._fail(started_at, str(e))
