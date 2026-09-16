"""
OSAIA - Quality Control Engine
Verifica resultados antes de entregar al usuario.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("quality_engine")


class QualityIssueSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class QualityIssue:
    severity: QualityIssueSeverity
    message: str
    field: Optional[str] = None
    suggestion: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {"severity": self.severity.value, "message": self.message,
                "field": self.field, "suggestion": self.suggestion}


@dataclass
class QualityReport:
    passed: bool
    score: float
    issues: List[QualityIssue] = field(default_factory=list)
    checks_performed: List[str] = field(default_factory=list)
    summary: str = ""

    @property
    def errors(self) -> List[QualityIssue]:
        return [i for i in self.issues if i.severity in (QualityIssueSeverity.ERROR, QualityIssueSeverity.CRITICAL)]

    @property
    def warnings(self) -> List[QualityIssue]:
        return [i for i in self.issues if i.severity == QualityIssueSeverity.WARNING]

    def to_dict(self) -> Dict[str, Any]:
        return {"passed": self.passed, "score": round(self.score, 2), "summary": self.summary,
                "checks_performed": self.checks_performed,
                "errors_count": len(self.errors), "warnings_count": len(self.warnings),
                "issues": [i.to_dict() for i in self.issues]}


class QualityEngine:
    def verify_text(self, text: str) -> QualityReport:
        issues: List[QualityIssue] = []
        checks: List[str] = ["non_empty"]

        if not text or not text.strip():
            issues.append(QualityIssue(QualityIssueSeverity.CRITICAL, "Respuesta vacía",
                                       suggestion="Generar contenido real antes de entregar"))
            return QualityReport(passed=False, score=0.0, issues=issues,
                                 checks_performed=checks, summary="Respuesta vacía")

        checks.append("minimum_length")
        if len(text.strip()) < 10:
            issues.append(QualityIssue(QualityIssueSeverity.WARNING, "Respuesta muy corta",
                                       field="length", suggestion="Ampliar la explicación"))

        checks.append("no_placeholders")
        placeholders = ["TODO", "FIXME", "PLACEHOLDER", "[INSERTAR", "[PENDIENTE", "XXX"]
        for ph in placeholders:
            if ph in text.upper():
                issues.append(QualityIssue(QualityIssueSeverity.ERROR,
                                           f"Contiene marcador pendiente: '{ph}'",
                                           suggestion="Completar antes de entregar"))

        checks.append("real_content")
        if text.strip().startswith("```") and text.strip().endswith("```") and len(text.strip()) < 20:
            issues.append(QualityIssue(QualityIssueSeverity.WARNING,
                                       "Parece solo formato sin contenido real"))

        score = self._calc_score(issues)
        return QualityReport(
            passed=len(self._filter_errors(issues)) == 0,
            score=score, issues=issues, checks_performed=checks,
            summary=self._gen_summary(issues, score))

    def verify_tool(self, tool_name: str, data: Any) -> QualityReport:
        issues: List[QualityIssue] = []
        checks = ["tool_executed"]
        if data is None:
            issues.append(QualityIssue(QualityIssueSeverity.ERROR, f"{tool_name} devolvió datos nulos"))
            return QualityReport(passed=False, score=0.0, issues=issues, checks_performed=checks)
        checks.append("data_not_empty")
        if isinstance(data, dict) and not data:
            issues.append(QualityIssue(QualityIssueSeverity.WARNING, "Datos vacíos"))
        score = self._calc_score(issues)
        return QualityReport(passed=len(self._filter_errors(issues)) == 0,
                             score=score, issues=issues, checks_performed=checks,
                             summary=f"Resultado de {tool_name} verificado")

    def verify_file(self, file_path: str) -> QualityReport:
        from pathlib import Path
        issues: List[QualityIssue] = []
        checks = ["path_exists"]
        p = Path(file_path)
        if not p.exists():
            issues.append(QualityIssue(QualityIssueSeverity.CRITICAL, f"Archivo no existe: {file_path}"))
            return QualityReport(passed=False, score=0.0, issues=issues, checks_performed=checks)
        checks.append("is_file")
        if not p.is_file():
            issues.append(QualityIssue(QualityIssueSeverity.ERROR, "No es un archivo regular"))
        checks.append("not_empty")
        if p.stat().st_size == 0:
            issues.append(QualityIssue(QualityIssueSeverity.WARNING, "Archivo está vacío"))
        score = self._calc_score(issues)
        return QualityReport(passed=len(self._filter_errors(issues)) == 0,
                             score=score, issues=issues, checks_performed=checks,
                             summary=f"Archivo verificado: {file_path}")

    def verify_code(self, code: str, language: str = "python") -> QualityReport:
        issues: List[QualityIssue] = []
        checks = ["non_empty", "syntax_basic"]
        if not code or not code.strip():
            issues.append(QualityIssue(QualityIssueSeverity.CRITICAL, "Código vacío"))
            return QualityReport(passed=False, score=0.0, issues=issues, checks_performed=checks)
        if "TODO" in code or "FIXME" in code:
            issues.append(QualityIssue(QualityIssueSeverity.WARNING, "Contiene TODO/FIXME"))
        if language == "python":
            if "def " not in code and "class " not in code and len(code.splitlines()) > 5:
                issues.append(QualityIssue(QualityIssueSeverity.INFO,
                                           "Código podría beneficiarse de funciones/clases"))
        score = self._calc_score(issues)
        return QualityReport(passed=len(self._filter_errors(issues)) == 0,
                             score=score, issues=issues, checks_performed=checks,
                             summary=f"Código {language} verificado")

    def _filter_errors(self, issues: List[QualityIssue]) -> List[QualityIssue]:
        return [i for i in issues if i.severity in (QualityIssueSeverity.ERROR, QualityIssueSeverity.CRITICAL)]

    def _calc_score(self, issues: List[QualityIssue]) -> float:
        if not issues:
            return 1.0
        penalty = 0.0
        for i in issues:
            if i.severity == QualityIssueSeverity.CRITICAL:
                penalty += 0.5
            elif i.severity == QualityIssueSeverity.ERROR:
                penalty += 0.25
            elif i.severity == QualityIssueSeverity.WARNING:
                penalty += 0.08
            else:
                penalty += 0.02
        return max(0.0, min(1.0, 1.0 - penalty))

    def _gen_summary(self, issues: List[QualityIssue], score: float) -> str:
        if not issues:
            return "✅ Todas las verificaciones pasaron"
        errors = len(self._filter_errors(issues))
        warnings = len([i for i in issues if i.severity == QualityIssueSeverity.WARNING])
        parts = []
        if errors:
            parts.append(f"❌ {errors} error(es)")
        if warnings:
            parts.append(f"⚠️ {warnings} advertencia(s)")
        parts.append(f"Puntaje: {score:.0%}")
        return " | ".join(parts)


quality_engine = QualityEngine()


# ============================================================
# REVIEWER
# ============================================================
class Reviewer:
    def __init__(self) -> None:
        self.logger = get_logger("reviewer")

    def review(self, result_summary: str, original_request: str,
               issues: Optional[List[str]] = None):
        self.logger.debug(f"👀 Revisando: '{original_request[:60]}...'")
        correcciones: List[str] = []

        if not result_summary or not result_summary.strip():
            correcciones.append("Resultado vacío — debe regenerarse")
            return False, "❌ No aprobado", correcciones

        if len(result_summary.strip()) < 15:
            correcciones.append("Respuesta muy corta")

        request_kws = set(original_request.lower().split())
        result_lower = result_summary.lower()
        matched = sum(1 for kw in request_kws if len(kw) > 3 and kw in result_lower)
        if matched == 0 and len(request_kws) > 3:
            correcciones.append("El resultado parece no abordar la solicitud directamente")

        if any(p in result_lower for p in ["no pude", "no puedo", "error al", "falló"]):
            correcciones.append("El resultado indica fallos — considerar recuperación")

        if issues:
            correcciones.extend(issues)

        graves = any("vacío" in c or "debe regenerarse" in c or "no abordar" in c for c in correcciones)
        if graves:
            return False, "❌ No aprobado — requiere re-ejecución", correcciones
        if correcciones:
            return True, f"⚠️ Aprobado con observaciones ({len(correcciones)})", correcciones
        return True, "✅ Aprobado — cumple criterios de calidad", correcciones


reviewer = Reviewer()
