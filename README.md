# OSAIA AI — Web + Android (en desarrollo)

OSAIA AI es un proyecto de asistente en español. La **interfaz web** está en la raíz del repositorio y se puede servir como sitio estático; el **backend de IA** es un servicio separado para proteger las claves. El proyecto Android v6.0.1 se mantiene como objetivo, pero **su código completo todavía no está integrado en este repositorio**.

## Estado real (10 de noviembre de 2026)

- **Web 0.2.0:** interfaz de chat adaptable a celular, conversaciones locales, exportación JSON, dictado cuando el navegador lo permite, lectura en voz alta, comandos locales, ajustes y conexión opcional a un backend HTTPS.
- **IA generativa:** no está conectada de fábrica. No hay respuestas inventadas. Para habilitarla hay que desplegar un backend y configurar credenciales exclusivamente en el servidor.
- **GitHub Pages:** el flujo de despliegue está preparado en .github/workflows/pages.yml, pero la URL pública **no debe darse por activa** hasta verificar el despliegue. Si aparece 404, habilitar Pages en los ajustes del repositorio.
- **APK Android:** pendiente de compilación, firma y prueba real. No se ha publicado una APK nueva.

## Publicar la web

1. Ir a **Settings → Pages** en este repositorio.
2. En **Build and deployment → Source**, elegir **GitHub Actions**.
3. Abrir la pestaña **Actions**, ejecutar o reintentar el flujo **OSAIA AI — probar y publicar web** y comprobar que finalice correctamente.
4. Comprobar en un navegador la URL https://danielosabas045-alt.github.io/mi-ia/. El sitio solo está publicado cuando se carga realmente.

En cada actualización de main, el flujo comprueba el JavaScript y ejecuta las pruebas antes de publicar los archivos estáticos. GitHub Pages **no puede alojar** el backend Node ni guardar claves de API privadas.

## Herramientas locales reales

En el chat se pueden escribir comandos:

- /ayuda
- /contar texto
- /mayusculas texto
- /minusculas texto
- /invertir texto
- /json {"nombre":"OSAIA"}
- /fecha

Estas funciones se ejecutan en el navegador, no son IA generativa. El historial queda en localStorage del dispositivo, con opción de exportación; borrar datos del navegador puede eliminarlo.

## Backend de IA (opcional)

Archivo: server/server.cjs. Requiere Node.js 20+ y un hosting HTTPS para servicios web (por ejemplo, Render). Configurar **en el servidor**, nunca en el repositorio ni en el navegador:

- OPENAI_API_KEY: clave privada del proveedor.
- ALLOWED_ORIGIN: https://danielosabas045-alt.github.io
- OSAIA_MODEL: opcional, predeterminado gpt-4.1-mini.
- PORT: lo proporciona el hosting.

Comando de inicio: node server/server.cjs.

El backend ofrece GET /health y POST /api/chat. Ejemplo de solicitud:

~~~json
{"messages":[{"role":"user","content":"Hola OSAIA"}]}
~~~

Respuesta válida:

~~~json
{"reply":"¡Hola! ¿En qué te ayudo?"}
~~~

Una vez desplegado, abrir **Ajustes** en la web e introducir la URL completa https://TU-BACKEND/api/chat. La web no almacena claves de API. Los mensajes de comandos locales y los enviados a otro backend no se mezclan en las solicitudes de IA.

**Seguridad antes de abrir el backend al público:** el limitador de solicitudes incluido es básico y en memoria. Agregar cuotas por usuario, protección contra abuso, límites de gasto del proveedor, monitoreo, y controles de acceso si corresponde. No desplegar una clave sin estos controles en un servicio abierto.

## Comprobaciones

En un entorno con Node.js 20+:

~~~bash
node --check app.js
node --check server/server.cjs
node --test tests/*.test.cjs
~~~

Los tests cubren referencias DOM, CSP, ausencia de claves en el frontend, validación de mensajes y comportamiento del backend sin credenciales. El despliegue público y el funcionamiento con un modelo real necesitan verificación adicional.

## Historial

Ver [CHANGELOG.md](CHANGELOG.md). Para reportar errores, usar Issues de GitHub.
