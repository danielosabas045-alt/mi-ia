"""
OSAIA - Configuración Global
Gestiona variables de entorno y parámetros de la plataforma.
"""
from __future__ import annotations
from pathlib import Path
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8",
        case_sensitive=True, extra="ignore",
    )

    # Aplicación
    APP_NAME: str = "OSAIA"
    APP_VERSION: str = "0.2.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "cambia-esta-clave-en-produccion"

    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "*"]

    # Modelos
    DEFAULT_MODEL: str = "local-mock"
    MODEL_TEMPERATURE: float = 0.7
    MODEL_MAX_TOKENS: int = 4096

    # Proveedores
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None

    # Base de datos
    DATABASE_URL: str = "sqlite:///./storage/osaia.db"
    REDIS_URL: Optional[str] = None

    # Almacenamiento
    STORAGE_PATH: Path = Path("./storage")
    UPLOADS_PATH: Path = Path("./uploads")
    OUTPUTS_PATH: Path = Path("./outputs")
    PROJECTS_PATH: Path = Path("./projects")
    TEMP_PATH: Path = Path("./temporary")
    CACHE_PATH: Path = Path("./cache")

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"

    # Seguridad
    MAX_UPLOAD_SIZE_MB: int = 100
    SESSION_TIMEOUT_MINUTES: int = 120

    def ensure_directories(self) -> None:
        for d in [self.STORAGE_PATH, self.UPLOADS_PATH, self.OUTPUTS_PATH,
                  self.PROJECTS_PATH, self.TEMP_PATH, self.CACHE_PATH]:
            d.mkdir(parents=True, exist_ok=True)

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
settings.ensure_directories()
