FROM python:3.11-slim

LABEL org.opencontainers.image.title="OSAIA"
LABEL org.opencontainers.image.description="General Purpose AI Operating System"
LABEL org.opencontainers.image.version="0.2.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ffmpeg libmagic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiar TODOS los archivos planos
COPY *.py ./
COPY *.html ./
COPY *.css ./
COPY *.js ./
COPY .env.example ./.env.example

RUN mkdir -p storage uploads outputs projects archives cache temporary

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health/ping || exit 1

RUN useradd -m osaia && chown -R osaia:osaia /app
USER osaia

CMD ["uvicorn", "api_main:app", "--host", "0.0.0.0", "--port", "8000"]
