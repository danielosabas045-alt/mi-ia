# Registro de cambios — OSAIA AI

## 2026-11-10 — Web 0.2.0 (código en GitHub)

### Interfaz y funciones
- Nueva interfaz de chat adaptable a móvil y escritorio, con menú lateral y estado real de conexión.
- Historial de conversaciones guardado localmente, creación, selección, eliminación y limpieza.
- Exportación de conversaciones en JSON y copia de mensajes.
- Comandos locales funcionales: /ayuda, /contar, /mayusculas, /minusculas, /invertir, /json y /fecha.
- Dictado por voz si el navegador admite SpeechRecognition y lectura de respuestas con SpeechSynthesis.
- Configuración de URL HTTPS para un backend de IA propio, sin incrustar claves API.
- Errores de red y tiempos de espera explícitos; botón para detener solicitudes.

### Seguridad y privacidad
- Política de seguridad de contenido (CSP), sin scripts ni manejadores de eventos en línea.
- Renderizado de mensajes con textContent para evitar ejecutar HTML de usuarios.
- Fetch sin cookies ni referencia de navegación y con validación HTTPS.
- Los comandos locales y las conversaciones dirigidas a otro backend no se envían al backend configurado.
- Backend Node separado con CORS restringido, validación de mensajes, límite de tamaño y limitador básico por IP.
- Ninguna clave privada incluida en el repositorio.

### Pruebas y despliegue
- Añadidas pruebas automáticas de sintaxis, referencias de la interfaz, seguridad y backend sin clave.
- Añadido flujo GitHub Actions para comprobar y desplegar los archivos estáticos con Pages.
- Comprobación manual del código mediante análisis sintáctico y pruebas de lógica local: aprobadas.
- **Pendiente:** confirmar ejecución exitosa del flujo CI y verificar que GitHub Pages responda sin 404.
- **Pendiente:** desplegar y probar el backend real con credenciales seguras; no se ha conectado IA generativa.
- **Pendiente:** pruebas de navegador y APK Android.

## 2026-11-09 — Android 6.0.1 (paquete local previo)

Se preparó un parche de mantenimiento de Android v6.0.1 con validación de payloads de 14 MB y redacción de claves en errores. El código Android completo y la APK de esa versión **no están publicados aquí**; consultar OSAIA-MANTENIMIENTO-2026-11-09.md.
