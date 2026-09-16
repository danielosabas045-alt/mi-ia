"""
OSAIA - Herramientas de Archivos (FASE 3)
FILE_READ, FILE_WRITE, FILE_LIST, FILE_DELETE, FILE_SEARCH, FILE_INFO
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any, List
from config_settings import settings
from tools_base import BaseTool, ToolParameter
from tools_registry import tool_registry


def _resolve_path(path_str: str) -> Path:
    """Resuelve una ruta, asegurando que esté dentro de los directorios permitidos."""
    p = Path(path_str).expanduser().resolve()
    base = Path(".").resolve()
    allowed = [base, settings.UPLOADS_PATH.resolve(), settings.OUTPUTS_PATH.resolve(),
               settings.PROJECTS_PATH.resolve(), settings.TEMP_PATH.resolve()]
    if not any(str(p).startswith(str(a)) for a in allowed):
        raise PermissionError(f"Ruta fuera de directorios permitidos: {path_str}")
    return p


@tool_registry.register
class FileReadTool(BaseTool):
    name = "FILE_READ"
    description = "Lee el contenido de un archivo de texto (TXT, MD, CSV, JSON, PY, HTML, etc.)."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="path", description="Ruta del archivo", param_type=str),
                ToolParameter(name="encoding", description="Codificación", param_type=str, required=False, default="utf-8"),
                ToolParameter(name="max_lines", description="Máximo de líneas a leer", param_type=int, required=False, default=0, min_value=0)]

    def _execute(self, params: dict) -> Any:
        p = _resolve_path(params["path"])
        if not p.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {p}")
        if not p.is_file():
            raise ValueError(f"No es un archivo: {p}")

        ext = p.suffix.lower()
        content = p.read_text(encoding=params.get("encoding", "utf-8"))
        max_lines = params.get("max_lines", 0)

        if max_lines and max_lines > 0:
            lines = content.splitlines()
            content = "\n".join(lines[:max_lines])
            truncated = len(lines) > max_lines
        else:
            truncated = False

        parsed = None
        if ext == ".json":
            try:
                parsed = json.loads(content)
            except Exception:
                pass

        return {"path": str(p), "size_bytes": p.stat().st_size,
                "extension": ext, "content": content,
                "lines_count": content.count("\n") + 1 if content else 0,
                "truncated": truncated, "parsed_json": parsed}


@tool_registry.register
class FileWriteTool(BaseTool):
    name = "FILE_WRITE"
    description = "Escribe contenido en un archivo de texto."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="path", description="Ruta del archivo", param_type=str),
                ToolParameter(name="content", description="Contenido a escribir", param_type=str),
                ToolParameter(name="mode", description="Modo: write o append", param_type=str, required=False, default="write", options=["write", "append"]),
                ToolParameter(name="encoding", description="Codificación", param_type=str, required=False, default="utf-8")]

    def _execute(self, params: dict) -> Any:
        p = _resolve_path(params["path"])
        p.parent.mkdir(parents=True, exist_ok=True)
        mode = "a" if params.get("mode") == "append" else "w"
        p.write_text(params["content"], encoding=params.get("encoding", "utf-8"))
        return {"path": str(p), "size_bytes": p.stat().st_size,
                "mode": mode, "created": not p.exists() or mode == "w",
                "absolute_path": str(p.resolve())}


@tool_registry.register
class FileListTool(BaseTool):
    name = "FILE_LIST"
    description = "Lista archivos y carpetas en un directorio."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="path", description="Ruta del directorio", param_type=str, required=False, default="."),
                ToolParameter(name="recursive", description="Listar recursivamente", param_type=bool, required=False, default=False),
                ToolParameter(name="pattern", description="Filtrar por patrón (ej: *.py)", param_type=str, required=False)]

    def _execute(self, params: dict) -> Any:
        p = _resolve_path(params.get("path", "."))
        if not p.exists() or not p.is_dir():
            raise NotADirectoryError(f"Directorio no válido: {p}")

        recursive = params.get("recursive", False)
        pattern = params.get("pattern")
        entries = []

        if recursive:
            items = p.rglob(pattern or "*")
        else:
            items = p.glob(pattern or "*")

        for item in sorted(items):
            if item.is_file():
                entries.append({"name": item.name, "path": str(item.relative_to(p)),
                                "type": "file", "size_bytes": item.stat().st_size,
                                "extension": item.suffix.lower()})
            elif item.is_dir():
                entries.append({"name": item.name, "path": str(item.relative_to(p)),
                                "type": "directory"})

        return {"path": str(p), "total": len(entries),
                "files": sum(1 for e in entries if e["type"] == "file"),
                "directories": sum(1 for e in entries if e["type"] == "directory"),
                "entries": entries}


@tool_registry.register
class FileDeleteTool(BaseTool):
    name = "FILE_DELETE"
    description = "Elimina un archivo. Operación destructiva — requiere confirmación."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="path", description="Ruta del archivo a eliminar", param_type=str),
                ToolParameter(name="confirm", description="Confirmación explícita", param_type=bool, required=True)]

    def _execute(self, params: dict) -> Any:
        if not params.get("confirm"):
            raise PermissionError("Se requiere confirmación explícita para eliminar")
        p = _resolve_path(params["path"])
        if not p.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {p}")
        if p.is_dir():
            raise ValueError("Use herramienta específica para eliminar carpetas")
        size = p.stat().st_size
        p.unlink()
        return {"path": str(p), "deleted": True, "size_bytes_deleted": size}


@tool_registry.register
class FileSearchTool(BaseTool):
    name = "FILE_SEARCH"
    description = "Busca texto dentro de archivos de un directorio."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="query", description="Texto a buscar", param_type=str),
                ToolParameter(name="path", description="Directorio base", param_type=str, required=False, default="."),
                ToolParameter(name="extensions", description="Extensiones a incluir (ej: py,txt,md)", param_type=str, required=False),
                ToolParameter(name="case_sensitive", description="Distinguir mayúsculas", param_type=bool, required=False, default=False)]

    def _execute(self, params: dict) -> Any:
        p = _resolve_path(params.get("path", "."))
        query = params["query"]
        exts = [e.strip().lower() for e in params.get("extensions", "").split(",") if e.strip()] if params.get("extensions") else None
        case = params.get("case_sensitive", False)
        q = query if case else query.lower()

        matches = []
        for f in p.rglob("*"):
            if not f.is_file():
                continue
            if exts and f.suffix.lower() not in exts:
                continue
            try:
                content = f.read_text(encoding="utf-8", errors="ignore")
                search_content = content if case else content.lower()
                if q in search_content:
                    line_no = None
                    for i, line in enumerate(content.splitlines(), 1):
                        sl = line if case else line.lower()
                        if q in sl:
                            line_no = i
                            break
                    matches.append({"file": str(f.relative_to(p)), "line": line_no,
                                    "size_bytes": f.stat().st_size})
            except Exception:
                continue

        return {"query": query, "path": str(p), "matches_found": len(matches),
                "matches": matches[:100], "truncated": len(matches) > 100}


@tool_registry.register
class FileInfoTool(BaseTool):
    name = "FILE_INFO"
    description = "Obtiene información detallada de un archivo o directorio."
    category = "file"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="path", description="Ruta del archivo/directorio", param_type=str)]

    def _execute(self, params: dict) -> Any:
        p = _resolve_path(params["path"])
        if not p.exists():
            raise FileNotFoundError(f"No encontrado: {p}")

        stat = p.stat()
        from datetime import datetime, timezone
        info = {
            "path": str(p), "name": p.name, "extension": p.suffix.lower(),
            "is_file": p.is_file(), "is_dir": p.is_dir(),
            "size_bytes": stat.st_size if p.is_file() else None,
            "created": datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            "absolute_path": str(p.resolve()),
        }
        if p.is_dir():
            try:
                info["items_count"] = len(list(p.iterdir()))
            except Exception:
                info["items_count"] = None
        return info
