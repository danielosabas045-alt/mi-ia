"""
OSAIA - Motores Especializados (FASES 10-17)
Interfaces y implementaciones básicas para documentos, medios, datos y código.

Cada motor define una interfaz clara. Las implementaciones concretas
usan las librerías correspondientes (python-docx, openpyxl, python-pptx,
PyMuPDF, SQLAlchemy, OpenCV, FFmpeg, etc.) cuando están disponibles.
"""
from __future__ import annotations
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
from utils_logger import get_logger

logger = get_logger("engines")


# ============================================================
# UNIVERSAL FILE ENGINE (FASE 3/14)
# Detecta automáticamente el formato y enruta al motor correcto
# ============================================================
class UniversalFileEngine:
    _EXT_MAP = {
        ".docx": "word", ".doc": "word",
        ".xlsx": "excel", ".xls": "excel", ".csv": "excel",
        ".pptx": "powerpoint", ".ppt": "powerpoint",
        ".pdf": "pdf",
        ".png": "image", ".jpg": "image", ".jpeg": "image", ".gif": "image",
        ".webp": "image", ".bmp": "image", ".svg": "image",
        ".mp4": "video", ".avi": "video", ".mov": "video", ".mkv": "video",
        ".mp3": "audio", ".wav": "audio", ".ogg": "audio", ".flac": "audio",
        ".zip": "archive", ".rar": "archive", ".7z": "archive", ".tar": "archive",
        ".py": "code", ".js": "code", ".ts": "code", ".java": "code",
        ".cpp": "code", ".cs": "code", ".php": "code", ".html": "code",
        ".css": "code", ".sql": "code", ".rs": "code", ".go": "code",
        ".json": "data", ".txt": "text", ".md": "text",
    }

    @classmethod
    def detect(cls, file_path: str) -> Dict[str, Any]:
        p = Path(file_path)
        ext = p.suffix.lower()
        engine = cls._EXT_MAP.get(ext, "unknown")
        exists = p.exists()
        size = p.stat().st_size if exists else 0
        return {"path": str(p), "filename": p.name, "extension": ext,
                "engine": engine, "exists": exists, "size_bytes": size,
                "is_file": p.is_file() if exists else False}

    @classmethod
    def supported_extensions(cls) -> List[str]:
        return sorted(set(cls._EXT_MAP.keys()))

    @classmethod
    def engines_available(cls) -> List[str]:
        return sorted(set(cls._EXT_MAP.values()))


# ============================================================
# WORD ENGINE (FASE 10/16)
# ============================================================
class WordEngine:
    """Motor para crear, leer y editar documentos Word (.docx)."""

    @staticmethod
    def available() -> bool:
        try:
            import docx  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def create(output_path: str, title: str = "", paragraphs: Optional[List[str]] = None,
               author: str = "OSAIA") -> Dict[str, Any]:
        paragraphs = paragraphs or []
        try:
            from docx import Document
            doc = Document()
            if title:
                doc.add_heading(title, level=0)
            core = doc.core_properties
            core.author = author
            core.title = title
            for p in paragraphs:
                doc.add_paragraph(p)
            doc.save(output_path)
            size = Path(output_path).stat().st_size
            return {"success": True, "path": output_path, "size_bytes": size,
                    "paragraphs": len(paragraphs), "title": title}
        except ImportError:
            # Fallback: crear un archivo de texto simple con extensión .docx no válido
            # En su lugar, creamos un HTML convertible a Word
            html = f"<html><head><title>{title}</title></head><body>"
            if title:
                html += f"<h1>{title}</h1>"
            for p in paragraphs:
                html += f"<p>{p}</p>"
            html += "</body></html>"
            txt_path = str(Path(output_path).with_suffix(".html"))
            Path(txt_path).write_text(html, encoding="utf-8")
            return {"success": True, "note": "python-docx no disponible, creado como HTML",
                    "path": txt_path, "paragraphs": len(paragraphs)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def read(file_path: str) -> Dict[str, Any]:
        try:
            from docx import Document
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            tables = []
            for table in doc.tables:
                tbl = []
                for row in table.rows:
                    tbl.append([cell.text for cell in row.cells])
                tables.append(tbl)
            return {"success": True, "paragraphs": paragraphs, "paragraph_count": len(paragraphs),
                    "tables": tables, "table_count": len(tables),
                    "core_properties": {
                        "author": doc.core_properties.author,
                        "title": doc.core_properties.title,
                        "subject": doc.core_properties.subject,
                    }}
        except ImportError:
            return {"success": False, "error": "python-docx no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# EXCEL ENGINE (FASE 11/17)
# ============================================================
class ExcelEngine:
    """Motor para crear, leer y editar hojas de cálculo Excel (.xlsx)."""

    @staticmethod
    def available() -> bool:
        try:
            import openpyxl  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def create(output_path: str, sheets: Optional[Dict[str, List[List[Any]]]] = None) -> Dict[str, Any]:
        sheets = sheets or {"Hoja1": [["Columna 1", "Columna 2"], ["Valor 1", "Valor 2"]]}
        try:
            from openpyxl import Workbook
            wb = Workbook()
            first = True
            for sheet_name, data in sheets.items():
                if first:
                    ws = wb.active
                    ws.title = sheet_name
                    first = False
                else:
                    ws = wb.create_sheet(sheet_name)
                for row in data:
                    ws.append(row)
            wb.save(output_path)
            size = Path(output_path).stat().st_size
            return {"success": True, "path": output_path, "size_bytes": size,
                    "sheets": list(sheets.keys()),
                    "rows_per_sheet": {k: len(v) for k, v in sheets.items()}}
        except ImportError:
            # Fallback: CSV
            csv_path = str(Path(output_path).with_suffix(".csv"))
            lines = []
            for sheet_name, data in sheets.items():
                lines.append(f"# Hoja: {sheet_name}")
                for row in data:
                    lines.append(",".join(str(c) for c in row))
            Path(csv_path).write_text("\n".join(lines), encoding="utf-8")
            return {"success": True, "note": "openpyxl no disponible, creado como CSV",
                    "path": csv_path}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def read(file_path: str) -> Dict[str, Any]:
        try:
            from openpyxl import load_workbook
            wb = load_workbook(file_path, data_only=True)
            sheets_data = {}
            for sheet_name in wb.sheetnames:
                ws = wb[sheet_name]
                rows = []
                for row in ws.iter_rows(values_only=True):
                    rows.append(list(row))
                sheets_data[sheet_name] = rows
            return {"success": True, "sheets": wb.sheetnames, "data": sheets_data,
                    "total_cells": sum(len(r) for s in sheets_data.values() for r in s)}
        except ImportError:
            return {"success": False, "error": "openpyxl no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# POWERPOINT ENGINE (FASE 12)
# ============================================================
class PowerPointEngine:
    """Motor para crear presentaciones PowerPoint (.pptx)."""

    @staticmethod
    def available() -> bool:
        try:
            import pptx  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def create(output_path: str, slides: Optional[List[Dict[str, str]]] = None,
               title: str = "Presentación OSAIA") -> Dict[str, Any]:
        slides = slides or [
            {"title": title, "subtitle": "Generada por OSAIA"},
            {"title": "Contenido", "content": "Diapositiva de ejemplo"},
        ]
        try:
            from pptx import Presentation
            prs = Presentation()
            for i, slide_data in enumerate(slides):
                if i == 0:
                    layout = prs.slide_layouts[0]
                else:
                    layout = prs.slide_layouts[1]
                slide = prs.slides.add_slide(layout)
                if "title" in slide_data:
                    slide.shapes.title.text = slide_data["title"]
                if "subtitle" in slide_data and len(slide.placeholders) > 1:
                    slide.placeholders[1].text = slide_data["subtitle"]
                elif "content" in slide_data and len(slide.placeholders) > 1:
                    slide.placeholders[1].text = slide_data["content"]
            prs.save(output_path)
            size = Path(output_path).stat().st_size
            return {"success": True, "path": output_path, "size_bytes": size,
                    "slides_count": len(slides)}
        except ImportError:
            return {"success": False, "error": "python-pptx no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# PDF ENGINE (FASE 10)
# ============================================================
class PdfEngine:
    """Motor para leer y analizar archivos PDF."""

    @staticmethod
    def available() -> bool:
        try:
            import fitz  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def read(file_path: str) -> Dict[str, Any]:
        try:
            import fitz
            doc = fitz.open(file_path)
            pages_text = []
            total_text = ""
            for page in doc:
                text = page.get_text()
                pages_text.append({"page": page.number + 1, "text": text})
                total_text += text + "\n"
            metadata = dict(doc.metadata) if doc.metadata else {}
            return {"success": True, "page_count": len(doc),
                    "total_characters": len(total_text),
                    "metadata": metadata, "pages": pages_text[:20],
                    "truncated": len(pages_text) > 20,
                    "full_text": total_text[:50000]}
        except ImportError:
            return {"success": False, "error": "PyMuPDF no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def extract_images(file_path: str, output_dir: str) -> Dict[str, Any]:
        try:
            import fitz
            doc = fitz.open(file_path)
            out = Path(output_dir)
            out.mkdir(parents=True, exist_ok=True)
            images = []
            for page_num, page in enumerate(doc):
                for img_index, img in enumerate(page.get_images(full=True)):
                    xref = img[0]
                    base = doc.extract_image(xref)
                    img_bytes = base["image"]
                    img_ext = base["ext"]
                    img_path = out / f"page{page_num + 1}_img{img_index + 1}.{img_ext}"
                    img_path.write_bytes(img_bytes)
                    images.append(str(img_path))
            return {"success": True, "images_extracted": len(images), "paths": images}
        except ImportError:
            return {"success": False, "error": "PyMuPDF no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# DATABASE ENGINE (FASE 16)
# ============================================================
class DatabaseEngine:
    """Motor para bases de datos SQLite y PostgreSQL."""

    @staticmethod
    def available() -> bool:
        try:
            import sqlalchemy  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def available() -> bool:
        try:
            import sqlalchemy  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def create_sqlite(db_path: str, tables: Optional[Dict[str, Dict[str, str]]] = None) -> Dict[str, Any]:
        tables = tables or {
            "entities": "id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        }
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            created = []
            for table_name, schema in tables.items():
                cursor.execute(f"CREATE TABLE IF NOT EXISTS {table_name} ({schema})")
                created.append(table_name)
            conn.commit()
            conn.close()
            return {"success": True, "path": db_path, "tables_created": created,
                    "engine": "sqlite"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def generate_schema_sql(tables: Dict[str, Dict[str, str]]) -> str:
        lines = ["-- Esquema generado por OSAIA", ""]
        for table_name, columns in tables.items():
            lines.append(f"CREATE TABLE IF NOT EXISTS {table_name} (")
            col_lines = []
            for col_name, col_def in columns.items():
                col_lines.append(f"    {col_name} {col_def}")
            lines.append(",\n".join(col_lines))
            lines.append(");\n")
        return "\n".join(lines)


# ============================================================
# CODE ENGINE (FASE 17)
# ============================================================
class CodeEngine:
    """Motor para análisis y ejecución segura de código."""

    @staticmethod
    def available() -> bool:
        return True  # Análisis sintáctico no requiere dependencias extra

    @staticmethod
    def analyze(code: str, language: str = "python") -> Dict[str, Any]:
        lines = code.splitlines()
        functions = []
        classes = []
        imports = []

        if language == "python":
            import re
            for line in lines:
                s = line.strip()
                if s.startswith("def "):
                    m = re.match(r"def\s+(\w+)", s)
                    if m:
                        functions.append(m.group(1))
                elif s.startswith("class "):
                    m = re.match(r"class\s+(\w+)", s)
                    if m:
                        classes.append(m.group(1))
                elif s.startswith("import ") or s.startswith("from "):
                    imports.append(s)

        return {"success": True, "language": language,
                "lines_count": len(lines), "characters": len(code),
                "functions": functions, "classes": classes, "imports": imports,
                "empty_lines": sum(1 for l in lines if not l.strip()),
                "comment_lines": sum(1 for l in lines if l.strip().startswith("#") or l.strip().startswith("//"))}

    @staticmethod
    def create_project_structure(project_name: str, structure: Dict[str, Any]) -> Dict[str, Any]:
        base = Path(project_name)
        created = []

        def _create(path: Path, content: Any):
            if isinstance(content, dict):
                path.mkdir(parents=True, exist_ok=True)
                created.append(f"DIR: {path}")
                for name, sub in content.items():
                    _create(path / name, sub)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(str(content), encoding="utf-8")
                created.append(f"FILE: {path}")

        _create(base, structure)
        return {"success": True, "project_name": project_name,
                "items_created": len(created), "structure": created}


# ============================================================
# IMAGE ENGINE (FASE 13) — Interfaz
# ============================================================
class ImageEngine:
    """Motor para análisis y procesamiento de imágenes."""

    @staticmethod
    def available() -> bool:
        try:
            import cv2  # noqa: F401
            from PIL import Image  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def analyze(file_path: str) -> Dict[str, Any]:
        try:
            from PIL import Image
            img = Image.open(file_path)
            return {"success": True, "format": img.format, "mode": img.mode,
                    "width": img.width, "height": img.height,
                    "aspect_ratio": round(img.width / img.height, 3),
                    "pixels": img.width * img.height,
                    "info": {k: str(v) for k, v in img.info.items()}}
        except ImportError:
            return {"success": False, "error": "Pillow no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def resize(file_path: str, output_path: str,
               width: int, height: int) -> Dict[str, Any]:
        try:
            from PIL import Image
            img = Image.open(file_path)
            img = img.resize((width, height), Image.LANCZOS)
            img.save(output_path)
            return {"success": True, "output": output_path,
                    "new_size": {"width": width, "height": height}}
        except ImportError:
            return {"success": False, "error": "Pillow no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# AUDIO ENGINE (FASE 14) — Interfaz
# ============================================================
class AudioEngine:
    """Motor para procesamiento de audio."""

    @staticmethod
    def available() -> bool:
        try:
            import pydub  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def analyze(file_path: str) -> Dict[str, Any]:
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(file_path)
            return {"success": True, "duration_seconds": len(audio) / 1000,
                    "channels": audio.channels, "sample_width": audio.sample_width,
                    "frame_rate": audio.frame_rate, "frame_count": audio.frame_count(),
                    "dBFS": round(audio.dBFS, 2), "max_dBFS": round(audio.max_dBFS, 2)}
        except ImportError:
            return {"success": False, "error": "pydub no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# VIDEO ENGINE (FASE 15) — Interfaz
# ============================================================
class VideoEngine:
    """Motor para procesamiento de video."""

    @staticmethod
    def available() -> bool:
        try:
            import cv2  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def analyze(file_path: str) -> Dict[str, Any]:
        try:
            import cv2
            cap = cv2.VideoCapture(file_path)
            if not cap.isOpened():
                return {"success": False, "error": "No se pudo abrir el video"}
            fps = cap.get(cv2.CAP_PROP_FPS)
            frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            cap.release()
            return {"success": True, "fps": round(fps, 2), "total_frames": frames,
                    "duration_seconds": round(frames / fps, 2) if fps else 0,
                    "resolution": {"width": width, "height": height},
                    "codec": int(cap.get(cv2.CAP_PROP_FOURCC))}
        except ImportError:
            return {"success": False, "error": "OpenCV no instalado"}
        except Exception as e:
            return {"success": False, "error": str(e)}
