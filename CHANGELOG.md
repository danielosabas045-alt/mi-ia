# Registro de cambios — OSAIA AI

## 2026-11-13 — Integración semanal

- El flujo de pruebas y publicación ahora se activa también cuando cambia `server/**`, evitando omitir comprobaciones en cambios exclusivos del backend.
- Commit de integración: `321df5b902fdc76de2b25e8c9321b036944b50f2`.
- Ejecución CI, URL pública, proveedor real y APK nueva todavía no verificados. Render requiere autorización.

## 2026-11-13 — Seguridad del backend

- Cuota global de 30 llamadas por minuto y máximo de 3 solicitudes simultáneas por proceso; no sustituye autenticación ni cuotas persistentes.
- Rechazo de tipos de contenido no JSON y manejo de JSON nulo.
- Prueba de regresión con proveedor simulado añadida; ejecución CI pendiente de verificar.
- Sin despliegue público ni APK verificados.

## 2026-11-12 — Web 0.3.1

- Bloqueo de cambios de servidor durante respuestas activas para evitar mezclar orígenes de historial.
- Confirmación explícita al cambiar de backend y antes de dictar audio.
- Límite de 128 KiB para respuestas remotas y validación del tipo JSON; límite de texto también aplicado al dictado.
- Caché estática excluye URLs con parámetros.
- Cinco comprobaciones estáticas de presencia de cambios aprobadas; pruebas de ejecución y despliegue pendientes.
- Sin APK nueva ni backend público verificado.

## 2026-11-11 — Web 0.3.0 (código publicado en GitHub)

### Mejoras reales
- Añadido manifiesto de aplicación web progresiva (PWA) y un ícono vectorial original.
- Añadido service worker que guarda **únicamente archivos estáticos públicos** para permitir cargar la interfaz y ejecutar herramientas locales cuando no haya internet, después de una primera visita con conexión.
- El worker no intercepta ni almacena solicitudes al backend de IA, conversaciones o respuestas.
- Se detectan nuevas versiones al volver a la pestaña y se avisa que hay que recargar para verlas.
- El flujo de GitHub Pages ahora incluye manifiesto, worker e ícono.
- Nueva prueba automatizada para comprobar que el caché no intercepte solicitudes externas, POST ni rutas de API.
- Respaldo previo en la rama `backup/pre-pwa-2026-11-11`.

### Comprobaciones y limitaciones
- 9 verificaciones estáticas y de sintaxis pasaron durante esta actualización.
- **Pendiente:** confirmar el resultado de las pruebas completas en GitHub Actions y el despliegue público; no se pudo verificar la URL pública desde este entorno.
- **Pendiente:** activar GitHub Pages si sigue deshabilitado.
- **Pendiente:** IA generativa real (requiere backend y credenciales seguras) y APK Android compilada.
- La instalación como PWA depende del navegador y sus requisitos; el ícono SVG puede no ser suficiente para todos los dispositivos.

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
