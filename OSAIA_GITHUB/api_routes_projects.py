"""
OSAIA API - Rutas de Proyectos
Espacio de trabajo por proyecto: archivos, tareas, memoria, configuración.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from config_settings import settings

router = APIRouter(prefix="/projects", tags=["Proyectos"])

PROJECTS_DIR = settings.PROJECTS_PATH


def _project_path(project_id: str) -> Path:
    return PROJECTS_DIR / project_id


def _load_meta(project_id: str) -> Optional[Dict[str, Any]]:
    meta_file = _project_path(project_id) / "project_meta.json"
    if meta_file.exists():
        return json.loads(meta_file.read_text(encoding="utf-8"))
    return None


def _save_meta(project_id: str, meta: Dict[str, Any]) -> None:
    meta_file = _project_path(project_id) / "project_meta.json"
    meta_file.write_text(json.dumps(meta, indent=2, ensure_ascii=False, default=str),
                         encoding="utf-8")


@router.post("", summary="Crear un nuevo proyecto")
async def create_project(name: str = Query(...), description: str = Query(""),
                         user_id: Optional[str] = None):
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    proj_dir = _project_path(project_id)
    proj_dir.mkdir(parents=True, exist_ok=True)
    # Crear subcarpetas estándar
    for sub in ["files", "outputs", "tasks", "database", "notes"]:
        (proj_dir / sub).mkdir(exist_ok=True)

    meta = {
        "project_id": project_id, "name": name, "description": description,
        "user_id": user_id, "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "settings": {"language": "es", "theme": "monochrome", "default_file_format": "docx"},
        "members": [{"user_id": user_id, "role": "owner"}] if user_id else [],
        "stats": {"files_count": 0, "tasks_count": 0, "outputs_count": 0},
    }
    _save_meta(project_id, meta)
    return {"status": "created", "project": meta}


@router.get("", summary="Listar proyectos")
async def list_projects(user_id: Optional[str] = None):
    projects = []
    if not PROJECTS_DIR.exists():
        return {"total": 0, "projects": []}
    for d in PROJECTS_DIR.iterdir():
        if d.is_dir():
            meta = _load_meta(d.name)
            if meta:
                if user_id and meta.get("user_id") != user_id:
                    continue
                projects.append(meta)
    projects.sort(key=lambda p: p.get("created_at", ""), reverse=True)
    return {"total": len(projects), "projects": projects}


@router.get("/{project_id}", summary="Obtener detalle de un proyecto")
async def get_project(project_id: str):
    meta = _load_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return meta


@router.put("/{project_id}", summary="Actualizar un proyecto")
async def update_project(project_id: str, updates: Dict[str, Any]):
    meta = _load_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    protected = {"project_id", "created_at"}
    for key, value in updates.items():
        if key not in protected:
            meta[key] = value
    meta["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_meta(project_id, meta)
    return {"status": "updated", "project": meta}


@router.delete("/{project_id}", summary="Eliminar un proyecto")
async def delete_project(project_id: str, confirm: bool = Query(False)):
    if not confirm:
        raise HTTPException(status_code=400, detail="Se requiere confirmación (confirm=true)")
    import shutil
    proj_dir = _project_path(project_id)
    if not proj_dir.exists():
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    shutil.rmtree(proj_dir)
    return {"status": "deleted", "project_id": project_id}


@router.get("/{project_id}/files", summary="Listar archivos del proyecto")
async def list_project_files(project_id: str, subfolder: str = "files"):
    proj_dir = _project_path(project_id) / subfolder
    if not proj_dir.exists():
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")
    entries = []
    for f in proj_dir.rglob("*"):
        if f.is_file():
            entries.append({"name": f.name, "path": str(f.relative_to(_project_path(project_id))),
                            "size_bytes": f.stat().st_size, "extension": f.suffix.lower()})
    return {"project_id": project_id, "subfolder": subfolder, "files": entries}


@router.get("/{project_id}/settings", summary="Obtener configuración del proyecto")
async def get_project_settings(project_id: str):
    meta = _load_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return {"project_id": project_id, "settings": meta.get("settings", {})}


@router.put("/{project_id}/settings", summary="Actualizar configuración")
async def update_project_settings(project_id: str, settings_update: Dict[str, Any]):
    meta = _load_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    if "settings" not in meta:
        meta["settings"] = {}
    meta["settings"].update(settings_update)
    meta["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_meta(project_id, meta)
    return {"status": "updated", "settings": meta["settings"]}
