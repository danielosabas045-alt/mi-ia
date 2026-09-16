"""
OSAIA - Herramientas de Archivo (FASE 18)
ZIP_CREATE, ZIP_EXTRACT, ZIP_LIST
"""
from __future__ import annotations
import zipfile
from pathlib import Path
from typing import Any, List
from config_settings import settings
from tools_base import BaseTool, ToolParameter
from tools_registry import tool_registry


def _safe_path(p: str) -> Path:
    path = Path(p).expanduser().resolve()
    base = Path(".").resolve()
    allowed = [base, settings.UPLOADS_PATH.resolve(), settings.OUTPUTS_PATH.resolve(),
               settings.PROJECTS_PATH.resolve(), settings.TEMP_PATH.resolve(),
               settings.ARCHIVES_PATH.resolve() if hasattr(settings, 'ARCHIVES_PATH') else base / "archives"]
    return path


@tool_registry.register
class ZipCreateTool(BaseTool):
    name = "ZIP_CREATE"
    description = "Crea un archivo ZIP comprimido con los archivos/carpetas especificados."
    category = "archive"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="output_path", description="Ruta del archivo ZIP de salida", param_type=str),
                ToolParameter(name="source_paths", description="Lista de rutas a incluir", param_type=str),
                ToolParameter(name="compression", description="Nivel de compresión", param_type=str, required=False, default="deflated",
                              options=["stored", "deflated", "bzip2", "lzma"])]

    def _execute(self, params: dict) -> Any:
        output = _safe_path(params["output_path"])
        output.parent.mkdir(parents=True, exist_ok=True)

        sources = [s.strip() for s in params["source_paths"].split(",") if s.strip()]
        comp_map = {"stored": zipfile.ZIP_STORED, "deflated": zipfile.ZIP_DEFLATED,
                    "bzip2": zipfile.ZIP_BZIP2, "lzma": zipfile.ZIP_LZMA}
        comp = comp_map.get(params.get("compression", "deflated"), zipfile.ZIP_DEFLATED)

        files_added = []
        with zipfile.ZipFile(output, "w", comp) as zf:
            for src in sources:
                src_path = _safe_path(src)
                if not src_path.exists():
                    continue
                if src_path.is_file():
                    zf.write(src_path, arcname=src_path.name)
                    files_added.append({"path": str(src_path), "arcname": src_path.name})
                elif src_path.is_dir():
                    base_dir = src_path.parent
                    for f in src_path.rglob("*"):
                        if f.is_file():
                            arc = str(f.relative_to(base_dir))
                            zf.write(f, arcname=arc)
                            files_added.append({"path": str(f), "arcname": arc})

        return {"output_zip": str(output), "size_bytes": output.stat().st_size,
                "files_added": len(files_added), "compression": params.get("compression", "deflated"),
                "files": files_added}


@tool_registry.register
class ZipExtractTool(BaseTool):
    name = "ZIP_EXTRACT"
    description = "Extrae el contenido de un archivo ZIP en un directorio."
    category = "archive"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="zip_path", description="Ruta del archivo ZIP", param_type=str),
                ToolParameter(name="extract_to", description="Directorio destino", param_type=str, required=False, default="./extracted")]

    def _execute(self, params: dict) -> Any:
        zip_p = _safe_path(params["zip_path"])
        dest = _safe_path(params.get("extract_to", "./extracted"))
        if not zip_p.exists():
            raise FileNotFoundError(f"ZIP no encontrado: {zip_p}")
        dest.mkdir(parents=True, exist_ok=True)

        extracted = []
        with zipfile.ZipFile(zip_p, "r") as zf:
            # Validar paths (prevenir Zip Slip)
            for info in zf.infolist():
                target = (dest / info.filename).resolve()
                if not str(target).startswith(str(dest.resolve())):
                    raise ValueError(f"Path inseguro en ZIP: {info.filename}")
            zf.extractall(dest)
            extracted = zf.namelist()

        return {"zip_path": str(zip_p), "extracted_to": str(dest),
                "files_extracted": len(extracted), "files": extracted[:200]}


@tool_registry.register
class ZipListTool(BaseTool):
    name = "ZIP_LIST"
    description = "Lista el contenido de un archivo ZIP sin extraerlo."
    category = "archive"
    version = "1.0.0"

    def parameters(self) -> List[ToolParameter]:
        return [ToolParameter(name="zip_path", description="Ruta del archivo ZIP", param_type=str)]

    def _execute(self, params: dict) -> Any:
        zip_p = _safe_path(params["zip_path"])
        if not zip_p.exists():
            raise FileNotFoundError(f"ZIP no encontrado: {zip_p}")

        entries = []
        total_size = 0
        total_compressed = 0
        with zipfile.ZipFile(zip_p, "r") as zf:
            for info in zf.infolist():
                entries.append({"name": info.filename, "size_bytes": info.file_size,
                                "compressed_bytes": info.compress_size,
                                "is_dir": info.is_dir(),
                                "modified": f"{info.date_time[0]}-{info.date_time[1]:02d}-{info.date_time[2]:02d}"})
                total_size += info.file_size
                total_compressed += info.compress_size

        ratio = (1 - total_compressed / total_size * 100) if total_size > 0 else 0
        return {"zip_path": str(zip_p), "total_entries": len(entries),
                "total_size_bytes": total_size, "total_compressed_bytes": total_compressed,
                "compression_ratio_pct": round(ratio, 1),
                "entries": entries[:500], "truncated": len(entries) > 500}
