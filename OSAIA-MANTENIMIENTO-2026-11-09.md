# OSAIA AI — Registro de mantenimiento

## 2026-11-09 — v6.0.1 (preparación)

Se preparó localmente el paquete de código `OSAIA-AI-v6.0.1-CODIGO-MANTENIMIENTO.zip` y un parche de cambios. **El código fuente de esa versión aún no está publicado en este repositorio.**

Cambios reportados en el paquete local:
- Validación del tamaño de solicitudes y fotografías (límite reportado: 14 MB).
- Mejor manejo de errores para reducir exposición de claves API.
- Exclusión de claves privadas de firma y contraseñas del paquete compartible.
- Ajuste de versión a 6.0.1 (`versionCode 61`).
- Comprobaciones de sintaxis JavaScript y XML; 17 pruebas automatizadas reportadas como aprobadas.

### Pendientes
- Importar y verificar el código fuente completo en GitHub.
- Ejecutar pruebas de navegador y compilación Android.
- Generar, firmar e instalar APK verificable.
- Confirmar pruebas en Samsung Galaxy A53.

**Importante:** esta entrada documenta trabajo local previo; no afirma que el código esté ya integrado o que exista una APK nueva. No publicar keystores, contraseñas ni claves API.
