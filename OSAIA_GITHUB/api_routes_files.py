"""
OSAIA API - Rutas de Archivos (FASE 3)
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pathlib import Path
from config_settings import settings

router = APIRouter(prefix="/files", tags=["Archivos"])


def _ensure_tools():
    import tools_file  # noqa: F401
    import tools_archive  # noqa: F401
    from tools_registry import tool_registry
    return tool_registry


@router.get("/list", summary="Listar archivos en un directorio")
async def list_files(path: str = Query("."), recursive: bool = False, pattern: Optional[str] = None):
    tr = _ensure_tools()
    params = {"path": path, "recursive": recursive}
    if pattern:
        params["pattern"] = pattern
    result = tr.execute("FILE_LIST", params)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.get("/read", summary="Leer contenido de un archivo")
async def read_file(path: str = Query(...), encoding: str = "utf-8", max_lines: int = 0):
    tr = _ensure_tools()
    result = tr.execute("FILE_READ", {"path": path, "encoding": encoding, "max_lines": max_lines})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.get("/info", summary="Información de un archivo")
async def file_info(path: str = Query(...)):
    tr = _ensure_tools()
    result = tr.execute("FILE_INFO", {"path": path})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.get("/search", summary="Buscar texto en archivos")
async def search_in_files(query: str = Query(...), path: str = ".",
                          extensions: Optional[str] = None, case_sensitive: bool = False):
    tr = _ensure_tools()
    params = {"query": query, "path": path, "case_sensitive": case_sensitive}
    if extensions:
        params["extensions"] = extensions
    result = tr.execute("FILE_SEARCH", params)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.post("/write", summary="Escribir contenido en un archivo")
async def write_file(path: str = Form(...), content: str = Form(...), mode: str = Form("write")):
    tr = _ensure_tools()
    result = tr.execute("FILE_WRITE", {"path": path, "content": content, "mode": mode})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.post("/upload", summary="Subir archivos")
async def upload_files(files: list[UploadFile] = File(...), subfolder: str = Form("")):
    upload_dir = settings.UPLOADS_PATH / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    uploaded = []
    for file in files:
        file_path = upload_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        uploaded.append({"name": file.filename, "path": str(file_path),
                         "size_bytes": len(content), "content_type": file.content_type})
    return {"uploaded": len(uploaded), "files": uploaded}


@router.delete("/delete", summary="Eliminar un archivo")
async def delete_file(path: str = Query(...), confirm: bool = Query(False)):
    if not confirm:
        raise HTTPException(status_code=400, detail="Se requiere confirmación explícita (confirm=true)")
    tr = _ensure_tools()
    result = tr.execute("FILE_DELETE", {"path": path, "confirm": confirm})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


# ===== ZIP =====
@router.post("/zip/create", summary="Crear archivo ZIP")
async def zip_create(output_path: str = Form(...), source_paths: str = Form(...),
                     compression: str = Form("deflated")):
    tr = _ensure_tools()
    result = tr.execute("ZIP_CREATE", {"output_path": output_path,
                                        "source_paths": source_paths,
                                        "compression": compression})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.post("/zip/extract", summary="Extraer ZIP")
async def zip_extract(zip_path: str = Form(...), extract_to: str = Form("./extracted")):
    tr = _ensure_tools()
    result = tr.execute("ZIP_EXTRACT", {"zip_path": zip_path, "extract_to": extract_to})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


@router.get("/zip/list", summary="Listar contenido de un ZIP")
async def zip_list(zip_path: str = Query(...)):
    tr = _ensure_tools()
    result = tr.execute("ZIP_LIST", {"zip_path": zip_path})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message)
    return result.data


# ===== UNIVERSAL FILE ENGINE =====
@router.get("/detect", summary="Detectar tipo de archivo")
async def detect_file_type(path: str = Query(...)):
    from engines_specialized import UniversalFileEngine
    return UniversalFileEngine.detect(path)


@router.get("/detect/supported", summary="Extensiones soportadas")
async def supported_extensions():
    from engines_specialized import UniversalFileEngine
    return {"extensions": UniversalFileEngine.supported_extensions(),
            "engines": UniversalFileEngine.engines_available()}
