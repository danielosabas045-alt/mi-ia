"""
OSAIA - Herramientas Básicas
CALCULATOR, ECHO, TEXT_ANALYZER, DATETIME, FORMAT_CONVERTER
"""
from __future__ import annotations
import math
import re
from collections import Counter
from datetime import datetime, timezone
from typing import Any, List
from tools_base import BaseTool, ToolParameter
from tools_registry import tool_registry


@tool_registry.register
class CalculatorTool(BaseTool):
    name = "CALCULATOR"
    description = "Calculadora matemática segura: operaciones básicas, potencias, raíces, trigonometría, logaritmos, porcentajes."
    category = "data"
    version = "1.0.0"
    timeout_seconds = 5.0
    _SAFE = {"abs": abs, "round": round, "min": min, "max": max,
             "sqrt": math.sqrt, "pow": math.pow,
             "sin": math.sin, "cos": math.cos, "tan": math.tan,
             "log": math.log, "log10": math.log10, "exp": math.exp,
             "pi": math.pi, "e": math.e, "floor": math.floor, "ceil": math.ceil}

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="expression", description="Expresión matemática. Ej: '2 + 3 * 4', 'sqrt(144)', 'sin(pi/2)'", param_type=str)]

    def _execute(self, params: dict) -> Any:
        expr = params["expression"]
        if not re.match(r"^[0-9+\-*/().,\s\w%^]+$", expr):
            raise ValueError(f"Caracteres no permitidos en: {expr}")
        expr = expr.replace("^", "**")
        expr = re.sub(r"(\d+(?:\.\d+)?)%", r"(\1/100)", expr)
        try:
            r = eval(expr, {"__builtins__": {}}, self._SAFE)
            return {"expression": params["expression"], "result": r,
                    "result_rounded": round(float(r), 10) if isinstance(r, (int, float)) else r}
        except Exception as e:
            raise ValueError(f"Error al evaluar: {e}") from e


@tool_registry.register
class EchoTool(BaseTool):
    name = "ECHO"
    description = "Devuelve el texto de entrada. Útil para pruebas y debugging."
    category = "utility"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="text", description="Texto a devolver", param_type=str),
                ToolParameter(name="uppercase", description="Convertir a mayúsculas", param_type=bool, required=False, default=False)]

    def _execute(self, params: dict) -> Any:
        t = params["text"]
        if params.get("uppercase"):
            t = t.upper()
        return {"echo": t, "length": len(t), "words": len(t.split())}


@tool_registry.register
class TextAnalyzerTool(BaseTool):
    name = "TEXT_ANALYZER"
    description = "Analiza estadísticas de un texto: caracteres, palabras, oraciones, frecuencia."
    category = "text"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="text", description="Texto a analizar", param_type=str),
                ToolParameter(name="top_n", description="Palabras más frecuentes a devolver", param_type=int, required=False, default=10, min_value=1, max_value=100)]

    def _execute(self, params: dict) -> Any:
        text = params["text"]
        top_n = params["top_n"]
        words = re.findall(r"[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9]+", text.lower())
        sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
        stop = {"el", "la", "los", "las", "de", "del", "y", "e", "o", "a", "al", "en",
                "un", "una", "es", "son", "por", "con", "para", "que", "qué", "como",
                "the", "a", "an", "of", "and", "or", "in", "on", "to", "for", "is", "are"}
        content = [w for w in words if w not in stop and len(w) > 1]
        freq = Counter(content).most_common(top_n)
        return {"characters": len(text), "characters_no_spaces": len(text.replace(" ", "")),
                "words_total": len(words), "words_unique": len(set(words)),
                "content_words": len(content), "sentences": len(sentences),
                "paragraphs": len([p for p in text.split("\n\n") if p.strip()]),
                "avg_word_length": round(sum(len(w) for w in words) / len(words), 2) if words else 0,
                "avg_sentence_length": round(len(words) / len(sentences), 2) if sentences else 0,
                "top_words": [{"word": w, "count": c} for w, c in freq]}


@tool_registry.register
class DateTimeTool(BaseTool):
    name = "DATETIME"
    description = "Devuelve fecha y hora actual en varios formatos."
    category = "utility"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="timezone", description="Zona horaria", param_type=str, required=False, default="UTC")]

    def _execute(self, params: dict) -> Any:
        now = datetime.now(timezone.utc)
        dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                 "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        return {"iso_utc": now.isoformat(), "date_iso": now.strftime("%Y-%m-%d"),
                "time_iso": now.strftime("%H:%M:%S"), "timestamp_unix": int(now.timestamp()),
                "year": now.year, "month": now.month, "month_name": meses[now.month - 1],
                "day": now.day, "weekday": dias[now.weekday()],
                "hour": now.hour, "minute": now.minute, "second": now.second,
                "formatted_long": f"{dias[now.weekday()]}, {now.day} de {meses[now.month - 1]} de {now.year} {now.hour:02d}:{now.minute:02d}:{now.second:02d} UTC"}


@tool_registry.register
class FormatConverterTool(BaseTool):
    name = "FORMAT_CONVERTER"
    description = "Convierte unidades: temperatura, longitud, peso, datos, moneda (tasas de referencia)."
    category = "data"
    version = "1.0.0"
    _RATES = {"USD": 1.0, "EUR": 0.92, "GTQ": 7.8, "MXN": 17.2, "COP": 3900, "ARS": 950, "CLP": 880, "PEN": 3.7}

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="conversion_type", description="Tipo de conversión", param_type=str,
                              options=["temperature", "length", "weight", "data", "currency"]),
                ToolParameter(name="value", description="Valor numérico", param_type=float),
                ToolParameter(name="from_unit", description="Unidad origen", param_type=str),
                ToolParameter(name="to_unit", description="Unidad destino", param_type=str)]

    def _execute(self, params: dict) -> Any:
        ct = params["conversion_type"]
        v = float(params["value"])
        fu = params["from_unit"].upper()
        tu = params["to_unit"].upper()
        result = None
        formula = ""

        if ct == "temperature":
            if fu == "C" and tu == "F":
                result = v * 9 / 5 + 32; formula = "°F = °C × 9/5 + 32"
            elif fu == "F" and tu == "C":
                result = (v - 32) * 5 / 9; formula = "°C = (°F - 32) × 5/9"
            elif fu == "C" and tu == "K":
                result = v + 273.15; formula = "K = °C + 273.15"
            elif fu == "K" and tu == "C":
                result = v - 273.15; formula = "°C = K - 273.15"
            else:
                raise ValueError(f"Conversión no soportada: {fu} → {tu}")
        elif ct == "length":
            tm = {"M": 1, "KM": 1000, "CM": 0.01, "MM": 0.001, "MI": 1609.34, "FT": 0.3048, "IN": 0.0254}
            if fu not in tm or tu not in tm:
                raise ValueError(f"Unidades soportadas: {list(tm.keys())}")
            result = v * tm[fu] / tm[tu]
        elif ct == "weight":
            tk = {"KG": 1, "G": 0.001, "LB": 0.453592, "OZ": 0.0283495}
            if fu not in tk or tu not in tk:
                raise ValueError(f"Unidades soportadas: {list(tk.keys())}")
            result = v * tk[fu] / tk[tu]
        elif ct == "data":
            tb = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3, "TB": 1024**4}
            if fu not in tb or tu not in tb:
                raise ValueError(f"Unidades soportadas: {list(tb.keys())}")
            result = v * tb[fu] / tb[tu]
        elif ct == "currency":
            if fu not in self._RATES or tu not in self._RATES:
                raise ValueError(f"Monedas soportadas: {list(self._RATES.keys())}")
            usd = v / self._RATES[fu]
            result = usd * self._RATES[tu]
            formula = f"({v} {fu} / {self._RATES[fu]}) × {self._RATES[tu]}"
        else:
            raise ValueError(f"Tipo desconocido: {ct}")

        return {"conversion_type": ct,
                "input": {"value": v, "unit": fu},
                "output": {"value": round(result, 6), "unit": tu},
                "formula": formula,
                "note": "Tasas de cambio de referencia" if ct == "currency" else None}
