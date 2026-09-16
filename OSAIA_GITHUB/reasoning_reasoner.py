"""
OSAIA - Razonador
Interpreta solicitudes, detecta intención y entidades.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("reasoner")


class IntentType(str, Enum):
    SALUDO = "saludo"
    DESPEDIDA = "despedida"
    AGRADECIMIENTO = "agradecimiento"
    PREGUNTA_INFORMACION = "pregunta_informacion"
    PREGUNTA_OSAIA = "pregunta_osaia"
    CALCULO = "calculo"
    ANALISIS_TEXTO = "analisis_texto"
    CONSULTA_FECHA = "consulta_fecha"
    CONVERSION = "conversion"
    SOLICITUD_ARCHIVO = "solicitud_archivo"
    SOLICITUD_CODIGO = "solicitud_codigo"
    SOLICITUD_IMAGEN = "solicitud_imagen"
    SOLICITUD_TAREA_COMPLEJA = "solicitud_tarea_compleja"
    PETICION_CLARIFICACION = "peticion_aclaracion"
    GENERAL = "general"


@dataclass
class IntentExtraction:
    intent: IntentType
    confidence: float
    entities: Dict[str, Any] = field(default_factory=dict)
    keywords: List[str] = field(default_factory=list)
    requires_clarification: bool = False
    clarification_question: Optional[str] = None
    raw_input: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {"intent": self.intent.value, "confidence": round(self.confidence, 3),
                "entities": self.entities, "keywords": self.keywords,
                "requires_clarification": self.requires_clarification,
                "clarification_question": self.clarification_question}


class Reasoner:
    _PATTERNS = {
        IntentType.SALUDO: [r"\bhola\b", r"\bbuen(os|as)\s+(días|tardes|noches)\b", r"\bqué\s+tal\b", r"\bhey\b", r"\bsaludos\b"],
        IntentType.DESPEDIDA: [r"\badiós\b", r"\badios\b", r"\bhasta\s+luego\b", r"\bnos\s+vemos\b", r"\bchau\b"],
        IntentType.AGRADECIMIENTO: [r"\bgracias\b", r"\bmuchas\s+gracias\b", r"\bte\s+agradezco\b"],
        IntentType.PREGUNTA_OSAIA: [r"\bqué\s+eres\b", r"\bque\s+eres\b", r"\bquién\s+eres\b", r"\bqué\s+puedes\s+hacer\b", r"\bpara\s+qué\s+sirves\b"],
        IntentType.CALCULO: [r"\bcalcula\b", r"\bcuánto\s+es\b", r"\bcuanto\s+es\b", r"\bresuelve\b", r"\braíz\b", r"\bpotencia\b", r"\bseno\b", r"\bcoseno\b", r"\blogaritmo\b", r"^\s*\d+\s*[+\-*/^]\s*\d+"],
        IntentType.ANALISIS_TEXTO: [r"\banaliza\s+(este\s+)?texto\b", r"\bcuenta\s+palabras\b", r"\bestadísticas?\s+del?\s+texto\b", r"\bfrecuencia\s+de\s+palabras\b"],
        IntentType.CONSULTA_FECHA: [r"\bqué\s+hora\b", r"\bque\s+hora\b", r"\bqué\s+día\b", r"\bque\s+día\b", r"\bfecha\s+actual\b", r"\bdía\s+de\s+la\s+semana\b"],
        IntentType.CONVERSION: [r"\bconvierte\b", r"\bconversión\b", r"\bconversion\b", r"\ba\s+(grados|metros|kilómetros|libras|dólares|quetzales)\b", r"\bcambio\s+de\b"],
        IntentType.SOLICITUD_CODIGO: [r"\bcódigo\b", r"\bcodigo\b", r"\bprograma\b", r"\bescribe\s+un\s+(script|programa|código|codigo|función)\b", r"\bapi\b", r"\bfunción\b"],
        IntentType.SOLICITUD_IMAGEN: [r"\bimagen\b", r"\bdibuja\b", r"\bgenera\s+una\s+imagen\b", r"\bfoto\b", r"\bilustración\b"],
        IntentType.SOLICITUD_ARCHIVO: [r"\bexcel\b", r"\bword\b", r"\bdocx?\b", r"\bxlsx?\b", r"\bpdf\b", r"\bzip\b", r"\barchivo\b", r"\bdocumento\b", r"\binforme\b", r"\breporte\b"],
        IntentType.SOLICITUD_TAREA_COMPLEJA: [r"\bcrea\s+un\s+sistema\b", r"\bdesarrolla\b", r"\bproyecto\s+completo\b", r"\bautomatiza\b", r"\bpipeline\b", r"\bflujo\s+completo\b", r"\bde\s+principio\s+a\s+fin\b"],
    }

    def analyze(self, user_input: str) -> IntentExtraction:
        input_lower = user_input.lower().strip()
        logger.debug(f"🔍 Razonando: '{input_lower[:80]}...'")

        if not input_lower:
            return IntentExtraction(intent=IntentType.GENERAL, confidence=0.0, raw_input=user_input,
                                    requires_clarification=True,
                                    clarification_question="Por favor, escribe tu solicitud.")

        scores: Dict[IntentType, float] = {}
        all_keywords: List[str] = []

        for intent, patterns in self._PATTERNS.items():
            score = 0.0
            matched = []
            for pattern in patterns:
                matches = re.findall(pattern, input_lower)
                if matches:
                    score += len(matches) * 0.2
                    for m in matches:
                        if isinstance(m, str) and m.strip():
                            matched.append(m.strip())
            if score > 0:
                scores[intent] = min(score, 1.0)
                all_keywords.extend(matched)

        if scores:
            sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            top_intent, top_conf = sorted_intents[0]
            if len(sorted_intents) > 1:
                second_conf = sorted_intents[1][1]
                if top_conf - second_conf < 0.1:
                    return IntentExtraction(intent=top_intent, confidence=top_conf,
                                            keywords=list(set(all_keywords)), raw_input=user_input,
                                            requires_clarification=True,
                                            clarification_question="Para asegurarme de entender bien, ¿podrías especificar un poco más?")
            entities = self._extract_entities(input_lower, top_intent)
            logger.debug(f"🎯 Intención: {top_intent.value} (conf: {top_conf:.2f})")
            return IntentExtraction(intent=top_intent, confidence=top_conf,
                                    entities=entities, keywords=list(set(all_keywords)),
                                    raw_input=user_input)

        return IntentExtraction(intent=IntentType.GENERAL, confidence=0.3, raw_input=user_input)

    def _extract_entities(self, input_lower: str, intent: IntentType) -> Dict[str, Any]:
        entities: Dict[str, Any] = {}
        numbers = re.findall(r"\b\d+(?:\.\d+)?\b", input_lower)
        if numbers:
            entities["numbers"] = [float(n) if "." in n else int(n) for n in numbers]
        if intent == IntentType.CONVERSION:
            units = re.findall(r"\b(km|kilómetros|m|metros|cm|mm|kg|g|lb|oz|°c|°f|k|usd|eur|gtq|mxn|cop|kb|mb|gb|tb)\b", input_lower)
            if units:
                entities["units"] = units
        if intent == IntentType.SOLICITUD_ARCHIVO:
            ftypes = []
            for ft in ["excel", "xlsx", "word", "docx", "pdf", "zip", "csv", "json"]:
                if ft in input_lower:
                    ftypes.append(ft)
            if ftypes:
                entities["file_types"] = ftypes
        return entities

    def needs_more_info(self, extraction: IntentExtraction) -> bool:
        return extraction.requires_clarification or extraction.confidence < 0.15


reasoner = Reasoner()
